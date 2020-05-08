import React from "react";
import TickerTable from "./TickerTableComponent";
import UpdateTickerTableForm from "./UpdateTickerTableFormComponent";
import PortfolioRisk from "./PortfolioRiskComponent";
import PortfolioOptimization from "./PortfolioOptimizationComponent"
import VisualizeStocks from "./VisualizeStocksComponent";
import '../../css/manage.css'

export default class ManageComponent extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.props.fetchCurrentHoldings();
    }

    render() {
        return (
            <div className="flexContainer widthSensitive">
                <div>
                    <h2 className='manage__header'>Your Portfolio</h2>
                    <PortfolioRisk items={this.props.items}/>
                    <VisualizeStocks items={this.props.items} div_title="portfolio"/>
                    <UpdateTickerTableForm fetchCurrentHoldings={this.props.fetchCurrentHoldings} items={this.props.items} fetchPrices={this.props.fetchPrices}/>
                    <TickerTable items={this.props.items} portfolioValue={this.props.portfolioValue} fetchCurrentHoldings={this.props.fetchCurrentHoldings} fetchPrices={this.props.fetchPrices}/>
                    
                </div>
                <div>
                    <h2 className='manage__header'>Optimization Tool</h2>
                    <PortfolioOptimization fetchCurrentHoldings= {this.props.fetchCurrentHoldings} items={this.props.items} portfolioValue={this.props.portfolioValue} fetchPrices={this.props.fetchPrices}/>
                </div>
                
            </div>
        );
    }
}