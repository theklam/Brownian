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
import PortfolioRiskButton from "./PortfolioRiskButtonComponent";
import PortfolioRisk from "./PortfolioRiskComponent";

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
                <TickerTable items={this.props.items} portfolioValue={this.props.portfolioValue}/>
                <UpdateTickerTableForm fetchCurrentHoldings={this.props.fetchCurrentHoldings} fetchPrices={this.props.fetchPrices}/>
                <UpdatePricesButton fetchCurrentHoldings={this.props.fetchCurrentHoldings} items={this.props.items} fetchPrices={this.props.fetchPrices}/>
                {/* <PortfolioRiskButton items={this.props.items}/> */}
                <PortfolioRisk items={this.props.items}/>
            </div>
        );
    }
}