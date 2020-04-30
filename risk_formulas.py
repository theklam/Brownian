import numpy as np
import pandas as pd

def daily_simple_returns(price_df):
    return price_df.pct_change()

def daily_log_returns(price_df):
    return np.log(1 + daily_simple_returns(price_df))

def annual_log_returns(price_df):
    return np.exp(252*daily_log_returns(price_df).mean())-1
