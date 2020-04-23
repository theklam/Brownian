import React from "react";
import { Table } from 'react-bootstrap';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
} from "react-router-dom";
import TickerRow from "./TickerRowComponent";

export default class TickerTableComponent extends React.Component { 

    render() {
        return (
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Ticker</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Value</th>
                    </tr>
                </thead>
                <tbody>
                    {this.props.items.map((item) =>
                        <TickerRow key={item.ticker}
                            items={item} />
                    )}
                </tbody>
            </Table>
        );
    }
}