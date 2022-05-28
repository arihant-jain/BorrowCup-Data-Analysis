$(document).ready(function(){
    buildReturnChart();
    buildSaleChart();
})

function buildSaleChart(){
    var dataFilePath = './data files/saleScanRates.csv';
    // remove any prior diagrams
    // d3.selectAll('svg').remove();

    var width = document.getElementById('saleScanRateViz').clientWidth;
    // this allows us to collect the width of the div where the SVG will go.

    var height = width/2;

    // set the dimensions and margins of the graph
    // var margin = {top: Math.min(height/10, 50), right: Math.min(width/5, 30), bottom: Math.min(height/5, 20), left: Math.min(width/10, 50)};
    var margin = {top: height/10, right: width/20, bottom: height/10, left: width/10 + width/20};

    var width = width - margin.left - margin.right;
    var height = height - margin.top - margin.bottom;
    
    // append the svg object to the body of the page
    var svg = d3.select("#saleScanRateViz")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // Read the data
    d3.csv(dataFilePath, function(data){
        // group the data: I want to draw one line per cafe
        var sumstat = d3.nest() // nest function allows to group the calculation per level of a factor
            .key(function(d) { return d.cafe_name;})
            .entries(data);
        console.log(sumstat);
        
        var weekExtent = d3.extent(data, function(d) { return +d.week; });
        // Build X axis
        var x = d3.scaleLinear()
            .domain(weekExtent)
            .range([ 0, width ]);
        console.log("extent", weekExtent);
        
        var minPercent = Math.max(d3.min(data, function(d) { return +d.percent; }) - 5, 0);
        var maxPercent = Math.min(d3.max(data, function(d) { return +d.percent; }) + 5, 100);

        // Build Y axis
        var y = d3.scaleLinear()
        .domain([minPercent, maxPercent])
        .range([ height, 0 ]);

        // Add the vertical gridlines
        svg
        .append("g")			
            .attr("class", "grid")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x)
                .ticks(weekExtent[1] - weekExtent[0])
                .tickSize(-height)
                .tickFormat("")
            );
        
        // Add the horizontal gridlines
        svg
        .append("g")			
            .attr("class", "grid")                
            .call(d3.axisLeft(y)
                .ticks(5)
                .tickSize(-width)
                .tickFormat("")
            );

        // Add X axis
        svg
        .append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).ticks(weekExtent[1] - weekExtent[0]));

        // Add Y axis
        svg
        .append("g")
            .attr("class", "axis")
            .call(d3.axisLeft(y));

        // color palette
        var res = sumstat.map(function(d){ return d.key }) // list of group names
        var color = d3.scaleOrdinal()
            .domain(res)
            .range(d3.schemePaired) // 12 colour range


        // Add the line
        // Draw the line
        svg.selectAll(".line")
        .data(sumstat)
        .enter()
        .append("path")
            .attr("fill", "none")
            .attr("stroke", function(d){ return color(d.key) })
            .attr("stroke-width", 1.5)
            .attr("d", function(d){
                return d3.line()
                    .x(function(d) { return x(+d.week); })
                    .y(function(d) { return y(+d.percent); })
                    (d.values);
            });
        /*
        svg
        .append("path")
        .datum(data)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 2)
            .attr("d", d3.line()
                .x(function(d) { return x(d.date) })
                .y(function(d) { return y(d.percent) })
            );
        */
        
        // This allows to find the closest X index of the mouse:
        var bisect = d3.bisector(function(d) { return d.week; }).left;

        // Create the circle that travels along the curve of chart
        var focus = svg
        .append('g')
        .append('circle')
            .classed('circle', true)
            .style("fill", "none")
            .attr("stroke", "black")
            .attr('r', 8.5)
            .style("opacity", 0);

        // Create a rect on top of the svg area: this rectangle recovers mouse position
        svg
        .append('rect')
            .style("fill", "none")
            .style("pointer-events", "all")
            .attr('width', width)
            .attr('height', height)
            .on('mouseover', mouseover)
            .on('mousemove', mousemove)
            .on('mouseout', mouseout);

        var oldSelectedData = null;

        // What happens when the mouse move -> show the annotations at the right positions.
        function mouseover() {
            focus.style("opacity", 1);
        }

        function mousemove() {
            // recover coordinate we need
            var x0 = x.invert(d3.mouse(this)[0]);
            var i = bisect(data, x0, 1);
            var newSelectedData = data[i];
            focus
                .attr("cx", x(newSelectedData.week))
                .attr("cy", y(newSelectedData.percent))
                .attr("title", "<p class=' lead text-left'>" + newSelectedData.percent + "%" + 
                "</p><p class='text-left m-0'>" + newSelectedData.week + "</p>");

            if(oldSelectedData != null && oldSelectedData != newSelectedData){
                $(".circle").mouseout();
                $(".circle").tooltip("dispose");

                // adding bootstrap tooltip
                $(".circle").tooltip({
                    container: 'body',
                    placement: 'right',
                    html: true
                });
                $(".circle").mouseover();
            }
            oldSelectedData = newSelectedData;                
            
        }
        function mouseout() {
            focus.style("opacity", 0);
            $(".circle").mouseout();
        }

        // add title
        svg
        .append("text")
            .classed('title', true)
            .attr("x", width/2)
            .attr("y", -margin.top)
            .attr("alignment-baseline", "hanging")
            .text("Scan Rates - Sale")
                .style("text-anchor", "middle");
        
        // add x axis label
        svg
        .append("text")
            .attr("x", width/2)
            .attr("y", height + margin.bottom)
            .text("Week Number")
                .style("text-anchor", "middle");

        // add y axis label
        svg
        .append("text")
            .attr("transform", "translate(" + -margin.left/2 + ", " + height/2 + ") rotate(-90)")
            .attr("alignment-baseline", "hanging")
            .text("Percentage")
                .style("text-anchor", "middle");
        
        // add total days
        /*
        svg
        .append("text")
            .attr("x", width)
            .attr("y", "1rem")
            .text("Days: " + data.length)
                .style("text-anchor", "end");
        */
    });

}