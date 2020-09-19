var dataSource = '../data files/numCupsByTimesUsed.csv';
buildChart(dataSource);

function buildChart(dataFilePath){
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
    var svg = d3.select("#dataviz")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // Read dummy data
    d3.csv(dataFilePath, function(data) {
        console.log(data);


        // get x values
        xValues = data.map(function(d) { return parseInt(d.times_used); });
        xValues.sort(function(a, b){return a - b});
        
        // X axis
        var x = d3.scaleBand()
        .range([0, width])
        .domain(xValues)
        .padding(0.2);

        svg
        .append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "translate(0,0)rotate(0)")
                .style("text-anchor", "middle");
        
        // find max value at y axis
        allNumbers = data.map(function(d) { return parseInt(d.number_of_cups); });
        maxNumber = Math.ceil(Math.max.apply(null, allNumbers)/50)*50;

        // Add Y axis
        var y = d3.scaleLinear()
        .domain([0, maxNumber])
        .range([ height, 0]);

        svg
        .append("g")
            .call(d3.axisLeft(y));

        
        var color = d3.scaleSequential().domain([Math.min.apply(null, xValues), Math.max.apply(null, xValues)])
        .interpolator(d3.interpolateViridis);
        
        // Bars
        svg
        .selectAll("bar")
        .data(data)
        .enter()
        .each(function(d, i){
            // console.log('d val', d);
            bar = svg
            .append("rect")
                .classed('bar', true)
                .attr("x", x(d.times_used))
                .attr("y", y(0))
                .attr("width", x.bandwidth())
                .attr("height", height - y(0))
                .attr("fill", color(d.times_used))
                .attr("stroke", "darkslategrey")
                    .style("stroke-width", "2px")
                .attr("title", "<p class=' lead text-left'>" + parseInt(d.proportion) + "%" + 
                "</p><p class='text-left m-0'>" + "Times used: " + d.times_used + "<br>" + 
                "Number of cups: " + d.number_of_cups + "</p>");

            // Animation
            bar
            .transition()
            .duration(1000)
                .attr("y", y(d.number_of_cups))
                .attr("height",height - y(d.number_of_cups))
                .delay(i*100);

            // percentages on top of bars
            svg
            .append('text')
                .attr("x", x(d.times_used))
                .attr("y", y(d.number_of_cups) - height/20)
                .attr("transform", "translate(" + x.bandwidth()/2 + "0)")
                .text(parseInt(d.proportion)+"%")
                    .style("text-anchor", "middle");
        })
        
        // add title
        svg
        .append("text")
            .classed('title', true)
            .attr("x", width/2)
            .attr("y", -height*0.2)
            .text("Cups Use Frequency Plot")
                .style("text-anchor", "middle");
        
        // add x axis label
        svg
        .append("text")
            .attr("x", width/2)
            .attr("y", height*1.2)
            .text("Times used")
                .style("text-anchor", "middle");

        // add y axis label
        svg
        .append("text")
            .attr("transform", "translate(" + -width/10 + ", " + height/2 + ") rotate(-90)")
            .text("Number of cups")
                .style("text-anchor", "middle");
         
        // add total cups label
        svg
        .append("text")
            .attr("x", width)
            .attr("y", 0)
            .text("Total Cups: " + allNumbers.reduce((a, b) => a + b, 0))
                .style("text-anchor", "end");

        // adding bootstrap tooltip
        $(".bar").tooltip({
            container: 'body',
            placement: 'right',
            html: true
        });
        
    });    
}

// Call our resize function if the window size is changed.
window.onresize = function(){
    return location.reload();
};