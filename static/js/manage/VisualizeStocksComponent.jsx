import React from "react";
import { draw, update } from './visualizeStocks.js'
import { drawOpt, updateOpt } from './visualizeStocksOpt.js'
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
        if(this.props.div_title == 'optimized') {
            drawOpt(this.props.items, this.props.div_title);
        }
        else {
            draw(this.props.items, this.props.div_title);
        }
    }

    componentDidUpdate() {
        console.log('component updated');
        console.log(this.props.items);
        if(this.props.div_title == 'optimized') {
            updateOpt(this.props.items);
        }
        else {
            update(this.props.items);
        }
        // draw(this.props.items, this.props.div_title);
    }

    render() {
        return (
            <div className={`${this.props.div_title} visualizeStocks`}></div>
        );
    }
}