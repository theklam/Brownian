import React from "react";
import {Dropdown, DropdownButton} from 'react-bootstrap';
import ClearHoldingsButton from "./ClearHoldingsButtonComponent";
import '../../css/manage.css'

export default class TickerTableTotalPriceRowComponent extends React.Component {
    constructor(props) {
        super(props);
        this.handleSelect = this.handleSelect.bind(this);
    }

    undoHoldings(timeFrame){
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({userID: window.localStorage.getItem('userID'), timeFrame: timeFrame})
        };
        fetch('/undoPortfolioChanges', requestOptions)
            .then(response => response.text())
            .then(response => {
                console.log(response)
                this.props.fetchCurrentHoldings();
            });
    }

    handleSelect(eventKey){
        this.undoHoldings(eventKey)
    }

    render() {
        return (
            <tr>
                <td> <ClearHoldingsButton items={this.props.items} fetchCurrentHoldings={this.props.fetchCurrentHoldings}/></td>
                <td ></td>
                <td ></td>
                <td><b>Total Value:</b></td>
                <td>{parseFloat(this.props.portfolioValue).toFixed(2)}</td>
            </tr>
        );
    }
}