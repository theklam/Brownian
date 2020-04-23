import React from "react";
import { Form, Button } from 'react-bootstrap';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
} from "react-router-dom";

export default class HomeComponent extends React.Component {
    render() {
        return (
            <h1>Home Page</h1>
        );
    }
}