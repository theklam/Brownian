from flask import Flask, render_template, g, request
from flask_sqlalchemy import SQLAlchemy
import iex_calls
import pandas as pd
import numpy as np
import datetime
app = Flask(__name__, static_folder="static/dist", template_folder="static")
app.config['TEMPLATES_AUTO_RELOAD'] = True


app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///db.sqlite3'
db = SQLAlchemy(app)

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
    return render_template("index.html")

@app.route("/visualize")
def visualize():
    #example_dict = {'aapl': 3, 'agg':4, 'dis':2}
    #print(iex_calls.get_portfolio_history(example_dict, True))
    def get_portfolio_weights(date):
        user_weights = pd.read_sql_query('''SELECT ticker, quantity, MAX(time) 
            FROM holdings 
            WHERE user_id = :id
            and time < :time
            GROUP by ticker
            ;
            ''',db.engine, params = {'id':1, 'time': date})
        print(user_weights)
    get_portfolio_weights('2020-04-20 20:12:48')
    return render_template("index.html")

@app.route("/login")
def login():
    print('logged in')
    return 'logged in'

@app.route("/signup", methods=["GET","POST"])
def signup():
    if request.method == "POST":
        print(request.json['username'])
        print(request.json['password'])
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
        print(request.json['ticker'])
        print(request.json['quantity'])
        new_holding = pd.DataFrame({'user_id':[1],'ticker': [request.json['ticker']], 'quantity': [request.json['quantity']], 'time': [datetime.datetime.now()]})
        new_holding.to_sql(name='holdings', con = db.engine, index=False, if_exists= 'append')
        return "cool post guy"


    # TODO: change 'where user_id = 1' to 'where user_id = config.userid' or equivalent
    user_portfolio = pd.read_sql_query('''SELECT recent_hold.ticker, recent_hold.quantity, latest_prices.price, latest_prices.time, recent_hold.quantity*latest_prices.price as total_value
        FROM
        (SELECT user_id, ticker, quantity, MAX(time) from holdings where user_id = 1 group by ticker) recent_hold,
        (SELECT ticker, price, MAX(time) as time from daily_prices group by ticker) latest_prices
        WHERE recent_hold.ticker = latest_prices.ticker;
        ''',db.engine)
    
    print(user_portfolio)
    portfolio = user_portfolio[user_portfolio['quantity'] > 0]
    return portfolio.to_json(orient='index')
    
@app.route("/prices", methods=["GET","POST"])
def prices():

    if request.method == "POST":
        print("post request received")
        return "cool post guy"
    
    example_dict = {'aapl': 3, 'agg':4, 'dis':2}
    api_prices = iex_calls.get_price_data(list(example_dict.keys()), True, 'monthly')
    print(api_prices)
    #df = pd.read_sql_table('prices', db.engine)
    #print(df)
    
    
    api_prices.to_sql(name='daily_prices', con = db.engine, index=False, if_exists= 'append')
    
    return "I did it mom"

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, threaded=True, debug=True)
