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
user_id = None
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

def get_portfolio_value(datetime, id):
    portfolio = pd.read_sql_query('''SELECT recent_hold.ticker, recent_hold.quantity, latest_prices.price, latest_prices.time, recent_hold.quantity*latest_prices.price as total_value
        FROM
        (SELECT user_id, ticker, quantity, MAX(time) from holdings where user_id = :user_id and time < :time group by ticker) recent_hold,
        (SELECT ticker, price, MAX(time) as time from daily_prices where time < :time group by ticker) latest_prices
        WHERE recent_hold.ticker = latest_prices.ticker;
        ''',db.engine, params = {'user_id':user_id, 'time': datetime})
    return portfolio

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

# Route to home page, currently queries database for connection reasons
@app.route("/")
def index():
    print(user_id)
    return render_template("index.html")

@app.route("/visualize")
def visualize():
    #example_dict = {'aapl': 3, 'agg':4, 'dis':2}
    #print(iex_calls.get_portfolio_history(example_dict, True))
    def get_portfolio_weights(date):
        user_weights = pd.read_sql_query('''SELECT ticker, quantity, MAX(time) 
            FROM holdings 
            WHERE user_id = :user_id
            and time < :time
            GROUP by ticker
            ;
            ''',db.engine, params = {'user_id':user_id, 'time': date})
        print(user_weights)

    
    #get_portfolio_weights('2020-04-20 20:12:48')
    nyse = mcal.get_calendar('NYSE')

    today = datetime.date.today()
    
    freq = 'monthly'
    if freq == 'monthly':
        trading_dates = nyse.schedule(start_date=iex_calls.month_before(today), end_date=today)
    
    portfolio_dates = []
    portfolio_values = []

    for date in trading_dates.market_close:
        port_value = get_portfolio_value(date.to_pydatetime(),1)
        portfolio_dates.append(date.to_pydatetime())
        portfolio_values.append(port_value['total_value'].sum())

    portfolio_history = pd.DataFrame({'dates':portfolio_dates, 'values': portfolio_values})    
    print(portfolio_history)
    return render_template("index.html")

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

@app.route("/signup", methods=["GET","POST"])
def signup():
    if request.method == "POST":
        new_user = pd.DataFrame({'user_name': [request.json['username']], 'password': [request.json['password']]})
        new_user.to_sql(name='user_account', con = db.engine, index=False, if_exists= 'append')
        return 'signup done'

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

        print("post request received")
        return "cool post guy"


    # TODO: change 'where user_id = 1' to 'where user_id = config.userid' or equivalent
    user_portfolio = pd.read_sql_query('''SELECT recent_hold.ticker, recent_hold.quantity, latest_prices.price, latest_prices.time, recent_hold.quantity*latest_prices.price as total_value
        FROM
        (SELECT user_id, ticker, quantity, MAX(time) from holdings where user_id = :user_id group by ticker) recent_hold,
        (SELECT ticker, price, MAX(time) as time from daily_prices group by ticker) latest_prices
        WHERE recent_hold.ticker = latest_prices.ticker;
        ''',db.engine, params={'user_id': user_id})
    
    print(user_portfolio)
    return 'got holdings'
    
@app.route("/prices", methods=["GET","POST"])
def prices():

    if request.method == "POST":
        print("post request received")
        return "cool post guy"
    
    example_dict = {'aapl': 3, 'agg':4, 'dis':2}
    api_prices = iex_calls.get_price_data(['SPY'], True, 'monthly')
    print(api_prices)
    #df = pd.read_sql_table('prices', db.engine)
    #print(df)
    
    
    api_prices.to_sql(name='daily_prices', con = db.engine, index=False, if_exists= 'append')
    
    return "I did it mom"

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, threaded=True, debug=True)
