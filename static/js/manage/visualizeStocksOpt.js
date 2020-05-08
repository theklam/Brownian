import * as d3 from 'd3';

var arc1;
var svg1;
var outerArc1;
var radius1;
var color;

function arcTween(a) {
    var i = d3.interpolate(this._current, a);
    this._current = i(0);
    return function (t) {
        return arc1(i(t));
    };
}

const updateOpt = (data) => {
    console.log('im updating properly!');
    var pie = d3.pie()
        .sort(null) // Do not sort group by size
        .value(function (d) { return d.total_value; })
    var data_ready = pie(data);
    console.log('new data ready is: ');
    console.log(data_ready);

    // this represents the existing slices
    var existingSlices = svg1.selectAll('path')
        .data(data_ready, function (d) { return d.data.ticker; });

    existingSlices.transition().duration(500).attrTween("d", arcTween); // Smooth transition with arcTween

    var newSlices = existingSlices.enter()
        .append('path');

    var allSlices = newSlices.merge(existingSlices);
    allSlices.attr('d', arc1)
        .attr('fill', function (d) { return (color(d.data.ticker)) })
        .attr("stroke", "white")
        .style("stroke-width", "2px")
        .style("opacity", 0.7)

    existingSlices.exit().remove();

    // ~~~~~~~~~~~~~~~~~~~~~~~ Part 2: polyline ~~~~~~~~~~~~~~~~~~~~~~~~~

    // this represents the existing slices
    var existingSlices2 = svg1.selectAll('polyline')
        .data(data_ready, function (d) { return d.data.ticker; });

    existingSlices2.transition().duration(500); // Smooth transition with arcTween

    var newSlices2 = existingSlices2.enter()
        .append('polyline');

    var allSlices2 = newSlices2.merge(existingSlices2);
    allSlices2.attr("stroke", "black")
        .style("fill", "none")
        .attr("stroke-width", 1)
        .attr('points', function (d) {
            var posA = arc1.centroid(d) // line insertion in the slice
            var posB = outerArc1.centroid(d) // line break: we use the other arc generator that has been built only for that
            var posC = outerArc1.centroid(d); // Label position = almost the same as posB
            var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2 // we need the angle to see if the X position will be at the extreme right or extreme left
            posC[0] = radius1 * 0.95 * (midangle < Math.PI ? 1 : -1); // multiply by 1 or -1 to put it on the right or on the left
            return [posA, posB, posC]
        })

    existingSlices2.exit().remove();

    // ~~~~~~~~~~~~~~~~~~~~~~~ Part 3: text ~~~~~~~~~~~~~~~~~~~~~~~~~

    // this represents the existing slices
    var existingSlices3 = svg1.selectAll('text')
        .data(data_ready, function (d) { return d.data.ticker; });

    existingSlices3.transition().duration(500); // Smooth transition with arcTween

    var newSlices3 = existingSlices3.enter()
        .append('text');

    var allSlices3 = newSlices3.merge(existingSlices3);
    allSlices3.text(function (d) { console.log(d.data.ticker); return d.data.ticker })
        .attr('transform', function (d) {
            var pos = outerArc1.centroid(d);
            var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
            pos[0] = radius1 * 0.99 * (midangle < Math.PI ? 1 : -1);
            return 'translate(' + pos + ')';
        })
        .style('text-anchor', function (d) {
            var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
            return (midangle < Math.PI ? 'start' : 'end')
        })
    existingSlices3.exit().remove();
}

const drawOpt = (data, div_title) => {
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ don't touch ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ 
    var divToSelect = "." + div_title;
    d3.select(divToSelect + " > *").remove();
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ don't touch ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ 

    // set the dimensions and margins of the graph
    var width = 450
    var height = 450
    var margin = 40

    // The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
    radius1 = Math.min(width, height) / 2 - margin

    svg1 = d3.select(divToSelect)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    // set the color scale
    color = d3.scaleOrdinal(d3.schemeCategory10);

    // Compute the position of each group on the pie:
    var pie = d3.pie()
        .sort(null) // Do not sort group by size
        .value(function (d) { return d.total_value; })
    var data_ready = pie(data)
    console.log('data_ready is: ');
    console.log(data_ready);

    // The arc generator
    arc1 = d3.arc()
        .innerRadius(radius1 * 0.5)         // This is the size of the donut hole
        .outerRadius(radius1 * 0.8)

    // Another arc that won't be drawn. Just for labels positioning
    outerArc1 = d3.arc()
        .innerRadius(radius1 * 0.9)
        .outerRadius(radius1 * 0.9)

    // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
    svg1
        .selectAll('path')
        .data(data_ready, function (d, i) {
            return d.data.ticker;
        })
        .enter()
        .append('path')
        .attr('d', arc1)
        .attr('fill', function (d) { return (color(d.data.ticker)) })
        .attr("stroke", "white")
        .style("stroke-width", "2px")
        .style("opacity", 0.7)

    // Add the polylines between chart and labels:
    svg1
        .selectAll('polyline')
        .data(data_ready, function (d, i) {
            return d.data.ticker;
        })
        .enter()
        .append('polyline')
        .attr("stroke", "black")
        .style("fill", "none")
        .attr("stroke-width", 1)
        .attr('points', function (d) {
            var posA = arc1.centroid(d) // line insertion in the slice
            var posB = outerArc1.centroid(d) // line break: we use the other arc generator that has been built only for that
            var posC = outerArc1.centroid(d); // Label position = almost the same as posB
            var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2 // we need the angle to see if the X position will be at the extreme right or extreme left
            posC[0] = radius * 0.95 * (midangle < Math.PI ? 1 : -1); // multiply by 1 or -1 to put it on the right or on the left
            return [posA, posB, posC]
        })

    // Add the polylines between chart and labels:
    svg1
        .selectAll('text')
        .data(data_ready, function (d, i) {
            return d.data.ticker;
        })
        .enter()
        .append('text')
        .text(function (d) { console.log(d.data.ticker); return d.data.ticker })
        .attr('transform', function (d) {
            var pos = outerArc1.centroid(d);
            var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
            pos[0] = radius * 0.99 * (midangle < Math.PI ? 1 : -1);
            return 'translate(' + pos + ')';
        })
        .style('text-anchor', function (d) {
            var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
            return (midangle < Math.PI ? 'start' : 'end')
        })

}
export { drawOpt, updateOpt };