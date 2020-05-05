import React from "react";
import { Button } from 'react-bootstrap';

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
            <Button variant="primary" onClick={this.handleClick}>
                Update Prices
            </Button>
        );
    }
}