// checking which radio button is selected
var dataSource = '';
if(document.getElementById('saleRadio').checked){
    dataSource = '../data files/arcSaleData.json';
    buildChart('sale', dataSource);
}
else if(document.getElementById('returnRadio').checked){
    dataSource = '../data files/arcReturnData.json';
    buildChart('return', dataSource);
}
else{
    alert('Error: Something went wrong!');
}

function buildChart(radioSelection, dataFilePath){
    // remove any prior diagrams
    d3.selectAll('svg').remove();

    var width = document.getElementById('dataviz').clientWidth;
    // this allows us to collect the width of the div where the SVG will go.

    var height = width/2;

    // set the dimensions and margins of the graph
    var margin = {top: height/5, right: width/5, bottom: height/5, left: width/5};

    var width = width - margin.left - margin.right;
    var height = height - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg1 = d3.select("#dataviz")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // Read dummy data
    d3.json(dataFilePath, function(data) {
        // console.log(data)

        // List of node names
        var allNodes = data.nodes.map(function(d){return d.week});
        var allCounts = data.links.map(function(d){ return d.count});
        var minCount = Math.min.apply(null, allCounts);
        var maxCount = Math.max.apply(null, allCounts);
        
        // A linear scale to position the nodes on the X axis
        var x = d3.scalePoint()
            .range([0, width])
            .domain(allNodes)
        
        var categories = function(dict){
            return Object.keys(dict).slice(1);
        } (data.nodes[0]);
        
        // set the color scale
        var arcColor = d3.scaleOrdinal()
        .domain(categories)
        .range(["greenyellow", "skyblue", "turquoise"]);
        
        var unitDistance = x(Math.min.apply(null, allNodes) + 1) - x(Math.min.apply(null, allNodes));
        var radius = unitDistance/3;

        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        // adding nodes and labels
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        
        // adding nodes with a donut chart
        svg1
        .selectAll('mynodes')
        .data(data.nodes)
        .enter()            
        .each(function(d, i){
            // Compute the position of each group on the pie:
            var pie = d3.pie()
            .sort(null) // Do not sort group by size
            .value(function(d) {
                return d.value; 
            })
            nodeData = {}
            for (key in d){
                if(key != 'week')
                    nodeData[key] = d[key];
            }
            
            var data_ready = pie(d3.entries(nodeData));
            // console.log('node arc', data_ready);

            svg1.selectAll('mydonuts')
            .data(data_ready)
            .enter()
            .append('path')
                .classed("arc", true)
                .attr('d', d3.arc()
                    .innerRadius(radius*0.5)         // This is the size of the donut hole
                    .outerRadius(radius)
                )
                .attr('fill', function(d) {
                    return(arcColor(d.data.key)) 
                })
                .attr("stroke", "darkslategrey")
                .style("stroke-width", "2px")
                .style("opacity", 1.0)
                .attr("transform", "translate(" + x(d.week) + ", " + height + ") rotate(120)")
                .attr("title", function(arc_d){
                    if(arc_d.index == 0)
                        return 'Sole usage in all weeks: ' + arc_d.data.value;
                    else if(arc_d.index == 1)
                        return 'Used more than once this week: ' + arc_d.data.value;
                    else
                        return 'Used once this week: ' + arc_d.data.value;
                });
        });

        // And give them a label
        svg1
        .selectAll("mylabels")
        .data(data.nodes)
        .enter()
        .append("text")
            .attr("x", function(d){ return(x(d.week))})
            .attr("y", height*1.2)
            .text(function(d){ return("Week " + d.week)})
            .style("text-anchor", "middle");
        
        // A color scale for link width groups:
        var offset = Math.ceil(minCount/20 - 1);
        var lowest = Math.ceil(minCount/20) - offset; // always 1
        var highest = Math.ceil(maxCount/20) - offset;

        var color = d3.scaleLinear().domain([lowest, highest])
        .range(["lightgrey", "darkslategrey"]);

        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        // adding links and counts
        /////////////////////////////////////////////////////////////////////////////////////////////////////////

        // Add the links
        svg1
        .selectAll('mylinks')
        .data(data.links)
        .enter()
        .append('path')
            .classed('link', true)
            .attr('d', function (d) {
                start = x(d.source)    // X position of start node on the X axis
                end = x(d.target)      // X position of end node
                if(start != end) {
                    return ['M', start,',', height,    // the arc starts at the coordinate x=start, y=height-30 (where the starting node is)
                        'A',                            // This means we're gonna build an elliptical arc
                        (start - end)/2, ',',    // Next 2 lines are the coordinates of the inflexion point. Height of this point is proportional with start - end distance
                        (start - end)/2, 0, 0, ',',
                        start < end ? 1 : 0, end, ',', height] // We always want the arc on top. So if end is before start, putting 0 here turn the arc upside down.
                        .join(' ');
                        //A25,100 0 1,1 10,0 l 50,0
                }
                else {
                    return ['M', start, ',', height,      // the arc starts at the coordinate x=start, y=height-30 (where the starting node is)
                        'C',                                   // This means we're gonna build an cubic Bézier curve
                        start-3*unitDistance/4, ',', height*0.8, // Next 2 lines are the coordinates of the inflexion point.
                        start+3*unitDistance/4, ',', height*0.8,
                        end, ',', height]                   // Curve ends at the same point as start.
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
        
        // adding counts over links
        svg1
        .selectAll('mycounts')
        .data(data.links)
        .enter()
        .append('text')
            .classed('count', true)
            .attr('x', function(d){
                return (x(d.source) + x(d.target))/2;
            })
            .attr('y', function(d){
                if(d.source != d.target)
                    return height - (x(d.target) - x(d.source))/2 - 10;
                else
                    return height*0.8;
            })
            .text(function(d) { 
                return d.count;
            })
            .style("text-anchor", "middle")
            .style("opacity", 0.2);


        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        // highlighting effects
        /////////////////////////////////////////////////////////////////////////////////////////////////////////

        // mouse hover
        svg1
        .selectAll('.arc')
        .on('mouseover', function(d, i){
            d3.selectAll('.arc')
                .style("opacity", 0.2);

            // highlight arcs
            d3.select(this)
                .attr('d', d3.arc()
                        .innerRadius(radius*0.5)         // This is the size of the donut hole
                        .outerRadius(radius*1.2)
                )
                .style("opacity", 1);

            // Highlight the links
            d3.selectAll('.link')
                .style('stroke-opacity', function (link_d) {
                    var week = Math.floor(i/3) + Math.min.apply(null, allNodes);
                    if(d.index == 0){
                        return 0.2;
                    }
                    else if(d.index == 1){
                        return link_d.source === week && link_d.target === week ? 1 : .2;
                    }
                    else{
                        return (link_d.source === week || link_d.target === week) && (link_d.source != link_d.target) ? 1 : .2;
                    }
                });
            
            // highlight counts
            d3.selectAll('.count')
                .style("opacity", function(text_d){
                    var week = Math.floor(i/3) + Math.min.apply(null, allNodes);
                    // console.log('week', week)            
                    if(d.index == 0){
                        return 0.2;
                    }
                    else if(d.index == 1){
                        return text_d.source === week && text_d.target === week ? 1 : .2;
                    }
                    else{
                        return (text_d.source === week || text_d.target === week) && (text_d.source != text_d.target) ? 1 : .2;
                    }
                });
        })

        svg1
        .selectAll('.arc')
        .on('mouseout', function(d, i){
            d3.selectAll('.arc')
                .attr('d', d3.arc()
                        .innerRadius(radius*0.5)         // This is the size of the donut hole
                        .outerRadius(radius*1)
                )
                .style("opacity", 1);

            // unfade all links
            d3.selectAll('.link')
                .style("stroke-opacity", 1);

            d3.selectAll('.count')
                .style("opacity", 0.2);
        });

        // append another svg object for legends
        var svg2 = d3.select("#dataviz")
        .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height/4 + margin.top + margin.bottom)
        .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + 0 + ")");
        
        // legend arcs config
        var arcGenerator = d3.arc();
        var pathData = arcGenerator({
            startAngle: 0,
            endAngle: Math.PI,
            innerRadius: radius*0.5,
            outerRadius: radius
        });

        // draw arcs
        svg2
        .selectAll('legArc')
        .data(categories)
        .enter()
        .append('path')
            .classed("legArc", true)
            .attr('d', pathData)
            .attr('fill', function(d){
                return arcColor(d);
            })
            .attr("stroke", "darkslategrey")
                .style("stroke-width", "2px")
                .style("opacity", 1.0)
            .attr("transform", function(d){
                var pos = categories.indexOf(d) + 1;
                return "translate(0, " + pos*height/6 + ") rotate(-90)"
            });

        // write totals
        svg2
        .selectAll('desc')
        .data(categories)
        .enter()
        .append('text')            
            .classed('total', true)
            .attr('x', width/15)
            .attr('y', function(d){                
                var pos = categories.indexOf(d) + 1;
                return pos * height/6 - height/18;
            })
            .text(function(d) {
                total = 0;
                for(var index in data.nodes){
                    var node = data.nodes[index];
                    total += node[d];
                }
                return total;
            })
            .attr("font-weight", 700)
            .attr("font-size", "16px");

        // write descriptions
        svg2
        .selectAll('desc')
        .data(categories)
        .enter()
        .append('text')            
            .classed('desc', true)
            .attr('x', function(d){
                return width/15;
            })
            .attr('y', function(d){                
                var pos = categories.indexOf(d) + 1;
                return pos*height/6;
            })
            .text(function(d) {
                var term = '';
                if(radioSelection == 'sale')
                    term = 'borrowed';
                else
                    term = 'returned';

                if(d == 'single')
                    return 'Cups ' + term + ' first and last time in the whole period';
                else if(d == 'self')
                    return 'Cups ' + term + ' 2 or more times in a week';
                else
                    return 'Cups ' + term + ' only once in a week';
            })

            // adding bootstrap tooltip
            $(".arc").tooltip({
                container: 'body',
                placement: 'right'
            });
    });    
}

// Build chart again on radio button selection change
function reloadChart(element) {
    if (element.id == 'saleRadio') {
        dataSource = '../data files/arcSaleData.json';
        console.log('sale here')
        buildChart('sale', dataSource);
    }
    else if (element.id == 'returnRadio') {
        dataSource = '../data files/arcReturnData.json';
        console.log('return here')
        buildChart('return', dataSource);
    }
    else{
        alert('Error: Something went wrong!');
    }
}