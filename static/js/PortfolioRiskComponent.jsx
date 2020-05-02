import React from "react";
import { Table } from 'react-bootstrap';

export default class PortfolioRiskButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    componentDidMount() {
        this.fetchRisk();
    }

    fetchRisk() {
        let portfolio_stocks = this.props.items.map(a => a.ticker);
        let portfolio_values = this.props.items.map(a => a.total_value);
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ stocks: portfolio_stocks, freq: 'daily', values: portfolio_values })
        };
        fetch('/portfolioRisk', requestOptions)
            .then(response => response.json())
            .then(response => console.log(response));
    }

    render() {
        return (
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Username</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>1</td>
                        <td>Mark</td>
                        <td>Otto</td>
                        <td>@mdo</td>
                    </tr>
                    <tr>
                        <td>2</td>
                        <td>Jacob</td>
                        <td>Thornton</td>
                        <td>@fat</td>
                    </tr>
                    <tr>
                        <td>3</td>
                        <td colSpan="2">Larry the Bird</td>
                        <td>@twitter</td>
                    </tr>
                </tbody>
            </Table>
        );
    }
}