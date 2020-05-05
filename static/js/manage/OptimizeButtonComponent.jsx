import React from "react";
import { Button } from 'react-bootstrap';

export default class OptimizeButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ticker: '',
            quantity: ''
        };
        this.handleClick = this.handleClick.bind(this);
    }
    handleClick() {
        this.props.updateHoldings();
    }

    render() {
        return (
            <Button variant="primary" onClick={this.handleClick}>
                Update Portfolio
            </Button>
        );
    }
}