import numpy as np
import pandas as pd
import os
from iexfinance.stocks import Stock
from iexfinance.stocks import get_historical_data
from iexfinance.stocks import get_historical_intraday
import datetime
import calendar
import pytz

example_dict = {'aapl': 3, 'agg':4, 'dis':2}

def setup_api_variables(testing):
    if testing:
        os.environ['IEX_API_VERSION'] = 'iexcloud-sandbox'
        os.environ['IEX_TOKEN'] = 'Tpk_dc5c4e7b22334c0298338528c39baf6c'
    else:
        os.environ['IEX_API_VERSION'] = 'v1'
        os.environ['IEX_TOKEN'] = 'pk_9e98dc3f12194817b7df4c4e7e84159d'

def get_portfolio_value(holdings_dict, testing):
    setup_api_variables(testing)    
    stocks = list(holdings_dict.keys())
    batch = Stock(stocks, output_format='pandas')
    prices = batch.get_price().iloc[0]
    portfolio_weights = np.array(list(holdings_dict.values()))
    portfolio_value = np.dot(prices, portfolio_weights)
    return portfolio_value

def get_portfolio_history(holdings_dict, testing):
    setup_api_variables(testing)
    stocks = list(holdings_dict.keys())
    today = datetime.date.today()
    days_in_month = calendar.monthrange(today.year, today.month-1)[1]
    start = today - datetime.timedelta(days=days_in_month)
    end = today
    df = get_historical_data(stocks, start, end, close_only = True, output_format = 'pandas')
    portfolio_weights = np.array(list(holdings_dict.values()))
    historical_prices = df.drop(columns = ['volume'], level = 1).dot(portfolio_weights)
    return historical_prices


# Returns a pandas data from with prices from a list of tickers and frequency
# Parameters: stocks = list of tickers, freq = intraday, monthly or yearly, date is defaulted to today
def get_price_data(stocks, testing, freq= 'monthly', date = datetime.date.today()):
    print(date)
    setup_api_variables(testing)
    #today = datetime.date.today()

    num_stocks = len(stocks)
    if num_stocks == 0:
        return pd.DataFrame
    
    if freq == 'intraday':
        for stock in stocks:
            df = get_historical_intraday(stock, date, output_format='pandas')
            if df.empty:
                return df
            df.reset_index(level=0, inplace=True)
            df = df[['index', 'close']]
            df.rename(columns = {'close':'price', 'index': 'time'}, inplace = True)
            utc_diff = datetime.datetime.utcnow().replace(microsecond=0)-datetime.datetime.now().replace(microsecond=0)
            df['time'] = df['time']+utc_diff
            df['ticker'] = stock
            return df[df['price'].notnull()]

    if freq == 'monthly':
        days_in_month = calendar.monthrange(date.year, date.month-1)[1]
        start = date - datetime.timedelta(days=days_in_month)
        end = date
        df = get_historical_data(stocks, start, end, close_only = True, output_format = 'pandas')
        if df.empty:
            return df
        if num_stocks == 1:
            df.drop(columns = ['volume'], inplace=True)
            df.reset_index(level=0, inplace=True)
            df.rename(columns = {'close':'price'}, inplace = True)
            df['ticker'] = stocks[0]
            #print(df[df['price'].notnull()])
            return df[df['price'].notnull()]
        elif num_stocks >=2:
            df.drop(columns = ['volume'], level = 1, inplace = True)
            df.columns = df.columns.droplevel(1)
            df.reset_index(level=0, inplace=True)
            # Rearranges table so tickers become a data point
            database_df = pd.melt(df, id_vars=['date'], value_vars=df.columns[1:])
            database_df.rename(columns = {'date':'time', 'variable': 'ticker', 'value': 'price'}, inplace = True)
            #print(database_df)
            return database_df
    if freq == 'yearly':
        start = date - datetime.timedelta(days=365)
        end = date
        df = get_historical_data(stocks, start, end, close_only = True, output_format = 'pandas')
        if df.empty:
            return df
        if num_stocks == 1:
            df.drop(columns = ['volume'], inplace=True)
            df.reset_index(level=0, inplace=True)
            df.rename(columns = {'close':'price'}, inplace = True)
            df['ticker'] = stocks[0]
            #print(df[df['price'].notnull()])
            return df[df['price'].notnull()]
        elif num_stocks >=2:
            df.drop(columns = ['volume'], level = 1, inplace = True)
            df.columns = df.columns.droplevel(1)
            df.reset_index(level=0, inplace=True)
            # Rearranges table so tickers become a data point
            database_df = pd.melt(df, id_vars=['date'], value_vars=df.columns[1:])
            database_df.rename(columns = {'date':'time', 'variable': 'ticker', 'value': 'price'}, inplace = True)
            #print(database_df)
            return database_df
def month_before(date):
    days_in_month = calendar.monthrange(date.year, date.month-1)[1]
    return date - datetime.timedelta(days=days_in_month)

setup_api_variables(True)
#print(get_price_data(['AAPL', 'AGG', 'DIS', 'FB', 'SPY'], True, 'yearly'))
#print(get_portfolio_value(example_dict))
#print(get_portfolio_history(example_dict))