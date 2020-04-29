from flask import Flask, render_template, g, request
from flask_sqlalchemy import SQLAlchemy
import iex_calls
import pandas as pd
import numpy as np
import datetime
import pandas_market_calendars as mcal
app = Flask(__name__, static_folder="static/dist", template_folder="static")
app.config['TEMPLATES_AUTO_RELOAD'] = True


app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///db.sqlite3'
db = SQLAlchemy(app)
user_id = 1
# Helper function that returns the sqlite database
def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = SQLAlchemy(app)
    return db

# Code to shut down database when closed? Not completely sure yet
@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

def get_portfolio_value(datetime, user_id, freq):
    table = 'daily_prices'
    if freq == 'intraday':
        table = 'intraday_prices'

    portfolio = pd.read_sql_query('''SELECT recent_hold.ticker, recent_hold.quantity, latest_prices.price, 
        latest_prices.time, recent_hold.quantity*latest_prices.price as total_value
        FROM
        (SELECT user_id, ticker, quantity, MAX(time) from holdings where user_id = :user_id and time <= :time group by ticker) recent_hold,
        (SELECT ticker, price, MAX(time) as time from {} where time <= :time group by ticker) latest_prices
        WHERE recent_hold.ticker = latest_prices.ticker;
        '''.format(table),db.engine, params = {'user_id':user_id, 'time': datetime})
    print(portfolio)
    return portfolio

def efficient_user_value(opening_time, user_id, freq):    
    #list_of_initial_holdings = "select ticker, quantity, max(time) as time from holdings where user_id = :user_id and time <= :initial_time group by ticker;"
    #list_of_holdings_changes = "select ticker, quantity, time from holdings where user_id = :user_id and time > :initial_time;"
    #initial_prices = "select ticker, price, max(time) as time from intraday_prices where time <= :time group by ticker"
    table = 'daily_prices'
    if freq == 'intraday':
        table = 'intraday_prices'
    init_hold  = pd.read_sql_query('''SELECT ticker, quantity, max(time) as time 
    from holdings 
    where user_id = :user_id 
    and time <= :initial_time 
    group by ticker;
    ''', db.engine, params = {'user_id':user_id, 'initial_time': opening_time})
    #print(init_hold)
    changes_in_hold  = pd.read_sql_query('''SELECT ticker, quantity, time 
    from holdings 
    where user_id = :user_id 
    and time > :initial_time;
    ''', db.engine, params = {'user_id':user_id, 'initial_time': opening_time})
    #print(changes_in_hold)

    init_price = pd.read_sql_query('''select ticker, price, max(time) as time from {} where time <= :initial_time group by ticker;
    '''.format(table), db.engine, params = {'initial_time': opening_time}) 
    init_price = init_price.pivot(index = 'time', columns = 'ticker', values = 'price')
    
    changes_in_price  = pd.read_sql_query('''select ticker, price, time from {} where time > :initial_time
    '''.format(table), db.engine, params = {'initial_time': opening_time})
    reformatted = changes_in_price.pivot(index = 'time', columns = 'ticker', values = 'price')

    # Fills in gaps in intraday prices with most recent available price
    for ticker in reformatted.iloc[0].index:
        if np.isnan(reformatted.iloc[0][ticker]):
            reformatted.iloc[0][ticker] = init_price[ticker]
    reformatted.fillna(method='ffill', inplace = True)
    return reformatted[init_hold['ticker']].dot(init_hold['quantity'].values)
    
# Schemas for each table in the sqlite database
class user_account(db.Model):
    id = db.Column(db.Integer, primary_key =True, nullable = False)
    user_name = db.Column(db.String(100), unique=True, nullable=False)
    email = db.Column(db.String(255), unique=True)
    password = db.Column(db.String(200), nullable = False)
    

class daily_prices(db.Model):
    id = db.Column(db.Integer, primary_key =True, nullable = False)
    ticker = db.Column(db.String(255), nullable=False)
    price = db.Column(db.Float, nullable=False)
    time = db.Column(db.DateTime, nullable = False)

class intraday_prices(db.Model):
    id = db.Column(db.Integer, primary_key =True, nullable = False)
    ticker = db.Column(db.String(255), nullable=False)
    price = db.Column(db.Float, nullable=False)
    time = db.Column(db.DateTime, nullable = False)


class holdings(db.Model):
    id = db.Column(db.Integer, primary_key =True, nullable = False)
    user_id = db.Column(db.Integer, nullable = False)
    ticker = db.Column(db.String(255), nullable=False)
    quantity = db.Column(db.Float)
    time = db.Column(db.DateTime, nullable = False)

class risk_stats(db.Model):
    id = db.Column(db.Integer, primary_key =True, nullable = False)
    ticker = db.Column(db.String(255), nullable=False)
    std_dev = db.Column(db.Float)
    beta = db.Column(db.Float)
    time = db.Column(db.DateTime)


@app.route("/")
def index():
    print(user_id)
    return render_template("index.html")

# TODO Add in functionality for intraday prices
@app.route("/visualize")
def visualize():
    timer = datetime.datetime.now()
    nyse = mcal.get_calendar('NYSE')
    today = datetime.date.today()
    trading_dates = nyse.schedule(start_date=iex_calls.month_before(today), end_date=today)
    freq = 'monthly'
    portfolio_dates = []
    portfolio_values = []
    date_list = []
    
    if user_id is not None:
        if freq == 'intraday':
            date_list = [trading_dates.market_open[-1] + datetime.timedelta(minutes=5*x) for x in range(0, 79)]
        elif freq == 'monthly':
            date_list = trading_dates.market_close
        else:
            return "invalid frequency"
        for date in date_list:
            print(date)
            port_value = get_portfolio_value(date.to_pydatetime()+datetime.timedelta(seconds=1), user_id, freq)
            portfolio_dates.append(date.to_pydatetime())
            portfolio_values.append(port_value['total_value'].sum())

        portfolio_history = pd.DataFrame({'dates':portfolio_dates, 'values': portfolio_values})
        print(datetime.datetime.now() - timer)
        return portfolio_history.to_json(orient='index')
    else:
        print('user_id is none here!')
        return {}

# TODO Add in functionality for intraday prices
@app.route("/visualizeTest")
def visualizeTest():
    timer = datetime.datetime.now()
    nyse = mcal.get_calendar('NYSE')
    today = datetime.date.today()
    trading_dates = nyse.schedule(start_date=iex_calls.month_before(today), end_date=today)
    freq = 'intraday'
    if user_id is not None:
        portfolio_history = efficient_user_value(trading_dates.market_open[-1].to_pydatetime(), user_id, freq)
        print(datetime.datetime.now() - timer)
        return portfolio_history.to_json(orient='index')
    else:
        print('user_id is none here!')
        return {}

# TODO add in functionality for intraday prices
# TODO be able to choose different benchmarks
# TODO potentially make the database queries more robust to time zone differences. Would need to sit down and think theoretically about most efficient db / api setup
@app.route("/visualizeBenchmark")
def visualizeBenchmark():
    # code for just the benchmark's raw price
    benchmark = 'SPY'
    nyse = mcal.get_calendar('NYSE')
    today = datetime.date.today()
    trading_dates = nyse.schedule(start_date=iex_calls.month_before(today), end_date=today)
    freq = 'monthly'
    initial_port = pd.DataFrame
    
    if user_id is not None:
        if freq == 'intraday':
            print(trading_dates.market_open[-1].to_pydatetime())
            df = pd.read_sql_query(''' SELECT time, price from intraday_prices
            WHERE ticker = :ticker
            AND time >= :start
            ''', db.engine, params={'ticker': benchmark, 'start':trading_dates.index[-1].to_pydatetime()})
            initial_port = get_portfolio_value(trading_dates.market_open[-1].to_pydatetime()+datetime.timedelta(seconds=1), user_id, 'intraday')
        elif freq == 'monthly':
            print(trading_dates)
            df = pd.read_sql_query(''' SELECT time, price from daily_prices
            WHERE ticker = :ticker
            AND time >= :start
            AND time <= :end
            ''', db.engine, params={'ticker': benchmark, 'start':trading_dates.index[0].to_pydatetime(), 'end':trading_dates.index[-1].to_pydatetime()})
            # code to track portfolio value if you invested portfolio value into benchmark 
            initial_port = get_portfolio_value(trading_dates.market_close[0].to_pydatetime(), user_id, 'monthly')
        

        if df.empty:
            return {}
        df['price'] = df['price']*initial_port['total_value'].sum()/df['price'][0]
        return df.to_json(orient='index')
    else:
        print('user_id is none here!')
        return {}

# TODO route to homepage if signup successful and display error message if not
@app.route("/login", methods=["GET","POST"])
def login():
    if request.method == "POST":
        global user_id
        login_info = pd.read_sql_query('''SELECT id 
        FROM user_account 
        WHERE user_name = :username 
        AND password = :password''', db.engine, params = {'username': request.json['username'], 'password':request.json['password']})
        if login_info.empty:
            print("invalid password or username")
        else:
            user_id = int(login_info['id'][0])
        print(user_id)
        return 'logged in'

# TODO route to homepage if signup successful and display error message if not
@app.route("/logout", methods=["GET"])
def logout():
    if request.method == "GET":
        global user_id
        user_id = None
        print('user_id is now none')
        return 'log out done'

@app.route("/signup", methods=["GET","POST"])
def signup():
    if request.method == "POST":
        new_user = pd.DataFrame({'user_name': [request.json['username']], 'password': [request.json['password']]})
        new_user.to_sql(name='user_account', con = db.engine, index=False, if_exists= 'append')
        return 'signup done'

# GET request returns a pandas dataframe of the user's most recent holdings with prices
# POST request stores a row with passed in ticker and quantity and current time
# TODO maybe add a row for cash and update cash as necessary
@app.route("/holdings", methods=["GET","POST"])
def holdings():
    if request.method == "POST":
        # if adding:
        #   request.params = {ticker: ticker_field.text, quantity: quantity_field.text, user_id: config.id}
        # if removing all with x button:
        #   request.params = {ticker: 'FB', quantity: -FB.quantity, user_id: config.id}
        # if removing some with direct quantity input:
        #   request.params = {ticker: 'FB', quantity: new FB.quantity - old FB.quantity, } 
        #
        if user_id is not None:
            new_holding = pd.DataFrame({'user_id':[user_id],'ticker': [request.json['ticker']], 'quantity': [request.json['quantity']], 'time': [datetime.datetime.now()]})
            new_holding.to_sql(name='holdings', con = db.engine, index=False, if_exists= 'append')
            new_holding_price = user_portfolio = pd.read_sql_query('''
            SELECT ticker, price, MAX(time) as time from intraday_prices where ticker = :ticker;
            ''',db.engine, params={'ticker': request.json['ticker']}, parse_dates=['time'])
            most_recent = new_holding_price['time'][0]
            if most_recent < datetime.date.today() or pd.isnull(most_recent):
                return("Update Price")
        else:
            print('user_id is none here!')
        
        return {}

    # TODO: change 'where user_id = 1' to 'where user_id = config.userid' or equivalent
    if user_id is not None:
        user_portfolio = pd.read_sql_query('''SELECT recent_hold.ticker, recent_hold.quantity, latest_prices.price, latest_prices.time, recent_hold.quantity*latest_prices.price as total_value
            FROM
            (SELECT user_id, ticker, quantity, MAX(time) from holdings where user_id = 1 group by ticker) recent_hold,
            (SELECT ticker, price, MAX(time) as time from intraday_prices group by ticker) latest_prices
            WHERE recent_hold.ticker = latest_prices.ticker;
            ''',db.engine, params={'user_id': user_id})
        
        portfolio = user_portfolio[user_portfolio['quantity'] > 0]
        #print(portfolio)
        return portfolio.to_json(orient='index')
    else:
        print('user_id is none here!')
        return {}
    
# NO KNOWN BUGS
# TODO change it to post endpoint where you can pass in a list of stocks to update and the frequency
# TODO be able to adapt it to handle multiple frequencies. (Either pass always pass frequencies in as a list and iterate through with current if statements)
@app.route("/prices", methods=["GET","POST"])
def prices():

    if request.method == "POST":
        if user_id is not None:
            stocks_to_update = request.json['stocks']
            freq = request.json['freq']
        
            if freq == 'intraday':
                for stock in stocks_to_update:
                    api_prices = iex_calls.get_price_data([stock], True, freq)
                    api_prices.to_sql(name='intraday_prices', con = db.engine, index=False, if_exists= 'append')

            if freq == 'monthly':
                api_prices = iex_calls.get_price_data(stocks_to_update, True, freq)
                api_prices.to_sql(name='daily_prices', con = db.engine, index=False, if_exists= 'append')
        
            print(api_prices)
            #df = pd.read_sql_table('prices', db.engine)
            #print(df)
            return api_prices.to_json(orient='index')
        else:
            print('user_id is none here!')
            return {}
    
    
    
    return {}

# NO KNOWN BUGS
# TODO potentially try to use the "WITH CTE as (SELECT...)" method as it is faster
@app.route("/cleanDB")
def cleanDB():

    # should also group by price but removed for sandbox data because it is randomized
    result = db.engine.execute("""
    DELETE FROM daily_prices
    WHERE id NOT IN
        (SELECT MIN(id) as id
        FROM daily_prices
        GROUP BY ticker, time)
    """)
    result = db.engine.execute("""
    DELETE FROM intraday_prices
    WHERE id NOT IN
        (SELECT MIN(id) as id
        FROM intraday_prices
        GROUP BY ticker, time)
    """)
    
    print(result)
    return "hi"


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, threaded=True, debug=True)
