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

export default class ManageComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoaded: false,
            items: []
        };
        this.fetchCurrentHoldings = this.fetchCurrentHoldings.bind(this);
    }

    fetchCurrentHoldings() {
        fetch("/holdings")
            .then(res => res.json())
            .then(
                (result) => {
                    console.log(result);
                    console.log(typeof (result));
                    console.log(typeof (result[0]));
                    console.log(Object.values(result));
                    this.setState({
                        isLoaded: true,
                        items: Object.values(result)
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

    componentDidMount() {
        this.fetchCurrentHoldings();
    }

    render() {
        return (
            <div>
                <TickerTable items={this.state.items} />
                <UpdateTickerTableForm fetchCurrentHoldings={this.fetchCurrentHoldings}/>
            </div>
        );
    }
}