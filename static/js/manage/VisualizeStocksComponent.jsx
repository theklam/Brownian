import React from "react";
import draw from './visualizeStocks.js'
import '../../css/visualizeStocks.css'; // Tell webpack that Button.js uses these styles


/**
 * 
 */
export default class VisualizeStocksComponent extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        draw(this.props.visualize, this.props.title);
    }

    render() {
        return (
            <div className="viz"></div>
        );
    }
}