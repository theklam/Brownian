import * as d3 from 'd3';

var arc;
var svg;

const update = (data) => {
    console.log('im updating properly!');
    var pie = d3.pie()
        .sort(null) // Do not sort group by size
        .value(function (d) { return d.total_value; })
    var data_ready = pie(data);
    console.log('new data ready is: ');
    console.log(data_ready);

    svg
        .selectAll('allSlices')
        .data(data_ready)
        .enter()
        .append('path')
        .attr('d', arc)
        // .attr('fill', function (d) { return (color(d.data.ticker)) })
        .attr("stroke", "white")
        .style("stroke-width", "2px")
        .style("opacity", 0.7)

    // var path = d3.select(divToSelect).selectAll("path").data(data_ready); // Compute the new angles
    // console.log(arc);
    // path.attr("d", arc); // redrawing the path
    // d3.selectAll("text").data(pie).attr("transform", function (d) { return "translate(" + labelArc.centroid(d) + ")"; }); // recomputing the centroid and translating the text accordingly.
}

const draw = (data, div_title) => {
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ don't touch ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ 
    var divToSelect = "." + div_title;
    d3.select(divToSelect + " > *").remove();
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ don't touch ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ 

    // set the dimensions and margins of the graph
    var width = 450
    var height = 450
    var margin = 40

    // The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
    var radius = Math.min(width, height) / 2 - margin

    svg = d3.select(divToSelect)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    // groups should be: ['AAPL', 'TSLA', ...]
    // let tickers = data.map(function (d) { return d.ticker });
    // console.log(tickers);

    // set the color scale
    // var color = d3.scaleOrdinal()
    //     .domain(tickers)
    //     .range(d3.schemeDark2);

    // Compute the position of each group on the pie:
    var pie = d3.pie()
        .sort(null) // Do not sort group by size
        .value(function (d) { return d.total_value; })
    var data_ready = pie(data)
    console.log('data_ready is: ');
    console.log(data_ready);

    // The arc generator
    arc = d3.arc()
        .innerRadius(radius * 0.5)         // This is the size of the donut hole
        .outerRadius(radius * 0.8)

    // Another arc that won't be drawn. Just for labels positioning
    // var outerArc = d3.arc()
    //     .innerRadius(radius * 0.9)
    //     .outerRadius(radius * 0.9)

    // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
    svg
        .selectAll('allSlices')
        .data(data_ready)
        .enter()
        .append('path')
        .attr('d', arc)
        // .attr('fill', function (d) { return (color(d.data.ticker)) })
        .attr("stroke", "white")
        .style("stroke-width", "2px")
        .style("opacity", 0.7)

    // Add the polylines between chart and labels:
    // svg
    //     .selectAll('allPolylines')
    //     .data(data_ready)
    //     .enter()
    //     .append('polyline')
    //     .attr("stroke", "black")
    //     .style("fill", "none")
    //     .attr("stroke-width", 1)
    //     .attr('points', function (d) {
    //         var posA = arc.centroid(d) // line insertion in the slice
    //         var posB = outerArc.centroid(d) // line break: we use the other arc generator that has been built only for that
    //         var posC = outerArc.centroid(d); // Label position = almost the same as posB
    //         var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2 // we need the angle to see if the X position will be at the extreme right or extreme left
    //         posC[0] = radius * 0.95 * (midangle < Math.PI ? 1 : -1); // multiply by 1 or -1 to put it on the right or on the left
    //         return [posA, posB, posC]
    //     })

    // // Add the polylines between chart and labels:
    // svg
    //     .selectAll('allLabels')
    //     .data(data_ready)
    //     .enter()
    //     .append('text')
    //     .text(function (d) { console.log(d.data.ticker); return d.data.ticker })
    //     .attr('transform', function (d) {
    //         var pos = outerArc.centroid(d);
    //         var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
    //         pos[0] = radius * 0.99 * (midangle < Math.PI ? 1 : -1);
    //         return 'translate(' + pos + ')';
    //     })
    //     .style('text-anchor', function (d) {
    //         var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
    //         return (midangle < Math.PI ? 'start' : 'end')
    //     })

}
export { draw, update };