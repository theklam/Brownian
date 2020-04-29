import React from "react";
import { Form, Col, Button } from 'react-bootstrap';

export default class UpdatePrices extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ticker: '',
            quantity: ''
        };
        this.fetchPrices = this.fetchPrices.bind(this);
    }

    fetchPrices() {
        let portfolio_stocks = this.props.items.map(a => a.ticker);
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ stocks: portfolio_stocks, freq: 'intraday'})
        };
        fetch('/prices', requestOptions)
            .then(response => this.props.fetchCurrentHoldings());
    }

    render() {
        return (
            <Form>
                <Form.Row>
                    <Button variant="primary" onClick={this.fetchPrices}>
                        Update Prices
                    </Button>
                </Form.Row>
            </Form>
        );
    }
}