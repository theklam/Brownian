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

    constructor(props) {
        super(props);
        this.state = {
            isLoaded: false,
            items: []
        };
    }

    componentDidMount() {
        fetch("/holdings")
            .then(res => res.json())
            .then(
                (result) => {
                    console.log(result);
                    console.log(typeof(result));
                    console.log(typeof(result[0]));
                    console.log(Object.values(result));
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
                    {this.state.items.map((item) =>
                        <TickerRow key={item.ticker}
                            items={item} />
                    )}
                </tbody>
            </Table>
        );
    }
}