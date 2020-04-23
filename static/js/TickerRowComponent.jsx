import React from "react";
import { Table } from 'react-bootstrap';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
} from "react-router-dom";

export default class TickerRowComponent extends React.Component {
    render() {
        return (
            <tr>
                <td>{this.props.items.ticker}</td>
                <td>{this.props.items.price}</td>
                <td>{this.props.items.quantity}</td>
                <td>{this.props.items.total_value}</td>
            </tr>
        );
    }
}