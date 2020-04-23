import React from "react";
import { Table } from 'react-bootstrap';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
} from "react-router-dom";
import TickerTable from "./TickerTableComponent";

export default class ManageComponent extends React.Component {
    render() {
        return (
            <TickerTable />
        );
    }
}