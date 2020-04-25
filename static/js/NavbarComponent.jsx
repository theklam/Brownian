import React from "react";
import { Navbar, Nav, NavDropdown, Form, FormControl, Button } from 'react-bootstrap';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
} from "react-router-dom";

export default class NavbarComponent extends React.Component {

    constructor(props) {
        super(props);
        this.state = {

        };
        this.handleLogout = this.handleLogout.bind(this);
    }

    handleLogout() {
        fetch("/logout")
            .then(response => this.props.fetchCurrentHoldings());
    }

    render() {
        return (
            <Navbar bg="light" expand="lg">
                <Navbar.Brand href="#home">React-Bootstrap</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="mr-auto">
                        <Link to="/">Home</Link>
                        <Link to="/manage">Manage</Link>
                        <Link to="/loginsignup">Login/Signup</Link>
                        <Link to="/visualize">Visualize</Link>
                        <NavDropdown title="Dropdown" id="basic-nav-dropdown">
                            <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
                            <NavDropdown.Item href="#action/3.2">Another action</NavDropdown.Item>
                            <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
                            <NavDropdown.Divider />
                            <NavDropdown.Item href="#action/3.4">Separated link</NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                    <Form inline>
                        <Button variant="outline-success" onClick={this.handleLogout}>Logout</Button>
                    </Form>
                </Navbar.Collapse>
            </Navbar>
        );
    }
}