import React from "react";
import draw from './helpers.js'
import '../../css/visualize.css'; // Tell webpack that Button.js uses these styles
import { Table } from 'react-bootstrap';

/**
 * VisualizeComponent takes in fetchCurrentVisualize function in order to re-fetch whatever
 * it is visualizing, but it does not care what it is visualizing. Also, it takes in 
 * visualize as a props, but it also doesn't care what it is visualizing. 
 */
export default class VisualizeComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            portfolioViz: [],
            portReturn:'',
            portHigh:'',
            portLow:'',
            benchmarkViz: [],
            benchReturn:'',
            benchHigh:'',
            benchLow:''
        };
        this.fetchCurrentPortfolio = this.fetchCurrentPortfolio.bind(this);
        this.fetchCurrentBenchmark = this.fetchCurrentBenchmark.bind(this);
    }

    fetchCurrentPortfolio() {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ freq: 'monthly', userID: window.localStorage.getItem('userID') })
        };
        return fetch("/visualize", requestOptions)
            .then(res => res.json())
            .then(
                (result) => {
                    console.log(result);
                    let tmp = Object.values(result);
                    tmp = tmp.map(x => x.values);
                    let returns= '';
                    let high = '';
                    let low= '';
                    if (tmp.length>0){
                        returns = (tmp[tmp.length -1] -tmp[0])/tmp[0];
                        high = Math.max(...tmp);
                        low = Math.min(...tmp);
                    }
                    this.setState({
                        isLoaded: true,
                        portfolioViz: tmp,
                        portReturn: returns,
                        portHigh:high,
                        portLow:low
                    });
                },
                // Note: it's important to handle errors here
                // instead of a catch() block so that we don't swallow
                // exceptions from actual bugs in components.
                (error) => {
                    this.setState({
                        isLoaded: true,
                        error
                    });
                }
            )
    }

    fetchCurrentBenchmark() {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ freq: 'monthly', userID: window.localStorage.getItem('userID') })
        };
        return fetch("/visualizeBenchmark", requestOptions)
            .then(res => res.json())
            .then(
                (result) => {
                    console.log('optimized portfolio');
                    console.log(result);
                    let tmp = Object.values(result);
                    tmp = tmp.map(x => x.price);
                    let returns= '';
                    let high = '';
                    let low= '';
                    if (tmp.length>0){
                        returns = (tmp[tmp.length -1] -tmp[0])/tmp[0];
                        high = Math.max(...tmp);
                        low = Math.min(...tmp);
                    }
                    this.setState({
                        isLoaded: true,
                        benchmarkViz: tmp,
                        benchReturn: returns,
                        benchHigh:high,
                        benchLow:low
                    });
                },
                // Note: it's important to handle errors here
                // instead of a catch() block so that we don't swallow
                // exceptions from actual bugs in components.
                (error) => {
                    this.setState({
                        isLoaded: true,
                        error
                    });
                }
            )
    }

    getYAxisMax() {
        const combined = this.state.portfolioViz.concat(this.state.benchmarkViz);
        return Math.max(...combined);
    }

    componentDidMount() {
        Promise.all([
            this.fetchCurrentBenchmark(),
            this.fetchCurrentPortfolio()
        ]).then(allResponses => {
            const yAxisMax = this.getYAxisMax();
            draw(this.state.portfolioViz, 'Your Portfolio', yAxisMax);
            draw(this.state.benchmarkViz, 'Benchmark (S+P 500)', yAxisMax);
        })
    }

    render() {
        return (
            <div>
                <h1 className = "visualize__heading">Historical Graphs</h1>
                <div className="viz"></div>

                <h1 className = "visualize__heading"> Historical Statistics</h1>
                <Table striped bordered hover>
                    <thead>
                        <tr className="visualize__table__header"> 
                            <th>Statistic</th>
                            <th>Your Portfolio</th>
                            <th>Benchmark</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr> 
                            <td>Returns</td>
                            <td>{parseFloat(this.state.portReturn*100).toFixed(2)+"%"}</td>
                            <td>{parseFloat(this.state.benchReturn*100).toFixed(2)+"%"}</td>
                        </tr>
                        <tr> 
                            <td>High</td>
                            <td>{parseFloat(this.state.portHigh).toFixed(2)}</td>
                            <td>{parseFloat(this.state.benchHigh).toFixed(2)}</td>
                        </tr>
                        <tr> 
                            <td>Low</td>
                            <td>{parseFloat(this.state.portLow).toFixed(2)}</td>
                            <td>{parseFloat(this.state.benchLow).toFixed(2)}</td>
                        </tr>
                    </tbody>
                </Table>

            </div>
            
        );
    }
}