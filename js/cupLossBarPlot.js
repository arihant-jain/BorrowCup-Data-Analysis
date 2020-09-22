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

// X axis: initialisation:
var x = d3.scaleBand()
.range([0, width]);

var xAxis = svg.append("g");

// Y axis: initialisation
var y = d3.scaleLinear()
.range([height, 0]);
var yAxis = svg.append("g");

function update(dataFilePath){

    // Read dummy data
    d3.csv(dataFilePath, function(data) {

        // get x values
        xValues = data.map(function(d) { return parseInt(d.times_used); });
        xValues.sort(function(a, b){return a - b});

        x.domain(xValues)
        .padding(0.2);

        xAxis
        .attr("transform", "translate(0," + height + ")")
        .transition()
        .duration(1000)
            .call(d3.axisBottom(x));
        
        // find max value at y axis
        var allNumbers = data.map(function(d) { return parseInt(d.number_of_cups); });
        var maxNumber = Math.max.apply(null, allNumbers);

        // calculate max tick on y axis
        var num = maxNumber/10;
        var digits = 0;
        // count the digits to the left of decimal in num
        while(num > 0){
            num = Math.floor(num/10);
            digits += 1;
        }
        // this number will help us find gap
        var divideby = 10**(digits - 1);
        var gap = Math.round(maxNumber/(10*divideby))*divideby;
        var maxTick = Math.ceil(maxNumber/gap)*gap;

        y.domain([0, maxTick]);

        yAxis
        .transition()
        .duration(1000)
        .call(d3.axisLeft(y));

        var color = d3.scaleSequential().domain([Math.min.apply(null, xValues), Math.max.apply(null, xValues)])
        .interpolator(d3.interpolateCool);

        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // Bars
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        // Bars
        bars = svg
        .selectAll(".bar")
        .data(data);

        bars
        .enter()
        .append("rect")        
        .classed('bar', true)
        .merge(bars)
        .transition()   // and apply changes to all of them
        .duration(1000) // if you change this duration, change the bootstrap delay at the bottom too!
            .attr("x", function(d){
                return x(d.times_used);
            })
            .attr("y", function(d){
                return y(d.number_of_cups);
            })
            .attr("width", x.bandwidth())
            .attr("height", function(d){
                return height - y(d.number_of_cups);
            })
            .attr("fill", function(d){
                return color(d.times_used);
            })
            .attr("stroke", "darkslategrey")
                .style("stroke-width", "2px")
            .attr("title", function(d){
                var str = "<p class=' lead text-left'>" + parseInt(d.proportion) + "%" + 
                "</p><p class='text-left m-0'>" + "Times used: " + d.times_used + "<br>" + 
                "Number of cups: " + d.number_of_cups + "</p>";
                
                return str;
            });
        
        svg
        .selectAll('.extraBars')
        .transition()
        .duration(1000)
        .attr("transform", "translate(0,0)")
        .attr("y", function(d){
            return y(d.number_of_cups);
        })
        .attr("height", function(d){
            return height - y(d.number_of_cups);
        });

        // If less bar in the new histogram, delete the ones not in use anymore
        bars
        .exit()
        .classed('extraBars', true)
        .transition()
        .duration(1000)
            .attr("y", y(0))
            .attr("height", 0)  
            .attr("transform", "translate(400,0)")
        //.remove();

        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // Adding Percents
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        // percentages on top of bars
        svg
        .selectAll('.percents')
        .remove();

        svg
        .selectAll('.percents')
        .data(data)
        .enter()
        .append('text')
            .classed('percents', true)
            .attr("x", function(d){
                return x(d.times_used);    
            })
            .attr("y", function(d){
                return y(d.number_of_cups) - height/20;
            })
            .attr("transform", "translate(" + x.bandwidth()/2 + ", 0)")
            .text(function(d){
                return parseInt(d.proportion)+"%";    
            })
                .style("text-anchor", "middle");
        
        // remove prior totals
        svg
        .selectAll(".total")
        .remove();

        // add total cups label
        svg
        .append("text")
            .classed("total", true)
            .attr("x", width)
            .attr("y", 0)
            .text("Total Cups: " + allNumbers.reduce((a, b) => a + b, 0))
                .style("text-anchor", "end");

        // remove prior title
        svg
        .selectAll('.title')
        .remove();

        // add title
        svg
        .append("text")
            .classed('title', true)
            .attr("x", width/2)
            .attr("y", -height*0.2)
            .text(function(d){
                var title = document.getElementById('lostRadio').checked ? 'Cups Lost Bar Chart' : 'Cups Not Lost Bar Chart';
                return title;
            })
                .style("text-anchor", "middle");

        // add tooltip after delay of 1000 milliseconds cuz that is how much its gonna take for the
        // transition (animation)
        setTimeout(function() { 
            // adding bootstrap tooltip
            $(".bar").tooltip({
                container: 'body',
                placement: 'right',
                html: true
            });
        }, 1000);
        
    });
}

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


// initialise chart with lost data
update('../data files/numCupsLost.csv');

// Listen to radio button change -> update chart
d3.selectAll(".chart-type").on("change",function(){
    // checking which radio button is selected
    var source = this.value == 0 ? '../data files/numCupsLost.csv' : '../data files/numCupsNotLost.csv';
    
    update(source);
})  

// Call our resize function if the window size is changed.
window.onresize = function(){
    return location.reload();
};