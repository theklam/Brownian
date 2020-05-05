import React from "react";
import { Form, Col, Button } from 'react-bootstrap';

export default class ClearHoldingsButton extends React.Component {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }


    clearHoldings(){
        let portfolio_stocks = this.props.items.map(a => a.ticker);
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({userID: window.localStorage.getItem('userID'), stocks: portfolio_stocks})
        };
        fetch('/clearHoldings', requestOptions)
            .then(response => response.json())
            .then(response => {
                console.log(response)
                this.props.fetchCurrentHoldings();
            });
    }
    handleClick() {
        this.clearHoldings()
    }

    render() {
        return (
            <Button variant="primary" onClick={this.handleClick}>
                Clear Holdings
            </Button>
        );
    }
}