from flask import Flask, render_template, g, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
import iex_calls
import risk_formulas
import pandas as pd
import numpy as np
import datetime
import pandas_market_calendars as mcal

app = Flask(__name__, static_folder="static/dist", template_folder="static")
app.config['TEMPLATES_AUTO_RELOAD'] = True
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///risk_testing.sqlite3'

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)


def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = SQLAlchemy(app)
    return db


@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()
    
# Schemas for sqlite tables
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
    return render_template("index.html")

@app.route("/login", methods=["POST"])
def login():
    if request.method == "POST":
        login_info = pd.read_sql_query('''SELECT password
            FROM user_account 
            WHERE user_name = :username''', db.engine, params = {'username': request.json['username']})
        pw_hash = login_info['password'][0]
        if bcrypt.check_password_hash(pw_hash,request.json['password'].encode('utf-8')):
            login_id = pd.read_sql_query('''SELECT id 
            FROM user_account 
            WHERE user_name = :username''', db.engine, params = {'username': request.json['username']})
            return str(login_id['id'][0])
        else:
            print("invalid password or username")
            return ''
        return 'logged in'

@app.route("/signup", methods=["GET","POST"])
def signup():
    if request.method == "POST":
        pw_hash = bcrypt.generate_password_hash(request.json['password'].encode('utf-8')).decode('utf-8')
        new_user = pd.DataFrame({'user_name': [request.json['username']], 'password': [pw_hash]})
        new_user.to_sql(name='user_account', con = db.engine, index=False, if_exists= 'append')
        return 'signup done'


'''
Stores or retrieves JSON of user holdings
'''
# TODO maybe add a row for cash and update cash as necessary
@app.route("/holdings", methods=["GET","POST"])
def holdings():
    if request.method == "POST":
        if request.json['userID'] != '' and request.json['userID'] is not None:
            user_id = int(request.json['userID'])

            if request.json['method'] == "store":
                new_holding = pd.DataFrame({'user_id':[user_id],'ticker': [request.json['ticker']], 'quantity': [request.json['quantity']], 'time': [datetime.datetime.now()]})
                new_holding.to_sql(name='holdings', con = db.engine, index=False, if_exists= 'append')
                new_holding_price = user_portfolio = pd.read_sql_query('''
                SELECT ticker, price, MAX(time) as time from daily_prices where ticker = :ticker;
                ''',db.engine, params={'ticker': request.json['ticker']}, parse_dates=['time'])
                last_time = new_holding_price['time'][0]
                # this if statement is checking whether the stock we are adding
                # a) has an outdated price or
                # b) does not have a price at all. 
                # if either of the two conditions are true, then we want to tell the
                # frontend that we want to update the price of the stock we are trying to add. 
                if last_time < datetime.date.today() or pd.isnull(last_time):
                    api_prices = iex_calls.get_price_data([request.json['ticker']], True, 'yearly')
                    api_prices.rename(columns={"date": "time"}, inplace = True)
                    api_prices.to_sql(name='daily_prices', con = db.engine, index=False, if_exists= 'append')
                    cleanDB()
                    return 'we guddd'
            elif request.json['method'] == "retrieve":
                user_portfolio = pd.read_sql_query('''SELECT recent_hold.ticker, recent_hold.quantity, latest_prices.price, latest_prices.time, recent_hold.quantity*latest_prices.price as total_value
                FROM
                (SELECT user_id, ticker, quantity, MAX(time) from holdings where user_id = :user_id group by ticker) recent_hold,
                (SELECT ticker, price, MAX(time) as time from daily_prices group by ticker) latest_prices
                WHERE recent_hold.ticker = latest_prices.ticker;
                ''',db.engine, params={'user_id': user_id})
            
                portfolio = user_portfolio[user_portfolio['quantity'] > 0.000001]
                portfolio['weights'] = portfolio['total_value']/portfolio['total_value'].sum()
                portfolio = portfolio.round({'quantity': 2, 'price':2, 'total_value' : 2, 'weights':4})
                return portfolio.to_json(orient='index')
        else:
            print('user_id is none here!')
            return {}


'''
Returns JSON of user risk stats
'''
@app.route("/portfolioRisk", methods=["GET","POST"])
def portfolioRisk():
    if request.method == "POST":
        if request.json['userID'] != '' and request.json['userID'] is not None:
            user_id = int(request.json['userID'])
            stock_list = request.json['stocks']
            cleanDB()
            portfolio_prices = pd.read_sql_query('''select ticker, price, time from {} where time >= ? and time <= :end and ticker in ({});
            '''.format('daily_prices',','.join('?' * len(stock_list))), db.engine, params = [datetime.date.today() - datetime.timedelta(days=365), datetime.date.today()] + stock_list) 
            portfolio_prices = portfolio_prices.pivot(index = 'time', columns = 'ticker', values = 'price')
            
            if portfolio_prices.empty:
                return {}

            values = np.array(request.json['values'])
            weights = values/np.sum(values)
            mean_returns_annual, cov_annual = risk_formulas.log_hist_returns(portfolio_prices)

            port_hist_returns, port_volatility = risk_formulas.portfolio_annualised_performance(weights, mean_returns_annual, cov_annual)
            port_hist_sharpe = -1*risk_formulas.neg_sharpe_ratio(weights, mean_returns_annual, cov_annual, 0.01)
            

            return jsonify({
                "port_hist_returns": port_hist_returns,
                "port_vol": port_volatility, 
                "port_hist_sharpe": port_hist_sharpe
            })
        else:
            print('user_id is none here!')
            return {}

'''
Optimizes user portfolio and returns JSON of optimal holdings and risk stats
'''
# TODO: Add new, non-useless stats lmaoo
@app.route("/optimizePortfolio", methods=["GET","POST"])
def optimzizePortfolio():
    if request.method == "POST":
        if request.json['userID'] != '' and request.json['userID'] is not None:
            user_id = int(request.json['userID'])
            stock_list = request.json['stocks']
            values = np.array(request.json['values'])
            current_prices = np.array(request.json['current_prices'])

            # Queries daily_prices table for last 365 prices for selected tickers
            portfolio_prices = pd.read_sql_query('''select ticker, price, time from {} where time >= ? and time <= :end and ticker in ({});
            '''.format('daily_prices',','.join('?' * len(stock_list))), db.engine, params = [datetime.date.today() - datetime.timedelta(days=365), datetime.date.today()] + stock_list) 
            portfolio_prices = portfolio_prices.pivot(index = 'time', columns = 'ticker', values = 'price')
            if portfolio_prices.empty:
                return jsonify({"optimized_weights": [], "optimized_returns": '',"optimized_vol": '', "optimized_sharpe": '', "new_holdings": portfolio_prices.to_json(orient='index')})

            # Risk calculations using queried prices
            mean_returns_annual, cov_annual = risk_formulas.log_hist_returns(portfolio_prices)
            if request.json['opt_style'] == "max_sharpe":
                optimized_weights = risk_formulas.max_sharpe_ratio(mean_returns_annual, cov_annual,  0.01, min(1/len(stock_list),request.json['min_weight']), max(1/len(stock_list),request.json['max_weight']))
                optimized_returns, optimized_vol = risk_formulas.portfolio_annualised_performance(optimized_weights, mean_returns_annual, cov_annual)
                optimized_sharpe = -1*risk_formulas.neg_sharpe_ratio(optimized_weights, mean_returns_annual, cov_annual, 0.01)          
            elif request.json['opt_style'] == "min_vol":
                optimized_weights = risk_formulas.min_variance(mean_returns_annual, cov_annual, min(1/len(stock_list),request.json['min_weight']), max(1/len(stock_list),request.json['max_weight']))
                optimized_returns, optimized_vol = risk_formulas.portfolio_annualised_performance(optimized_weights, mean_returns_annual, cov_annual)
                optimized_sharpe = -1*risk_formulas.neg_sharpe_ratio(optimized_weights, mean_returns_annual, cov_annual, 0.01)
            else:
                return {}
            
            portfolio_value = np.sum(values)
            optimized_values = optimized_weights*portfolio_value
            optimized_shares = optimized_values/current_prices

            new_holding = pd.DataFrame({'user_id':[user_id]*len(stock_list),'ticker': stock_list, 'quantity': optimized_shares.tolist(), 'time': [datetime.datetime.now()]*len(stock_list)})
            new_holding.drop(columns=['user_id','time'], inplace=True)
            price_map = pd.DataFrame({'ticker':stock_list, 'price':current_prices})
            new_holding = new_holding.merge(price_map)
            new_holding = new_holding[new_holding['quantity'] > 0.000001]
            new_holding['total_value'] = new_holding['quantity']*new_holding['price']
            new_holding['weights'] = new_holding['total_value']/new_holding['total_value'].sum()
            new_holding = new_holding.round({'quantity': 2, 'price':2, 'total_value' : 2, 'weights':4})

            return jsonify({"optimized_weights": optimized_weights.tolist(), "optimized_returns": optimized_returns,"optimized_vol": optimized_vol, "optimized_sharpe": optimized_sharpe, "new_holdings":new_holding.to_json(orient='index')})
        else:
            print('user_id is none here!')
            return {}

    
    return {}

'''
Updates database to make user holdings match optimized portfolio
'''
@app.route("/rebalancePortfolio", methods=["POST"])
def rebalancePortfolio():
    if request.method == "POST":
        if request.json['userID'] != '' and request.json['userID'] is not None:
            user_id = int(request.json['userID'])
            stock_list = request.json['stocks']
            values = np.array(request.json['values'])
            portfolio_value = np.sum(values)
            prices = np.array(request.json['prices'])

            optimized_weights = np.array(request.json['optimizedWeights'])
            optimized_values = optimized_weights*portfolio_value
            optimized_shares = optimized_values/prices

            new_holding = pd.DataFrame({'user_id':[user_id]*len(stock_list),'ticker': stock_list, 'quantity': optimized_shares.tolist(), 'time': [datetime.datetime.now()]*len(stock_list)})
            new_holding.to_sql(name='holdings', con = db.engine, index=False, if_exists= 'append')
            return new_holding.to_json(orient='index')
    
    return {}

'''
Updates Database to set all ticker quantities to 0
'''
@app.route("/clearHoldings", methods=["POST"])
def clearHoldings():
    if request.method == "POST":
        if request.json['userID'] != '' and request.json['userID'] is not None:
            user_id = int(request.json['userID'])
            stock_list = request.json['stocks']

            new_holding = pd.DataFrame({'user_id':[user_id]*len(stock_list),'ticker': stock_list, 'quantity': 0, 'time': [datetime.datetime.now()]*len(stock_list)})
            new_holding.to_sql(name='holdings', con = db.engine, index=False, if_exists= 'append')
            return new_holding.to_json(orient='index')
    
    return {}

'''
Deletes recent holdings changes from database within select timeframe
'''
@app.route("/undoPortfolioChanges", methods=["POST"])
def undoPortfolioChanges():
    if request.method == "POST":
        if request.json['userID'] != '' and request.json['userID'] is not None:
            user_id = int(request.json['userID'])
            if request.json['timeFrame'] == 'last_change':
                result = db.engine.execute("""
                DELETE FROM holdings 
                WHERE user_id = :user_id 
                AND time >= :time
                AND time = (SELECT MAX(time) FROM holdings WHERE user_id = :user_id);
                """, {'user_id': user_id, 'time':datetime.date.today()})
            elif request.json['timeFrame'] == 'last_hour':
                result = db.engine.execute("""
                DELETE FROM holdings 
                WHERE user_id = :user_id 
                AND time >= :time;
                """, {'user_id': user_id, 'time':datetime.datetime.now()-datetime.timedelta(hours=1)})
            elif request.json['timeFrame'] == 'today':
                result = db.engine.execute("""
                DELETE FROM holdings 
                WHERE user_id = :user_id 
                AND time >= :time;
                """, {'user_id': user_id, 'time':datetime.date.today()})
            else:
                return "invalid time frame"
            return "successfully undone"
    return ''


'''
Returns JSON of user historical performance
'''
# TODO Add in functionality for intraday prices
# TODO Add in trading mode vs explore mode
@app.route("/visualize", methods=["POST"])
def visualize():
    if request.method == "POST":
        nyse = mcal.get_calendar('NYSE')
        today = datetime.date.today()
        trading_dates = nyse.schedule(start_date=iex_calls.month_before(today), end_date=today)
        freq = request.json['freq']
        portfolio_dates = []
        portfolio_values = []
        date_list = []
        if request.json['userID'] != '' and request.json['userID'] is not None:
            user_id = int(request.json['userID'])
            if freq == 'intraday':
                date_list = [trading_dates.market_open[-1] + datetime.timedelta(minutes=5*x) for x in range(0, 79)]
            elif freq == 'monthly':
                date_list = trading_dates.market_close
            else:
                return "invalid frequency"
            for date in date_list:
                port_value = get_portfolio_value(date.to_pydatetime()+datetime.timedelta(seconds=1), user_id, freq)
                portfolio_dates.append(date.to_pydatetime())
                portfolio_values.append(port_value['total_value'].sum())

            portfolio_history = pd.DataFrame({'dates':portfolio_dates, 'values': portfolio_values})
            return portfolio_history.to_json(orient='index')
        else:
            # print('user_id is none here!')
            return {}

'''
Efficiently returns JSON for user historical performance
~~~CURRENTLY NOT IN USE~~~
'''
# TODO Add in functionality for intraday prices
@app.route("/visualizeTest", methods=["POST"])
def visualizeTest():
    if request.method == "POST":
        nyse = mcal.get_calendar('NYSE')
        today = datetime.date.today()
        trading_dates = nyse.schedule(start_date=iex_calls.month_before(today), end_date=today)
        freq = 'intraday'
        if user_id is not None:
            portfolio_history = efficient_user_value(trading_dates.market_open[-1].to_pydatetime(), user_id, freq)
            return portfolio_history.to_json(orient='index')
        else:
            # print('user_id is none here!')
            return {}

'''
Returns JSON for benchmark historical performance
'''
# TODO add in functionality for intraday prices
# TODO be able to choose different benchmarks
# TODO potentially make the database queries more robust to time zone differences. Would need to sit down and think theoretically about most efficient db / api setup
@app.route("/visualizeBenchmark", methods=["POST"])
def visualizeBenchmark():
    if request.method == "POST":
        # code for just the benchmark's raw price
        benchmark = 'SPY'
        nyse = mcal.get_calendar('NYSE')
        today = datetime.date.today()
        trading_dates = nyse.schedule(start_date=iex_calls.month_before(today), end_date=today)
        freq = request.json['freq']
        initial_port = pd.DataFrame
        
        if request.json['userID'] != '' and request.json['userID'] is not None:
            user_id = int(request.json['userID'])
            if freq == 'intraday':
                df = pd.read_sql_query(''' SELECT time, price from intraday_prices
                WHERE ticker = :ticker
                AND time >= :start
                ''', db.engine, params={'ticker': benchmark, 'start':trading_dates.index[-1].to_pydatetime()})
                initial_port = get_portfolio_value(trading_dates.market_open[-1].to_pydatetime()+datetime.timedelta(seconds=1), user_id, 'intraday')
            elif freq == 'monthly':
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
            # print('user_id is none here!')
            return {}
    
'''
~~~CURRENTLY NOT IN USE~~~

Updates database prices for select prices
'''
# TODO change it to post endpoint where you can pass in a list of stocks to update and the frequency
# TODO be able to adapt it to handle multiple frequencies. (Either pass always pass frequencies in as a list and iterate through with current if statements)
@app.route("/prices", methods=["GET","POST"])
def prices():
    if request.method == "POST":
        if request.json['userID'] != '' and request.json['userID'] is not None:
            user_id = int(request.json['userID'])
            stocks_to_update = request.json['stocks']
            freq = request.json['freq']
        
            if freq == 'intraday':
                for stock in stocks_to_update:
                    api_prices = iex_calls.get_price_data([stock], True, freq)
                    api_prices.to_sql(name='intraday_prices', con = db.engine, index=False, if_exists= 'append')
            elif freq == 'monthly' or freq == 'yearly':
                api_prices = iex_calls.get_price_data(stocks_to_update, True, freq)
                api_prices.to_sql(name='daily_prices', con = db.engine, index=False, if_exists= 'append')
            cleanDB()
            return api_prices.to_json(orient='index')
        else:
            print('user_id is none here!')
            return {}
    return {}

'''
Deletes duplicate price records from database
'''
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
    
    return "hi"

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
    return portfolio


'''
~~~NOT CURRENTLY IN USE~~~

More efficient method to calculate user portfolio values
'''
# TODO: incorporate changes in Holdings to simulate trading a portfolio
# TODO: create mode for user to see how well current portfolio would have done in last month (normalized start val)
def efficient_user_value(opening_time, user_id, freq):    
    table = 'daily_prices'
    if freq == 'intraday':
        table = 'intraday_prices'
    init_hold  = pd.read_sql_query('''SELECT ticker, quantity, max(time) as time 
    from holdings 
    where user_id = :user_id 
    and time <= :initial_time 
    group by ticker;
    ''', db.engine, params = {'user_id':user_id, 'initial_time': opening_time})
    changes_in_hold  = pd.read_sql_query('''SELECT ticker, quantity, time 
    from holdings 
    where user_id = :user_id 
    and time > :initial_time;
    ''', db.engine, params = {'user_id':user_id, 'initial_time': opening_time})

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


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=80, threaded=True, debug=True)
