// App.jsx
// import 'bootstrap/dist/css/bootstrap.min.css';
import React from "react";
import Navbar from "./NavbarComponent";
import LoginSignUp from "./LoginSignUpComponent";
import Home from "./HomeComponent";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

export default class App extends React.Component {
  render() {
    return (
      <Router>
        <Navbar />
        <Switch>
          <Route exact path="/">
            <Home />
          </Route>
          <Route exact path="/loginsignupcomponent">
            <LoginSignUp />
          </Route>
        </Switch>
      </Router>
    );
  }
}