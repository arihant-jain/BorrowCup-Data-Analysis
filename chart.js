// global vars
var boundaryCircleWidth = 2;

window.onload=function(){
    //var elem = document.getElementById('chart');
    //elem.style.width = 70 + "%";

    // set the dimensions and margins of the graph
    var margin = {top: 100, right: 100, bottom: 100, left: 100};

    var width = 1000 - margin.left - margin.right;
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
        
        // Add circle for the nodes

        // outer circle for uses linking to other weeks (i.e. links between 2 different nodes (weeks))
        svg
        .selectAll("mynodes")
        .data(data.nodes)
        .enter()
        .append("circle")
            .classed('outerCircle', true)
            .attr("cx", function(d){ return(x(d.week))})
            .attr("cy", height-30)
            .attr("r", outerCircleRadius)
            .style("fill", "turquoise")
            .style("stroke", 'white')
            .style("stroke-width", boundaryCircleWidth);
        
        // mid circle for uses in the same week (i.e. self linking)
        svg
        .selectAll("mynodes")
        .data(data.nodes)
        .enter()
        .append("circle")
            .classed('midCircle', true)
            .attr("cx", function(d){ return(x(d.week))})
            .attr("cy", height-30)
            .attr("r", midCircleRadius)
            .style("fill", "skyblue")
            .style("stroke", 'white')
            .style("stroke-width", boundaryCircleWidth);

        // inner circle for single use in all weeks (i.e. no links)
        svg
        .selectAll("mynodes")
        .data(data.nodes)
        .enter()
        .append("circle")
            .classed('innerCircle', true)
            .attr("cx", function(d){ return(x(d.week))})
            .attr("cy", height-30)
            .attr("r", innerCircleRadius)
            .style("fill", "greenyellow")
            .style("stroke", "white")
            .style("stroke-width", 2);

        // And give them a label
        svg
        .selectAll("mylabels")
        .data(data.nodes)
        .enter()
        .append("text")
            .attr("x", function(d){ return(x(d.week))})
            .attr("y", height + 50)
            .text(function(d){ return("Week " + d.week)})
            .style("text-anchor", "middle");
        
        // A color scale for link width groups:
        var offset = Math.ceil(minCount/20 - 1);
        var lowest = Math.ceil(minCount/20) - offset; // always 1
        var highest = Math.ceil(maxCount/20) - offset;
        // for [1, 2, 3.....highest]
        var groups = Array.from(Array(highest), (_, i) => i + 1);

        var color = d3.scaleLinear().domain([1,highest])
        .range(["lightgrey", "darkslategrey"]);
        /* d3.scaleOrdinal()
        .domain(groups)
        .range(['black', 'blue', 'grey']); */

        // Add the links
        svg
        .selectAll('mylinks')
        .data(data.links)
        .enter()
        .append('path')
            .classed('link', true)
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
            .attr("stroke", function(d){ 
                return color(Math.ceil(d.count/20) - offset)
            })
            .style("stroke-width", function (d) { 
                return Math.ceil(d.count/20) - offset; 
            });

        // highlighting effects

        // mouse hover
        svg
        .selectAll('.innerCircle')
        .on('mouseover', function(d, i){
            d3.selectAll('circle')
            .style("opacity", 0.2);

            d3.selectAll('circle')
            .filter(function(data){
                return d.week == data.week;
            })
            .style("opacity", 1);

            d3.select(this)
            .attr('r', function(d){
                return innerCircleRadius(d) + 5;
            });
        })

        svg
        .selectAll('.innerCircle')
        .on('mouseout', function(d, i){
            d3.selectAll('circle')
            .style("opacity", 1);

            d3.select(this)
            .attr('r', innerCircleRadius)
        })

        svg
        .selectAll('.midCircle')
        .on('mouseover', function(d, i){
            d3.selectAll('circle')
            .style("opacity", 0.2);

            d3.selectAll('circle')
            .filter(function(data){
                return d.week == data.week;
            })
            .style("opacity", 1);

            d3.select(this)
            .attr('r', function(d){
                return midCircleRadius(d) + 5;
            });

            // Highlight the links
            d3.selectAll('.link')
            .style('stroke-opacity', function (link_d) {
                return link_d.source === d.week && link_d.target === d.week ? 1 : .2;
            });
        })

        svg
        .selectAll('.midCircle')
        .on('mouseout', function(d, i){
            d3.selectAll('circle')
            .style("opacity", 1);

            d3.select(this)
            .attr('r', midCircleRadius);

            d3.selectAll('.link')
            .attr("stroke", function(link_d){ 
                return color(Math.ceil(link_d.count/20) - offset);
            })
            .style("stroke-opacity", 1)
            .style("stroke-width", function (link_d) { 
                return Math.ceil(link_d.count/20) - offset; 
            });
        })

        svg
        .selectAll('.outerCircle')
        .on('mouseover', function(d, i){
            d3.selectAll('circle')
            .style("opacity", 0.2);

            d3.selectAll('circle')
            .filter(function(data){
                return d.week == data.week;
            })
            .style("opacity", 1);

            d3.select(this)
            .attr('r', function(d){
                return outerCircleRadius(d) + 5;
            });

            // Highlight the links
            d3.selectAll('.link')
            .style('stroke-opacity', function (link_d) {
                return (link_d.source === d.week || link_d.target === d.week) && (link_d.source != link_d.target) ? 1 : .2;
            });
        })

        svg
        .selectAll('.outerCircle')
        .on('mouseout', function(d, i){
            d3.selectAll('circle')
            .style("opacity", 1);

            d3.select(this)
            .attr('r', outerCircleRadius);

            d3.selectAll('.link')
            .attr("stroke", function(link_d){ 
                return color(Math.ceil(link_d.count/20) - offset);
            })
            .style("stroke-opacity", 1)
            .style("stroke-width", function (link_d) { 
                return Math.ceil(link_d.count/20) - offset; 
            });
        })
    })
}
/* function linkWidth(count, min) {
    var offset = Math.ceil(min/20 - 1);
    val = Math.ceil(count/20) - offset;
    //console.log(val)
    return val;
} */
function innerCircleRadius(node){
    return node.single > 0 ? node.single/5 : 0;
}
function midCircleRadius(node){
    // inner circle radius + boundary circle stroke width + mid circle radius
    if(node.self > 0) {
        if(innerCircleRadius(node) > 0){
            return innerCircleRadius(node) + boundaryCircleWidth/2 + node.self/5;
        }
        else {
            return node.self/5;
        }
    }
    else {
        if(innerCircleRadius(node) > 0){
            return innerCircleRadius(node);
        }
        else {
            return 0;
        }
    }
}
function outerCircleRadius(node){
    // mid circle radius + boundary circle stroke width + outer circle radius
    if(node.other > 0) {
        if(midCircleRadius(node) > 0){
            return midCircleRadius(node) + boundaryCircleWidth/2 + node.other/25;
        }
        else {
            return node.other/25;
        }
    }
    else {
        if(midCircleRadius(node) > 0){
            return midCircleRadius(node);
        }
        else {
            return 0;
        }
    }
}