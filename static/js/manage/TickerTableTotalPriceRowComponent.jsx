import React from "react";
import {Dropdown, DropdownButton} from 'react-bootstrap';
import ClearHoldingsButton from "./ClearHoldingsButtonComponent";
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
                <td> <DropdownButton id="dropdown-basic-button" title="Undo Holdings Changes">
                            <Dropdown.Item eventKey="last_change" onSelect={this.handleSelect}>Undo Last Change</Dropdown.Item>
                            <Dropdown.Item eventKey="last_hour" onSelect={this.handleSelect}>Undo Last Hour</Dropdown.Item>
                            <Dropdown.Item eventKey="today" onSelect={this.handleSelect}>Undo Today</Dropdown.Item>
                        </DropdownButton></td>
                <td> <ClearHoldingsButton items={this.props.items} fetchCurrentHoldings={this.props.fetchCurrentHoldings}/></td>
                <td><b>Total Value:</b></td>
                <td>{this.props.portfolioValue}</td>
            </tr>
        );
    }
}