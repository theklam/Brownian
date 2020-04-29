import React from "react";
import { Form, Col, Button } from 'react-bootstrap';

export default class UpdatePricesButton extends React.Component {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }


    handleClick() {
        this.props.fetchPrices(this.props.items.map(a=>a.ticker));
    }

    render() {
        return (
            <Form>
                <Form.Row>
                    <Button variant="primary" onClick={this.handleClick}>
                        Update Prices
                    </Button>
                </Form.Row>
            </Form>
        );
    }
}