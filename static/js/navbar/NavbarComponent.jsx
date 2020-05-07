import React from "react";
import { Navbar, Nav, NavDropdown, Form, FormControl, Button } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import {
    NavLink
} from "react-router-dom";
import '../../css/navbar.css';

export default class NavbarComponent extends React.Component {

    constructor(props) {
        super(props);
        this.state = {

        };
        this.handleLogout = this.handleLogout.bind(this);
    }

    handleLogout() {
        window.localStorage.setItem('userID', '');
        this.props.fetchCurrentHoldings()
    }

    render() {
        return (
            <Navbar bg="light" expand="lg">
                <Navbar.Brand className="logo__text" href="/">Brownian</Navbar.Brand>
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="mr-auto">
                        <LinkContainer exact to="/"><Nav.Link>Home</Nav.Link></LinkContainer>
                        <LinkContainer exact to="/loginsignup"><Nav.Link>Login/Signup</Nav.Link></LinkContainer>
                        <LinkContainer exact to="/manage"><Nav.Link>Manage</Nav.Link></LinkContainer>
                        <LinkContainer exact to="/visualize"><Nav.Link>Visualize</Nav.Link></LinkContainer>
                    </Nav>

                    <Button className='logoutButton' variant="outline-success" onClick={this.handleLogout}>Logout</Button>

                </Navbar.Collapse>
            </Navbar>
        );
    }
}