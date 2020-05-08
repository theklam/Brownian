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
        console.log('component mounted');
        console.log(this.props.items);
        draw(this.props.items, this.props.div_title);
    }

    componentDidUpdate() {
        console.log('component updated');
        console.log(this.props.items);
        draw(this.props.items, this.props.div_title);
    }

    render() {
        return (
            <div className={`${this.props.div_title} visualizeStocks`}></div>
        );
    }
}