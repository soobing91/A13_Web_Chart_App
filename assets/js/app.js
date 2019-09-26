// Set up an svg area
var svgArea = d3.select('body').select('svg')
    if (!svgArea.empty()) {
        svgArea.remove();
    };

var svgWidth = 700;
var svgHeight = 500;

var svg = d3.select('#scatter')
    .append('div')
    .classed('chart', true)
    .append('svg')
    .attr('width', svgWidth)
    .attr('height', svgHeight);

// Set up a chart area
var margin = {
    top: 20,
    right: 20,
    bottom: 80,
    left: 50
};

var chartWidth = svgWidth - margin.left - margin.right;
var chartHeight = svgHeight - margin.top - margin.bottom;

var chartGroup = svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

// Read the csv file
d3.csv('assets/data/data.csv').then(function(census) {
    console.log(census);

    // Parse data
    census.forEach((d) => {
        d.poverty = +d.poverty;
        d.age = +d.age;
        d.income = +d.income;
        d.obesity = +d.obesity;
        d.smokes = +d.smokes;
        d.healthcare = +d.healthcare;
    });

    // Scale functions
    var xLinearScale = d3.scaleLinear()
        .domain(d3.extent(census, (d) => d.poverty))
        .range([0, chartWidth]);
    
    var yLinearScale = d3.scaleLinear()
        .domain(d3.extent(census, (d) => d.healthcare))
        .range([chartHeight, 0]);
    
    // Axes functions
    var xAxis = d3.axisBottom(xLinearScale);
    var yAxis = d3.axisLeft(yLinearScale);

    // Draw axes
    chartGroup.append('g')
        .attr('transform', `translate(0, ${chartHeight})`)
        .call(xAxis);
    
    chartGroup.append('g')
        .call(yAxis);
    
    // Plot
    chartGroup.selectAll('circle')
        .data(census)
        .enter()
        .append('circle')
        .attr('cx', (d) => xLinearScale(d.poverty))
        .attr('cy', (d) => yLinearScale(d.healthcare))
        .attr('r', 15)
        .attr('opacity', '0.75')
        .classed('stateCircle', true);
    
    chartGroup.selectAll('text')
        .data(census)
        .enter()
        .append('text')
        .attr('x', (d) => xLinearScale(d.poverty))
        .attr('y', (d) => yLinearScale(d.healthcare))
        .attr('dy', 6)
        .text((d) => d.abbr)
        .classed('stateText', true);
    
    // Legends
    var legendGroup = chartGroup.append('g')
        .attr('transform', `translate(${chartWidth / 2}, ${chartHeight + 20})`);
    
    legendGroup.append('text')
        .attr('x', 0)
        .attr('y', 20)
        .text('In Poverty (%)')
        .classed('active', true);
    
    chartGroup.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', 0 - (chartHeight / 2))
        .attr('y', 0 - margin.left)
        .attr('dy', '1em')
        .text('Lacks Healthcare (%)')
        .classed('active', true);
});