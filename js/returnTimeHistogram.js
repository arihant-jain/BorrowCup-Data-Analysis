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
var x = d3.scaleLinear()
.range([0, width]);

var xAxis = svg.append("g");

// Y axis: initialisation
var y = d3.scaleLinear()
.range([height, 0]);
var yAxis = svg.append("g");

// right y Axis initialisation for density plot
var ky = d3.scaleLinear()
.range([height, 0])
var kyAxis = svg.append("g");

function update(dataFilePath, binWidth){
    console.log('binWidth', binWidth);

    // Read dummy data
    d3.csv(dataFilePath, function(data) {

        // find max value of duration
        maxDuration = d3.max(data, function(d) { return +d.duration });
        maxDayValue = Math.ceil(maxDuration/binWidth)*binWidth;
        console.log('maxDayValue', maxDayValue);

        x.domain([0, maxDayValue]);

        xAxis
        .attr("transform", "translate(0," + height + ")")
        .transition()
        .duration(1000)
        .call(d3.axisBottom(x));

        // set the parameters for the histogram
        var histogram = d3.histogram()
        .value(function(d) { return d.duration; })   // give the vector of value
        .domain(x.domain())  // then the domain of the graphic
        .thresholds(x.ticks(maxDayValue/binWidth)); // then the numbers of bins

        // And apply this function to data to get the bins
        var bins = histogram(data);
        // console.log('bins', bins);

        // find max frequency from all bins
        var maxFreq = d3.max(bins, function(d) { return d.length; });

        // calculate max tick on y axis
        var num = maxFreq/10;
        var digits = 0;
        // count the digits to the left of decimal in num
        while(num > 0){
            num = Math.floor(num/10);
            digits += 1;
        }
        // this number will help us find gap
        var divideby = 10**(digits - 1);
        var gap = Math.round(maxFreq/(10*divideby))*divideby;
        var maxTick = Math.ceil(maxFreq/gap)*gap;

        // Y axis: scale and draw:
        y.domain([0, maxTick]);   // d3.hist has to be called before the Y axis obviously
        
        yAxis
        .transition()
        .duration(1000)
        .call(d3.axisLeft(y));

        // color scale (only for fun - not needed!)
        var color = d3.scaleSequential().domain([Math.max.apply(null, x.ticks(maxDayValue/binWidth)), 0])
        .interpolator(d3.interpolateCool);

        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // Histogram bars
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        // Join the rect with the bins data
        var bars = svg.selectAll("rect")
        .data(bins.slice(0, -1));

        // Manage the existing bars and eventually the new ones:
        bars
        .enter()
        .append("rect") // Add a new rect for each new elements
        .classed('bar', true)
        .merge(bars)    // get the already existing elements as well
        .transition()   // and apply changes to all of them
        .duration(1000)
            .attr("x", 1)
            .attr("transform", function(d) { 
                // console.log('bar move x', d.x0, x(d.x0), 'bar move y', d.length, y(d.length));
                return "translate(" + x(d.x0) + "," + y(d.length) + ")"; 
            })
            .attr("width", function(d) { return x(d.x1) - x(d.x0) -1 ; })
            .attr("height", function(d) { return height - y(d.length); })
            .attr("fill", function(d){
                return color(d.x0);
            });
                
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // Adding Percents
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        
        svg
        .selectAll('.percents')
        .remove();

        svg
        .selectAll('.percents')
        .data(bins.slice(0, -1))
        .enter()
        .append("text")
            .classed('percents', true)
            .attr("transform", function(d) {
                var mx = x(d.x0) + 1 + (x(d.x1) - x(d.x0) - 1)/2;
                var my = y(d.length) - 10;
                if(binWidth >= 1){
                    return "translate(" + mx + "," + my + ")";
                }
                else{
                    var fontSize = getComputedStyle(document.getElementsByClassName('percents')[0]).fontSize;
                    fontSize = parseInt(fontSize.substring(0, 2))*0.75;
                    mx += fontSize/2;
                    my -= 20;
                    return "translate(" + mx + "," + my + ") rotate(-90)";
                }
            })
            .attr("text-anchor", "middle")
            .text(function(d) {
                return Math.round(d.length/data.length*100) + '%';
            });
        
        
        // If less bar in the new histogram, I delete the ones not in use anymore
        bars
        .exit()
        .remove();

        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // Kernel Density Plot
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        
        // Compute kernel density estimation (3 is the bandwidth used for smoothing)
        smoothness = 3;     // bandwidth
        var kde = kernelDensityEstimator(kernelEpanechnikov(smoothness), x.ticks(maxDayValue/binWidth));
        var density =  kde(data.map(function(d){  return d.duration; }) );

        // define domain for right y axis
        var maxValue = Math.max.apply(null, density.map(function(d){
            return d[1];
        }))
        ky.domain([0, maxValue]);

        // draw right y axis
        kyAxis
        .transition()
        .duration(1000)
        .attr("transform", "translate("+ width + ",0)")
        .call(d3.axisRight(ky));

        // First remove prior plots and then plot the area
        svg
        .selectAll('.densityCurve')
        .remove();
        
        // draw curve
        svg
        .append("path")
            .attr("class", "densityCurve")
        .datum(density)
            .attr("fill", "none")
            .attr("opacity", ".8")
            .attr("stroke", "green")
            .attr("stroke-width", 2)
            .attr("stroke-linejoin", "round")
            .attr("d",  d3.line()
                .curve(d3.curveBasis)
                .x(function(d) { return x(d[0]); })
                .y(function(d) { return ky(d[1]); })
            );

        // remove prior totals
        svg
        .selectAll(".total")
        .remove();

        // add total cups label
        svg
        .append("text")
            .classed('total', true)
            .attr("x", width/2)
            .attr("y", 0)
            .text("Total Uses: " + data.length)
                .style("text-anchor", "middle");

        // adding bootstrap tooltip
        $(".bar").tooltip({
            container: 'body',
            placement: 'right',
            title: function(){
                var d = d3.select(this).datum(); // get data bound to rect
                return d.length + " uses"; 
            }
        });
    });
}

// add title
svg
.append("text")
    .classed('title', true)
    .attr("x", width/2)
    .attr("y", -height*0.2)
    .text("Histogram with density curve for cups return time")
        .style("text-anchor", "middle");

// add x axis label
svg
.append("text")
    .attr("x", width/2)
    .attr("y", height*1.2)
    .text("Duration in days")
        .style("text-anchor", "middle");

// add y axis label
svg
.append("text")
    .attr("transform", "translate(" + -width/10 + ", " + height/2 + ") rotate(-90)")
    .text("Number of uses")
        .style("text-anchor", "middle");

// add right y axis label
svg
.append("text")
    .attr("transform", "translate(" + width*1.1 + ", " + height/2 + ") rotate(90)")
    .text("Probability density")
        .style("text-anchor", "middle");

// initialise chart with true data and 1 day bin
update('../data files/durations.csv', 1);

// Listen to the button -> update if user change it
d3.select("#binWidth").on("change", function() {
    // checking which radio button is selected
    var isTrueChecked = document.getElementById('trueRadio').checked;
    var source = isTrueChecked ? '../data files/durations.csv' : '../data files/durationsImputed.csv';
    update(source, this.options[this.selectedIndex].value);
});

// Listen to radio button change -> update chart
d3.selectAll(".source").on("change",function(){
    // checking which radio button is selected
    var source = this.value == 0 ? '../data files/durations.csv' : '../data files/durationsImputed.csv';
    // get bin width selection
    var selectElement = document.getElementById("binWidth");
    var days = selectElement.options[selectElement.selectedIndex].value;
    update(source, days);
})

// Function to compute density
function kernelDensityEstimator(kernel, X) {
    return function(V) {
        return X.map(function(x) {
            return [x, d3.mean(V, function(v) { return kernel(x - v); })];
        });
    };
}
function kernelEpanechnikov(k) {
    return function(v) {
        return Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0;
    };
}  

// Call our resize function if the window size is changed.
window.onresize = function(){
    return location.reload();
};