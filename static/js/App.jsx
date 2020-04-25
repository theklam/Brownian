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
      visualize: []
    };
    this.fetchCurrentHoldings = this.fetchCurrentHoldings.bind(this);
    this.fetchCurrentVisualize = this.fetchCurrentVisualize.bind(this);
  }

  fetchCurrentHoldings() {
    fetch("/holdings")
      .then(res => res.json())
      .then(
        (result) => {
          console.log('result is: ')
          console.log(result);
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

  fetchCurrentVisualize() {
    return fetch("/visualize")
      .then(res => res.json())
      .then(
        (result) => {
          console.log(result);
          let tmp = Object.values(result);
          // tmp.map(x=>x.values);
          this.setState({
            isLoaded: true,
            visualize: tmp
          });
          console.log(this.state.visualize);
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
            <Manage fetchCurrentHoldings={this.fetchCurrentHoldings} items={this.state.items} />
          </Route>
          <Route exact path="/visualize">
            <Visualize fetchCurrentVisualize={this.fetchCurrentVisualize} visualize={this.state.visualize} />
          </Route>
        </Switch>
      </Router>
    );
  }
}