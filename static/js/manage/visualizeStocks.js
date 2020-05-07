import * as d3 from 'd3';

const draw = (data, div_title) => {
    // set the dimensions and margins of the graph
    var width = 450
    var height = 450
    var margin = 40

    // The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
    var radius = Math.min(width, height) / 2 - margin

    // append the svg object to the div called 'my_dataviz'
    console.log(div_title);
    var divToSelect = "." + div_title;
    console.log(divToSelect);

    // remove the old viz
    d3.select(divToSelect + " > *").remove();

    var svg = d3.select(divToSelect)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    // set the color scale
    var color = d3.scaleOrdinal(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56"])

    // Compute the position of each group on the pie:
    var pie = d3.pie()
        .value(function (d) { return d.total_value; })
    var data_ready = pie(data);

    // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
    svg
        .selectAll('whatever')
        .data(data_ready)
        .enter()
        .append('path')
        .attr('d', d3.arc()
            .innerRadius(0)
            .outerRadius(radius)
        )
        .attr('fill', function (d, i) { return (color(i)) })
        .attr("stroke", "black")
        .style("stroke-width", "2px")
        .style("opacity", 0.7)
}
export default draw