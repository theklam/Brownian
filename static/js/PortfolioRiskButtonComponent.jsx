import React from "react";
import { Form, Col, Button } from 'react-bootstrap';

export default class PortfolioRiskButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ticker: '',
            quantity: ''
        };
        this.fetchRisk = this.fetchRisk.bind(this);
    }

    fetchRisk() {
        let portfolio_stocks = this.props.items.map(a => a.ticker);
        let portfolio_values = this.props.items.map(a => a.total_value);
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ stocks: portfolio_stocks, freq: 'daily', values: portfolio_values})
        };
        fetch('/portfolioRisk', requestOptions)
            .then(response => response.json())
            .then(response => console.log(response));
    }

    render() {
        return (
            <Form>
                <Form.Row>
                    <Button variant="primary" onClick={this.fetchRisk}>
                        Get Risk Metrics
                    </Button>
                </Form.Row>
            </Form>
        );
    }
}