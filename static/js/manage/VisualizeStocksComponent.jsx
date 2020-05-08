import React from "react";
import draw from './visualizeStocks.js'
import '../../css/manage.css'

/**
 * 
 */
export default class VisualizeStocksComponent extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        draw(this.props.items, this.props.div_title);
    }

    componentDidUpdate() {
        draw(this.props.items, this.props.div_title);
    }

    render() {
        return (
            <div className={`${this.props.div_title} visualizeStocks`}></div>
        );
    }
}