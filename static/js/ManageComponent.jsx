import React from "react";
import TickerTable from "./TickerTableComponent";
import UpdateTickerTableForm from "./UpdateTickerTableFormComponent";
import PortfolioRisk from "./PortfolioRiskComponent";
import PortfolioOptimization from "./PortfolioOptimizationComponent"

export default class ManageComponent extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.props.fetchCurrentHoldings();
    }

    render() {
        return (
            <div className="flexContainer">
                <TickerTable items={this.props.items} portfolioValue={this.props.portfolioValue} fetchCurrentHoldings={this.props.fetchCurrentHoldings} fetchPrices={this.props.fetchPrices}/>
                <UpdateTickerTableForm fetchCurrentHoldings={this.props.fetchCurrentHoldings} items={this.props.items} fetchPrices={this.props.fetchPrices}/>
                <PortfolioRisk items={this.props.items}/>
                <PortfolioOptimization fetchCurrentHoldings={this.props.fetchCurrentHoldings} items={this.props.items} fetchPrices={this.props.fetchPrices}/>
            </div>
        );
    }
}