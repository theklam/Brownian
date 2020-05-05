import React from "react";
import { Form, Button } from 'react-bootstrap';
import {
    Redirect
} from "react-router-dom";

export default class LoginSignUpComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: '',
            toManage: false
        };

        this.handleChangeUsername = this.handleChangeUsername.bind(this);
        this.handleChangePassword = this.handleChangePassword.bind(this);
        this.handleLogin = this.handleLogin.bind(this);
        this.handleSignup = this.handleSignup.bind(this);
        console.log(window.localStorage.getItem('userID'));
    }

    handleChangeUsername(event) {
        this.setState({ username: event.target.value });
    }

    handleChangePassword(event) {
        this.setState({ password: event.target.value });
    }


    handleLogin(e) {
        console.log('The signup link was clicked.');

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: this.state.username, password: this.state.password })
        };
        fetch('/login', requestOptions)
            .then(res => res.text())
            .then(
                (result) => {
                    console.log('here');
                    // failed!
                    if (result == '') {
                        console.log('wrong username or password');
                    }
                    else {
                        console.log('logged in!');
                        window.localStorage.setItem('userID', result);
                        console.log(window.localStorage.getItem('userID'))
                        this.setState({
                            toManage: true
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

    handleSignup(e) {
        console.log('The signup link was clicked.');

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: this.state.username, password: this.state.password })
        };
        fetch('/signup', requestOptions);

    }


    render() {
        if (this.state.toManage === true) {
            return <Redirect to='/manage' />
        }
        return (
            <Form>
                <Form.Group controlId="formBasicEmail">
                    <Form.Label>Email address</Form.Label>
                    <Form.Control type="email" placeholder="Email" value={this.state.username} onChange={this.handleChangeUsername} />
                    <Form.Text className="text-muted">
                        We'll never share your email with anyone else.
                    </Form.Text>
                </Form.Group>

                <Form.Group controlId="formBasicPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control type="password" placeholder="Password" value={this.state.password} onChange={this.handleChangePassword} />
                </Form.Group>
                <Form.Group controlId="formBasicCheckbox">
                    <Form.Check type="checkbox" label="Check me out" />
                </Form.Group>
                <Button variant="primary" onClick={this.handleLogin}>
                    Login
                </Button>
                <Button variant="primary" onClick={this.handleSignup}>
                    Signup
                </Button>
            </Form>
        );
    }
}