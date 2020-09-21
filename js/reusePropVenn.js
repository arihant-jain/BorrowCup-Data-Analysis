d3.json('../data files/reusePerWeekNumbers.json', function(data){
    console.log(data);

    // remove any prior diagrams
    d3.selectAll('svg').remove();

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // for SALES (left side)
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    var width = document.getElementById('datavizleft').clientWidth;
    // this allows us to collect the width of the div where the SVG will go.

    var height = width*0.75;

    // set the dimensions and margins of the graph
    var margin = {top: height/5, right: width/5, bottom: height/5, left: width/5};

    var width = width - margin.left - margin.right;
    var height = height - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var leftSVG = d3.select("#datavizleft")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    var chart = venn.VennDiagram()
    .width(width)
    .height(height);

    var color = ["red", "gold", "chartreuse", "deepskyblue", "magenta", "dimgray"];

    // build venn digram
    leftSVG
    .datum(data.fromSale)
    .call(chart);
    
    leftSVG
    .selectAll("path")
    .classed("circleSale", true)
    .classed("circle", true);

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // for RETURNS (right side)
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    width = document.getElementById('datavizright').clientWidth;
    // this allows us to collect the width of the div where the SVG will go.

    height = width*0.75;

    // set the dimensions and margins of the graph
    margin = {top: height/5, right: width/5, bottom: height/5, left: width/5};

    width = width - margin.left - margin.right;
    height = height - margin.top - margin.bottom;

    // append the svg object to the body of the page
    rightSVG = d3.select("#datavizright")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    chart = venn.VennDiagram()
    .width(width)
    .height(height);

    // build venn diagram
    rightSVG
    .datum(data.fromReturn)
    .call(chart);
    
    rightSVG
    .selectAll("path")
    .classed("circleReturn", true)
    .classed("circle", true);

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // add styling to both diagrams
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    d3
    .selectAll("text")
        .style("fill", "black");

    d3
    .selectAll(".venn-circle path")
        .style("fill-opacity", 0.6)
        .style("fill", function(d, i){
            return color[i];
        })
        .style("stroke-width", 1)
        .style("stroke-opacity", 1)
        .style("stroke", "fff");
    
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Highlighting groups
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    d3
    .selectAll(".circle")
    .on("mouseover", function(d, i){
        d3
        .select(this)
            .style("stroke-width", 3)
            .style("stroke", "black")
            .raise();
    });

    d3
    .selectAll(".circle")
    .on("mouseout", function(d, i){
        var isIntersection = this.parentNode.classList.contains("venn-intersection");

        d3
        .select(this)
            .style("stroke-width", isIntersection ? 0 : 1)
            .style("stroke", isIntersection ? "none" : "fff")
            .lower();
    });

    // add title
    leftSVG
    .append("text")
        .classed('title', true)
        .attr("x", width/2)
        .attr("y", -height*0.2)
        .text("From Sales")
            .style("text-anchor", "middle");
    rightSVG
    .append("text")
        .classed('title', true)
        .attr("x", width/2)
        .attr("y", -height*0.2)
        .text("From Returns")
            .style("text-anchor", "middle");

    // add totals
    leftSVG
    .append("text")
        .attr("x", width/2)
        .attr("y", -height*0.1)
        .text("Total cups: " + data.saleUnion)
            .style("text-anchor", "middle");
    rightSVG
    .append("text")
        .attr("x", width/2)
        .attr("y", -height*0.1)
        .text("Total cups: " + data.returnUnion)
            .style("text-anchor", "middle");

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Bootstrap tooltip
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    $(".circle").tooltip({
        container: 'body',
        placement: 'bottom',
        html: true,
        title: function(){
            var name = $(this).parent().attr("data-venn-sets");
            name = name.replaceAll("_", ", ");
            // find the index of last time word was used
            // please note lastIndexOf() is case sensitive
            var n = name.lastIndexOf(", ");

            // slice the string in 2, one from the start to the lastIndexOf
            // and then replace the word in the rest
            name = name.slice(0, n) + name.slice(n).replace(", ", " or ");
            var d = d3.select(this).datum(); // get data bound to rect
            var total = this.classList.contains("circleSale") ? data.saleUnion : data.returnUnion;
            return '<p class="lead text-left m-0">' + Math.round(d.size/total*100) + '%</p>' +
            '<p class="lead text-left m-0">' + name + '</p>';
        }
    });

});

// Call our resize function if the window size is changed.
window.onresize = function(){
    return location.reload();
};