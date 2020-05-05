import React from "react";
import { Table } from 'react-bootstrap';

export default class PortfolioRiskButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            historicalReturns: 0,
            historicalVol: 0,
            historicalSharpe: 0
        };
    }

    componentDidMount() {
        this.fetchRisk();
    }
    componentDidUpdate(prevProps) {
        if (this.props.items !== prevProps.items) {
            this.fetchRisk();
        }
    }

    fetchRisk() {
        let portfolio_stocks = this.props.items.map(a => a.ticker);
        let portfolio_values = this.props.items.map(a => a.total_value);
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ stocks: portfolio_stocks, freq: 'daily', values: portfolio_values, userID: window.localStorage.getItem('userID')})
        };
        fetch('/portfolioRisk', requestOptions)
            .then(response => response.json())
            .then(response => {
                this.setState({
                    historicalReturns: response["port_hist_returns"],
                    historicalVol: response["port_vol"],
                    historicalSharpe: response["port_hist_sharpe"]
                });
            });
    }

    render() {
        return (
            <Table striped bordered hover>
                <thead>
                    <tr className="statTable__header">
                        <th>Statistic</th>
                        <th>Value</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Returns</td>
                        <td>{parseFloat(this.state.historicalReturns*100).toFixed(2)+"%"}</td>
                    </tr>
                    <tr>
                        <td>Volatility</td>
                        <td>{parseFloat(this.state.historicalVol*100).toFixed(2)+"%"}</td>
                    </tr>
                    <tr>
                        <td>Sharpe Ratio</td>
                        <td>{this.state.historicalSharpe}</td>
                    </tr>
                </tbody>
            </Table>
        );
    }
}