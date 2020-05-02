import React from "react";
import { Form, Col, Button } from 'react-bootstrap';

export default class OptimizeButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ticker: '',
            quantity: ''
        };
        this.optimizePortfolio = this.optimizePortfolio.bind(this);
    }

    optimizePortfolio() {
        let portfolio_stocks = this.props.items.map(a => a.ticker);
        let portfolio_values = this.props.items.map(a => a.total_value);
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ stocks: portfolio_stocks, freq: 'daily', values: portfolio_values, opt_style: 'min_vol', max_weight: 0.5})
        };
        fetch('/optimizePortfolio', requestOptions)
            .then(response => response.json())
            .then(response => console.log(response));
    }

    render() {
        return (
            <Form>
                <Form.Row>
                    <Button variant="primary" onClick={this.optimizePortfolio}>
                        Optimize Portfolio
                    </Button>
                </Form.Row>
            </Form>
        );
    }
}