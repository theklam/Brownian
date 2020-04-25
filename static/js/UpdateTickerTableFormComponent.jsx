import React from "react";
import { Form, Col, Button } from 'react-bootstrap';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
} from "react-router-dom";

export default class UpdateTickerTableForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ticker: '',
            quantity: ''
        };
        this.postNewStock = this.postNewStock.bind(this);
        this.handleChangeTicker = this.handleChangeTicker.bind(this);
        this.handleChangeQuantity = this.handleChangeQuantity.bind(this);
    }

    handleChangeTicker(event) {
        this.setState({ ticker: event.target.value });
    }

    handleChangeQuantity(event) {
        this.setState({ quantity: event.target.value });
    }

    postNewStock() {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ticker: this.state.ticker, quantity: this.state.quantity })
        };
        fetch('/holdings', requestOptions)
            .then(response => this.props.fetchCurrentHoldings());
    }

    render() {
        return (
            <Form>
                <Form.Row>
                    <Col>
                        <Form.Control placeholder="Ticker" onChange={this.handleChangeTicker} />
                    </Col>
                    <Col>
                        <Form.Control placeholder="Quantity" onChange={this.handleChangeQuantity} />
                    </Col>
                    <Button variant="primary" onClick={this.postNewStock}>
                        Add Stonk
                    </Button>
                </Form.Row>
            </Form>
        );
    }
}