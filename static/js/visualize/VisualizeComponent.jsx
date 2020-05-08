import React from "react";
import draw from './helpers.js'
import '../../css/visualize.css'; // Tell webpack that Button.js uses these styles


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
            benchmarkViz: []
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
                    this.setState({
                        isLoaded: true,
                        portfolioViz: tmp
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
                    this.setState({
                        isLoaded: true,
                        benchmarkViz: tmp
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
            <div className="viz"></div>
        );
    }
}