function buildReturnChart(){
    var dataFilePath = './data files/returnScanRates.csv';
    // remove any prior diagrams
    // d3.selectAll('svg').remove();

    var width = document.getElementById('returnScanRateViz').clientWidth;
    // this allows us to collect the width of the div where the SVG will go.

    var height = width/2;

    // set the dimensions and margins of the graph
    var margin = {top: height/10, right: width/20, bottom: height/10, left: width/10 + width/20};

    var width = width - margin.left - margin.right;
    var height = height - margin.top - margin.bottom;
    
    // append the svg object to the body of the page
    var svg = d3.select("#returnScanRateViz")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    //Read the data
    d3.csv(dataFilePath,
        // When reading the csv, I must format variables:
        function(d) {
            var output = { 
                date : d3.timeParse("%Y-%m-%d")(d.date), 
                count : +d.count,
                washed : +d.washed,
                percent : +d.percent
            }
            return output;
        },
        // Now I can use this dataset:
        function(data){

            // Build X axis --> it is a date format
            var x = d3.scaleTime()
                .domain(d3.extent(data, function(d) { return d.date; }))
                .range([ 0, width ]);
            
            // Build Y axis
            var y = d3.scaleLinear()
            .domain([Math.max(d3.min(data, function(d) { return +d.percent; }) - 5, 0), d3.max(data, function(d) { return +d.percent; }) + 5])
            .range([ height, 0 ]);

            // Add the vertical gridlines
            svg
            .append("g")			
                .attr("class", "grid")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x)
                    .ticks(5)
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
                .call(d3.axisBottom(x));


            // Add Y axis
            svg
            .append("g")
                .attr("class", "axis")
                .call(d3.axisLeft(y));

            // Add the line
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

            
            // This allows to find the closest X index of the mouse:
            var bisect = d3.bisector(function(d) { return d.date; }).left;

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
                    .attr("cx", x(newSelectedData.date))
                    .attr("cy", y(newSelectedData.percent))
                    .attr("title", "<p class=' lead text-left'>" + newSelectedData.percent + "%" + 
                    "</p><p class='text-left m-0'>" + newSelectedData.date.toDateString().substr(4) + "</p>");

                if(oldSelectedData != null && oldSelectedData != newSelectedData){
                    console.log("inside")
                    console.log("old-new", oldSelectedData, newSelectedData)
                    console.log("old == new", oldSelectedData == newSelectedData)
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
                .text("Scan Rate - Return")
                    .style("text-anchor", "middle");
            
            // add x axis label
            svg
            .append("text")
                .attr("x", width/2)
                .attr("y", height + margin.bottom)
                .text("Date")
                    .style("text-anchor", "middle");

            // add y axis label
            svg
            .append("text")
                .attr("transform", "translate(" + -margin.left/2 + ", " + height/2 + ") rotate(-90)")
                .attr("alignment-baseline", "hanging")
                .text("Percentage")
                    .style("text-anchor", "middle");
            
            // add total days
            svg
            .append("text")
                .attr("x", width)
                .attr("y", "1rem")
                .text("Days: " + data.length)
                    .style("text-anchor", "end");

        });

}
