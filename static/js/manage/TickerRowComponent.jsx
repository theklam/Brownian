import React from "react";

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