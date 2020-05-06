import React from "react";
import { Navbar, Nav, NavDropdown, Form, FormControl, Button } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
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
                <Navbar.Brand className="logo__text" href="#home">Brownian</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="mr-auto">
                        <LinkContainer to="/"><Nav.Link href="/">Home</Nav.Link></LinkContainer>
                        <LinkContainer to="/loginsignup"><Nav.Link href="/loginsignup">Login/Signup</Nav.Link></LinkContainer>
                        <LinkContainer to="/manage"><Nav.Link href="/manage">Manage</Nav.Link></LinkContainer>
                        <LinkContainer to="/visualize"><Nav.Link href="/visualize">Visualize</Nav.Link></LinkContainer>
                    </Nav>
                    <Form inline>
                        <Button variant="outline-success" onClick={this.handleLogout}>Logout</Button>
                    </Form>
                </Navbar.Collapse>
            </Navbar>
        );
    }
}