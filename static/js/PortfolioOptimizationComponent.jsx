import React from "react";
import { Table, Dropdown, Form, Col, DropdownButton } from 'react-bootstrap';
import OptimizeButton from "./OptimizeButtonComponent";


export default class PortfolioOptimizationComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            optimizedReturns: '',
            optimizedVol: '',
            optimizedSharpe: '',
            optimizedWeights: [],
            opt_style: 'max_sharpe',
            minWeight:0.0,
            maxWeight:0.5
        };
        this.optimizePortfolio = this.optimizePortfolio.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
        this.updateHoldings = this.updateHoldings.bind(this);
        this.handleChangeMinWeight = this.handleChangeMinWeight.bind(this);
        this.handleChangeMaxWeight = this.handleChangeMaxWeight.bind(this);

    }

    componentDidMount() {
        
    }

    optimizePortfolio() {
        let portfolio_stocks = this.props.items.map(a => a.ticker);
        let portfolio_values = this.props.items.map(a => a.total_value);
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ stocks: portfolio_stocks, freq: 'daily', values: portfolio_values, opt_style: this.state.opt_style, min_weight: this.state.minWeight, max_weight: this.state.maxWeight, userID: window.localStorage.getItem('userID')})
        };
        fetch('/optimizePortfolio', requestOptions)
            .then(response => response.json())
            .then(response => {
                console.log(this.state.minWeight)
                console.log(this.state.maxWeight)
                console.log(response)
                this.setState({
                    optimizedReturns: response["optimized_returns"],
                    optimizedVol: response["optimized_vol"],
                    optimizedSharpe: response["optimized_sharpe"],
                    optimizedWeights: response["optimized_weights"]
                });
            });
    }

    updateHoldings(){
        console.log('update holdings')
        let portfolio_stocks = this.props.items.map(a => a.ticker);
        let portfolio_values = this.props.items.map(a => a.total_value);
        let portfolio_prices = this.props.items.map(a => a.price);
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ stocks: portfolio_stocks, freq: 'daily', values: portfolio_values, optimizedWeights: this.state.optimizedWeights, prices: portfolio_prices, userID: window.localStorage.getItem('userID')})
        };
        fetch('/rebalancePortfolio', requestOptions)
            .then(response => response.json())
            .then(response => {
                this.props.fetchCurrentHoldings()
            });
    }


    handleSelect(eventKey){
        this.state.opt_style = eventKey
        this.optimizePortfolio()
    }

    handleChangeMinWeight(event) {
        let weight = parseInt(event.target.value);
        if (weight == null ||isNaN(weight)){
            weight = 0.0
        }
        this.setState({ minWeight: weight });
    }

    handleChangeMaxWeight(event) {
        let weight = parseInt(event.target.value);
        if (weight == null ||isNaN(weight)){
            weight = 0.5
        }
        this.setState({ maxWeight: weight });
    }

    render() {
        return (
            <div>
                <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Statistic</th>
                        <th>Value</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Optimized Returns</td>
                        <td>{this.state.optimizedReturns}</td>
                    </tr>
                    <tr>
                        <td>Optimized Volatility</td>
                        <td>{this.state.optimizedVol}</td>
                    </tr>
                    <tr>
                        <td>Optimized Sharpe Ratio</td>
                        <td>{this.state.optimizedSharpe}</td>
                    </tr>
                </tbody>
                </Table>
                <Form>
                    <Form.Row>
                        <Col>
                            <Form.Control placeholder="Minimum Weight" onChange={this.handleChangeMinWeight} />
                        </Col>
                        <Col>
                            <Form.Control placeholder="Maximum Weight" onChange={this.handleChangeMaxWeight} />
                        </Col>
                        <DropdownButton id="dropdown-basic-button" title="Optimize Portfolio">
                            <Dropdown.Item eventKey="max_sharpe" onSelect={this.handleSelect}>Maximize Sharpe Ratio</Dropdown.Item>
                            <Dropdown.Item eventKey="min_vol" onSelect={this.handleSelect}>Minimize Volatility</Dropdown.Item>
                        </DropdownButton>
                        <OptimizeButton fetchCurrentHoldings={this.props.fetchCurrentHoldings} updateHoldings={this.updateHoldings}/>
                    </Form.Row>
                </Form>
                
            </div>
        );
    }
}