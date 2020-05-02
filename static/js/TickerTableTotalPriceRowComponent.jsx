import React from "react";
import { ThemeProvider } from "react-bootstrap";

export default class TickerTableTotalPriceRowComponent extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <tr>
                <td></td>
                <td></td>
                <td><b>Total Value:</b></td>
                <td>{this.props.portfolioValue}</td>
            </tr>
        );
    }
}