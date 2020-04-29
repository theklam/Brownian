// App.jsx
// import 'bootstrap/dist/css/bootstrap.min.css';
import React from "react";
import Navbar from "./NavbarComponent";
import LoginSignUp from "./LoginSignUpComponent";
import Home from "./HomeComponent";
import Manage from "./ManageComponent";
import Visualize from "./VisualizeComponent";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

export default class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isLoaded: false,
      items: [],
      portfolioViz: [],
      benchmarkViz: []
    };
    this.fetchCurrentHoldings = this.fetchCurrentHoldings.bind(this);
    this.fetchCurrentPortfolio = this.fetchCurrentPortfolio.bind(this);
    this.fetchCurrentBenchmark = this.fetchCurrentBenchmark.bind(this);
    this.fetchPrices = this.fetchPrices.bind(this);
  }

  fetchCurrentHoldings() {
    fetch("/holdings")
      .then(res => res.json())
      .then(
        (result) => {
          console.log('result is: ')
          console.log(Object.values(result));
          console.log(typeof(Object.values(result)));
          this.setState({
            isLoaded: true,
            items: Object.values(result)
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

  fetchCurrentPortfolio() {
    return fetch("/visualize")
      .then(res => res.json())
      .then(
        (result) => {
          console.log(result);
          let tmp = Object.values(result);
          tmp = tmp.map(x => x.values);
          this.setState({
            isLoaded: true,
            portfolioViz: tmp
          });
          console.log(this.state.portfolioViz);
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
    return fetch("/visualizeBenchmark")
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
          console.log('benchmark processed is: ');
          console.log(this.state.benchmarkViz);
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
    console.log('in the fetch prices function!~~~~~~');
    console.log('portfolio_stocks is: ');
    console.log(typeof(portfolio_stocks));
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stocks: portfolio_stocks, freq: 'intraday' })
    };
    return fetch('/prices', requestOptions)
      .then(response => {
        console.log('fetch prices returned successfully!');
        console.log(response);
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
          <Route exact path="/manage">
            <Manage fetchCurrentHoldings={this.fetchCurrentHoldings} items={this.state.items} fetchPrices={this.fetchPrices} />
          </Route>
          <Route exact path="/visualize">
            <Visualize fetchCurrentVisualize={this.fetchCurrentPortfolio} visualize={this.state.portfolioViz} title="Portfolio" />
            <Visualize fetchCurrentVisualize={this.fetchCurrentBenchmark} visualize={this.state.benchmarkViz} title="Benchmark" />
          </Route>
        </Switch>
      </Router>
    );
  }
}