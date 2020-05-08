import React from "react";
import { Table, Dropdown, Form, Col, DropdownButton } from 'react-bootstrap';
import OptimizeButton from "./OptimizeButtonComponent";
import TickerTable from "./TickerTableComponent";
import VisualizeStocks from "./VisualizeStocksComponent";
import '../../css/manage.css'


export default class PortfolioOptimizationComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            optimizedReturns: '',
            optimizedVol: '',
            optimizedSharpe: '',
            optimizedWeights: [],
            optimizedItems: [],
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
        this.optimizePortfolio()
    }
    componentDidUpdate(prevProps) {
        if (this.props.items !== prevProps.items) {
            this.optimizePortfolio();
        }
    }

    optimizePortfolio() {
        let portfolio_stocks = this.props.items.map(a => a.ticker);
        let portfolio_values = this.props.items.map(a => a.total_value);
        let portfolio_prices = this.props.items.map(a => a.price);
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ stocks: portfolio_stocks, freq: 'daily', current_prices: portfolio_prices, values: portfolio_values, opt_style: this.state.opt_style, min_weight: this.state.minWeight, max_weight: this.state.maxWeight, userID: window.localStorage.getItem('userID')})
        };
        fetch('/optimizePortfolio', requestOptions)
            .then(response => response.json())
            .then(response => {
                let optimized_json = JSON.parse(response['new_holdings']);
                this.setState({
                    optimizedReturns: response["optimized_returns"],
                    optimizedVol: response["optimized_vol"],
                    optimizedSharpe: response["optimized_sharpe"],
                    optimizedWeights: response["optimized_weights"],
                    optimizedItems: Object.values(optimized_json)
                });
            });
    }

    updateHoldings(){
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
        let weight = parseFloat(event.target.value);
        if (weight == null ||isNaN(weight)){
            weight = 0.0
        }
        this.setState({ minWeight: weight });
    }

    handleChangeMaxWeight(event) {
        let weight = parseFloat(event.target.value);
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
                    <tr className="statTable__header">
                        <th>Statistic</th>
                        <th>Value</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Optimized Returns</td>
                        <td>{parseFloat(this.state.optimizedReturns*100).toFixed(2)+"%"}</td>
                    </tr>
                    <tr>
                        <td>Optimized Volatility</td>
                        <td>{parseFloat(this.state.optimizedVol*100).toFixed(2)+"%"}</td>
                    </tr>
                    <tr>
                        <td>Optimized Sharpe Ratio</td>
                        <td>{parseFloat(this.state.optimizedSharpe).toFixed(3)}</td>
                    </tr>
                </tbody>
                </Table>
                <VisualizeStocks items={this.state.optimizedItems} div_title="optimized"/>
                <Form >
                    <Form.Row className = 'updateForm'>
                        <Form.Group controlId="minWeightField" className='updateForm__group'>
                            <Form.Label className='updateForm__label text-muted'>Min Weight</Form.Label>
                            <Form.Control type='text' defaultValue='0.0' onChange={this.handleChangeMinWeight} />
                        </Form.Group>
                        <Form.Group controlId="maxWeightField" className='updateForm__group'>
                            <Form.Label className='updateForm__label text-muted'>Max Weight</Form.Label>
                            <Form.Control type='text' defaultValue='0.5' onChange={this.handleChangeMaxWeight} />
                        </Form.Group>
                        <DropdownButton className="manageButtonDiv" id="dropdown-basic-button" title="Optimize Portfolio">
                            <Dropdown.Item eventKey="max_sharpe" onSelect={this.handleSelect}>Maximize Sharpe Ratio</Dropdown.Item>
                            <Dropdown.Item eventKey="min_vol" onSelect={this.handleSelect}>Minimize Volatility</Dropdown.Item>
                        </DropdownButton>
                        <OptimizeButton fetchCurrentHoldings={this.props.fetchCurrentHoldings} updateHoldings={this.updateHoldings}/>
                    </Form.Row>
                </Form>
                <TickerTable items={this.state.optimizedItems} portfolioValue={this.props.portfolioValue} fetchCurrentHoldings={this.props.fetchCurrentHoldings} fetchPrices={this.props.fetchPrices}/>
                
            </div>
        );
    }
}