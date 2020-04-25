import React from "react";
import draw from './helpers.js'

/**
 * VisualizeComponent takes in fetchCurrentVisualize function in order to re-fetch whatever
 * it is visualizing, but it does not care what it is visualizing. Also, it takes in 
 * visualize as a props, but it also doesn't care what it is visualizing. 
 */
export default class VisualizeComponent extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.props.fetchCurrentVisualize()
            .then(() => console.log('test post pull'))
            .then(() => draw(this.props.visualize, this.props.title));
    }

    render() {
        return (
            <div className="viz"></div>
        );
    }
}