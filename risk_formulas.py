import numpy as np
import pandas as pd
import scipy.optimize as sco

def daily_simple_returns(price_df):
    return price_df.pct_change()

def daily_log_returns(price_df):
    return np.log(1 + daily_simple_returns(price_df))

def annual_log_returns(price_df):
    return np.exp(252*daily_log_returns(price_df).mean())-1

def log_hist_returns(price_df):
    returns_daily = price_df.pct_change()
    log_returns = np.log(1 + returns_daily)
    log_returns_annual = np.exp(252*log_returns.mean())-1
    cov_daily = log_returns.cov()
    cov_annual = cov_daily * 252
    return log_returns_annual, cov_annual

def portfolio_annualised_performance(weights, mean_returns, cov_matrix):
    returns = np.dot(weights, mean_returns)
    volatility = np.sqrt(np.dot(weights.T, np.dot(cov_matrix, weights)))
    return returns, volatility

def neg_sharpe_ratio(weights, mean_returns, cov_matrix, risk_free_rate):
    p_ret, p_var= portfolio_annualised_performance(weights, mean_returns, cov_matrix)
    return -(p_ret - risk_free_rate) / p_var

def max_sharpe_ratio(mean_returns, cov_matrix, risk_free_rate, max_weight):
    num_assets = len(mean_returns)
    args = (mean_returns, cov_matrix, risk_free_rate)
    constraints = ({'type': 'eq', 'fun': lambda x: np.sum(x) - 1})
    bound = (0.0,max_weight)
    bounds = tuple(bound for asset in range(num_assets))
    result = sco.minimize(neg_sharpe_ratio, num_assets*[1./num_assets,], args=args,
                        method='SLSQP', bounds=bounds, constraints=constraints)
    return result['x']

def portfolio_volatility(weights, mean_returns, cov_matrix):
    return portfolio_annualised_performance(weights, mean_returns, cov_matrix)[1]

def min_variance(mean_returns, cov_matrix, max_weight):
    num_assets = len(mean_returns)
    args = (mean_returns, cov_matrix)
    constraints = ({'type': 'eq', 'fun': lambda x: np.sum(x) - 1})
    bound = (0.0,max_weight)
    bounds = tuple(bound for asset in range(num_assets))

    result = sco.minimize(portfolio_volatility, num_assets*[1./num_assets,], args=args,
                        method='SLSQP', bounds=bounds, constraints=constraints)

    return result['x']