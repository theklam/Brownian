import React from "react";
import { Table } from 'react-bootstrap';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
} from "react-router-dom";
import TickerTable from "./TickerTableComponent";
import UpdateTickerTableForm from "./UpdateTickerTableFormComponent";
import UpdatePricesButton from "./UpdatePricesButtonComponent";

export default class ManageComponent extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.props.fetchCurrentHoldings();
    }

    render() {
        return (
            <div>
                <TickerTable items={this.props.items} />
                <UpdateTickerTableForm fetchCurrentHoldings={this.props.fetchCurrentHoldings}/>
                <UpdatePricesButton fetchCurrentHoldings={this.props.fetchCurrentHoldings} items={this.props.items}/>
            </div>
        );
    }
}