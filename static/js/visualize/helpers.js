import * as d3 from 'd3';

const draw = (props, title) => {
    // 2. Use the margin convention practice 
    var margin = { top: 50, right: 50, bottom: 50, left: 50 }
        , width = (Math.floor(window.innerWidth / 2)) - margin.left - margin.right // Use the window's width 
        , height = (Math.floor(.8 * window.innerHeight)) - margin.top - margin.bottom; // Use the window's height

    // The number of datapoints
    var n = props.length;

    // 5. X scale will use the index of our data
    var xScale = d3.scaleLinear()
        .domain([0, n - 1]) // input
        .range([0, width]); // output

    // 6. Y scale will use the randomly generate number 
    var yScale = d3.scaleLinear()
        .domain([0, d3.max(props)]) // input 
        .range([height, 0]); // output 

    // 7. d3's line generator
    var line = d3.line()
        .x(function (d, i) { return xScale(i); }) // set the x values for the line generator
        .y(function (d) { return yScale(d.y); }) // set the y values for the line generator 
    // .curve(d3.curveMonotoneX) // apply smoothing to the line

    // 8. An array of objects of length N. Each object has key -> value pair, the key being "y" and the value is a random number
    var dataset = d3.range(n).map(function (d) { return { "y": props[d] } })

    // 1. Add the SVG to the page and employ #2
    var svg = d3.select(".viz").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Set up reference to tooltip
    let tooltip = d3.select(".viz")     // HINT: div id for div containing scatterplot
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);
    /*
        Create tooltip as a div right underneath the SVG scatter plot.
        Initially tooltip is invisible (opacity 0). We add the tooltip class for styling.
     */

    // 3. Call the x axis in a group tag
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale)); // Create an axis component with d3.axisBottom

    // 4. Call the y axis in a group tag
    svg.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(yScale)); // Create an axis component with d3.axisLeft

    // 9. Append the path, bind the data, and call the line generator 
    svg.append("path")
        .datum(dataset) // 10. Binds data to the line 
        .attr("class", "line") // Assign a class for styling 
        .attr("d", line); // 11. Calls the line generator 

    // Mouseover function to display the tooltip on hover
    let mouseover = function (d) {
        let html = `<span style="color: brown;">${d.y}</span><br/>`;       // HINT: Display the song here

        // Show the tooltip and set the position relative to the event X and Y location
        tooltip.html(html)
            .style("left", `${(d3.event.pageX) - 220}px`)
            .style("top", `${(d3.event.pageY) - 30}px`)
            .style("box-shadow", `2px 2px 5px brown`)    // OPTIONAL for students
            .transition()
            .duration(200)
            .style("opacity", 0.9)

        console.log(d)
        d3.select(this).attr('class', 'focus');
    };

    // Mouseout function to hide the tool on exit
    let mouseout = function (d) {
        // Set opacity back to 0 to hide
        tooltip.transition()
            .duration(200)
            .style("opacity", 0);

        d3.select(this).attr('class', 'dot');
    };

    // 12. Appends a circle for each datapoint 
    svg.selectAll(".dot")
        .data(dataset)
        .enter().append("circle") // Uses the enter().append() method
        .attr("class", "dot") // Assign a class for styling
        .attr("cx", function (d, i) { return xScale(i) })
        .attr("cy", function (d) { return yScale(d.y) })
        .attr("r", 5)
        .on("mouseover", mouseover)
        .on("mouseout", mouseout)

    svg.append("text")
        .attr("x", (width / 2))
        .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("text-decoration", "underline")
        .text(title);
}
export default draw