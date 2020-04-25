import React from "react";
import draw from './helpers.js'

export default class VisualizeComponent extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.props.fetchCurrentVisualize()
            .then(() => console.log('test post pull'));
            // .then(draw(this.props.visualize));
    }

    render() {
        return (
            <div className="viz"></div>
        );
    }
}