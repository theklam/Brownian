import React from "react";
import { Form, Button } from 'react-bootstrap';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
} from "react-router-dom";

export default class LoginSignUpComponent extends React.Component {
    render() {
        return (
            <Form>
                <Form.Group controlId="formBasicEmail">
                    <Form.Label>Email address</Form.Label>
                    <Form.Control type="email" placeholder="Enter email" />
                    <Form.Text className="text-muted">
                        We'll never share your email with anyone else.
                    </Form.Text>
                </Form.Group>

                <Form.Group controlId="formBasicPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control type="password" placeholder="Password" />
                </Form.Group>
                <Form.Group controlId="formBasicCheckbox">
                    <Form.Check type="checkbox" label="Check me out" />
                </Form.Group>
                <Button variant="primary" type="submit" onClick={handleLogin}>
                    Login
                </Button>
            </Form>
        );
    }
}

// the function should handle the login by querying the database
// to check if the login is correct, if the login is correct, then
// we redirect user to main page. 
// if login is incorrect we ask the user to enter another login shit. 
function handleLogin(e) {
    console.log('The link was clicked.');
    fetch("/login")
        .then(res => res.json())
        .then(
            (result) => {
                console.log('api came back hella clean');
            },
            // Note: it's important to handle errors here
            // instead of a catch() block so that we don't swallow
            // exceptions from actual bugs in components.
            (error) => {
                console.log('error with api call');
            }
        )
}