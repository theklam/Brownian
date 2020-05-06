// App.jsx
// import 'bootstrap/dist/css/bootstrap.min.css';
import React from "react";
import Navbar from "../navbar/NavbarComponent";
import LoginSignUp from "../loginsignup/LoginSignUpComponent";
import Home from "../home/HomeComponent";
import Manage from "../manage/ManageComponent";
import Visualize from "../visualize/VisualizeComponent";
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";
import PrivateRoute from "../routing/PrivateRouteComponent";
import '../../css/visualize.css'

export default class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isLoaded: false,
      items: [],
      portfolioViz: [],
      benchmarkViz: [],
      portfolioValue: 0

    };
    // window.localStorage.setItem('userID', '');
    this.fetchCurrentHoldings = this.fetchCurrentHoldings.bind(this);
    this.fetchCurrentPortfolio = this.fetchCurrentPortfolio.bind(this);
    this.fetchCurrentBenchmark = this.fetchCurrentBenchmark.bind(this);
    this.fetchPrices = this.fetchPrices.bind(this);
    this.getPortfolioValue = this.getPortfolioValue.bind(this);
  }

  getPortfolioValue(stocks) {
    let portfolio_values = stocks.map(a => a.total_value);
    const reducer = (accumulator, currentValue) => accumulator + currentValue; // fancy sum
    this.setState({
      portfolioValue: portfolio_values.reduce(reducer)
    });
  }

  fetchCurrentHoldings() {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticker: this.state.ticker, quantity: this.state.quantity, userID: window.localStorage.getItem('userID'), method: 'retrieve' })
    };
    fetch("/holdings", requestOptions)
      .then(res => res.json())
      .then(
        (result) => {
          let items = Object.values(result);
          this.setState({
            isLoaded: true,
            items: items
          });
          if (this.state.items.length > 0) {
            this.getPortfolioValue(items);
          } else {
            this.setState({
              portfolioValue: 0
            });
          }

        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          this.setState({
            isLoaded: true,
            error
          });
        }
      )
  }

  fetchCurrentPortfolio() {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ freq: 'monthly', userID: window.localStorage.getItem('userID') })
    };
    return fetch("/visualize", requestOptions)
      .then(res => res.json())
      .then(
        (result) => {
          let tmp = Object.values(result);
          tmp = tmp.map(x => x.values);
          this.setState({
            isLoaded: true,
            portfolioViz: tmp
          });
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          this.setState({
            isLoaded: true,
            error
          });
        }
      )
  }

  fetchCurrentBenchmark() {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ freq: 'monthly', userID: window.localStorage.getItem('userID') })
    };
    return fetch("/visualizeBenchmark", requestOptions)
      .then(res => res.json())
      .then(
        (result) => {
          console.log('benchmark is: ');
          console.log(result);
          let tmp = Object.values(result);
          tmp = tmp.map(x => x.price);
          this.setState({
            isLoaded: true,
            benchmarkViz: tmp
          });
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          this.setState({
            isLoaded: true,
            error
          });
        }
      )
  }

  // fetchPrices takes in an array, i.e., [AAPL, TWTR, ...], and updates the prices of said array
  // if no array is provided, then the one that we use is the items array
  fetchPrices(portfolio_stocks) {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stocks: portfolio_stocks, freq: 'yearly', userID: window.localStorage.getItem('userID') })
    };
    return fetch('/prices', requestOptions)
      .then(response => {
        this.fetchCurrentHoldings();
      });
  }

  render() {
    return (
      <Router>
        <Navbar fetchCurrentHoldings={this.fetchCurrentHoldings} />
        <Switch>
          <Route exact path="/">
            <Home />
          </Route>
          <Route exact path="/loginsignup">
            <LoginSignUp />
          </Route>
          <PrivateRoute exact path="/manage">
              <Manage fetchCurrentHoldings={this.fetchCurrentHoldings} items={this.state.items} fetchPrices={this.fetchPrices} portfolioValue={this.state.portfolioValue} />
          </PrivateRoute>
          <PrivateRoute exact path="/visualize">
            {/* <div className='flexContainer'>
              <div className="flexCol">
              
              </div>
              <div className="flexCol">
                
              </div>
            </div> */}
            
            <div className='visualize'>
              <div className='visualize__graphContainer'>
                <Visualize fetchCurrentVisualize={this.fetchCurrentPortfolio} visualize={this.state.portfolioViz} title="Portfolio" />
              </div>
              <div className='visualize__market'>
                <Visualize fetchCurrentVisualize={this.fetchCurrentBenchmark} visualize={this.state.benchmarkViz} title="Benchmark" />
              </div>
            
            
            </div>
            
          </PrivateRoute>
        </Switch>
      </Router>
    );
  }
}