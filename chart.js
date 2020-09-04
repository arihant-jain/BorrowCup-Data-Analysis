window.onload=function(){
    //var elem = document.getElementById('chart');
    //elem.style.width = 70 + "%";

    // set the dimensions and margins of the graph
    var margin = {top: 20, right: 30, bottom: 20, left: 30};

    var width = 850 - margin.left - margin.right;
    var height = 550 - margin.top - margin.bottom;
    
    // append the svg object to the body of the page
    var svg = d3.select("#dataviz")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");
    
    // Read dummy data
    d3.json('/arcData.json', function(data) {
    console.log(data)

    // List of node names
    var allNodes = data.nodes.map(function(d){return d.week});
    var allCounts = data.links.map(function(d){ return d.count});
    var minCount = Math.min.apply(null, allCounts);
    var maxCount = Math.max.apply(null, allCounts);
    
    // A linear scale to position the nodes on the X axis
    var x = d3.scalePoint()
        .range([0, width])
        .domain(allNodes)
    
    var unitDistance = x(Math.min.apply(null, allNodes)) - x(Math.min.apply(null, allNodes) + 1)
    
    // Add the circle for the nodes
    svg
    .selectAll("mynodes")
    .data(data.nodes)
    .enter()
    .append("circle")
        .attr("cx", function(d){ return(x(d.week))})
        .attr("cy", height-30)
        .attr("r", function(d){ return d.single/5})
        .style("fill", "#69b3a2");
    svg
    .selectAll("mynodes")
    .data(data.nodes)
    .enter()
    .append("circle")
        .attr("cx", function(d){ return(x(d.week))})
        .attr("cy", height-30)
        .attr("r", function(d){ return (d.single + d.self)/5 })
        .style("fill", "none")
        .style("stroke", 'red')
        .style("stroke-width", function(d){ return d.self/5*2 })

    // And give them a label
    svg
    .selectAll("mylabels")
    .data(data.nodes)
    .enter()
    .append("text")
        .attr("x", function(d){ return(x(d.week))})
        .attr("y", height-10)
        .text(function(d){ return("Week " + d.week)})
        .style("text-anchor", "middle")

    // Add the links
    svg
    .selectAll('mylinks')
    .data(data.links)
    .enter()
    .append('path')
    .attr('d', function (d) {
        start = x(d.source)    // X position of start node on the X axis
        end = x(d.target)      // X position of end node
        if(start != end) {
        return ['M', start,',', height-30,    // the arc starts at the coordinate x=start, y=height-30 (where the starting node is)
            'A',                            // This means we're gonna build an elliptical arc
            (start - end)/2, ',',    // Next 2 lines are the coordinates of the inflexion point. Height of this point is proportional with start - end distance
            (start - end)/2, 0, 0, ',',
            start < end ? 1 : 0, end, ',', height-30] // We always want the arc on top. So if end is before start, putting 0 here turn the arc upside down.
            .join(' ');
            //A25,100 0 1,1 10,0 l 50,0
        }
        else {
        return ['M', start, ',', height-30,      // the arc starts at the coordinate x=start, y=height-30 (where the starting node is)
            'C',                                   // This means we're gonna build an cubic Bézier curve
            start-3*unitDistance/4, ',', height-100, // Next 2 lines are the coordinates of the inflexion point.
            start+3*unitDistance/4, ',', height-100,
            end, ',', height-30]                   // Curve ends at the same point as start.
            .join(' ');
            //M200,500 C50,350 350,350 200,500
        }
    })
    .style("fill", "none")
    .attr("stroke", "grey")
    .style("stroke-width", function (d) { return curveWidth(d.count, minCount) })
    })
}
function curveWidth(count, min) {
    var offset = Math.ceil(min/20 - 1);
    val = Math.ceil(count/20) - offset;
    //console.log(val)
    return val;
}