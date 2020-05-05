import React from "react";
import { Table } from 'react-bootstrap';
import TickerRow from "./TickerRowComponent";
import TickerTableTotalPriceRow from "./TickerTableTotalPriceRowComponent";
import UpdatePricesButton from "./UpdatePricesButtonComponent";
export default class TickerTableComponent extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        return (
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Ticker</th>
                        <th>Price    <UpdatePricesButton fetchCurrentHoldings={this.props.fetchCurrentHoldings} items={this.props.items} fetchPrices={this.props.fetchPrices}/></th>
                        <th>Quantity</th>
                        <th>Value</th>
                    </tr>
                </thead>
                <tbody>
                    {this.props.items.map((item) =>
                        <TickerRow key={item.ticker}
                            items={item} />
                    )}
                    <TickerTableTotalPriceRow items={this.props.items} fetchCurrentHoldings={this.props.fetchCurrentHoldings} portfolioValue={this.props.portfolioValue}/>
                </tbody>
            </Table>
        );
    }
}