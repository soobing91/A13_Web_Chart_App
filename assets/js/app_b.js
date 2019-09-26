// Set up an svg area
var svgArea = d3.select('body').select('svg')
    if (!svgArea.empty()) {
        svgArea.remove();
    };

var svgWidth = 800;
var svgHeight = 600;

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
    bottom: 100,
    left: 100
};

var chartWidth = svgWidth - margin.left - margin.right;
var chartHeight = svgHeight - margin.top - margin.bottom;

var chartGroup = svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

// Initial parameters
var chosen_xAxis = 'poverty';
var chosen_yAxis = 'healthcare';

// Updating axes function
function xScale(census, chosen_xAxis) {
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(census, (d) => d[chosen_xAxis] * 0.9),
            d3.max(census, (d) => d[chosen_xAxis] * 1.1)])
        .range([0, chartWidth]);

    return xLinearScale;
};

function yScale(census, chosen_yAxis) {
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(census, (d) => d[chosen_yAxis] * 0.9),
            d3.max(census, (d) => d[chosen_yAxis] * 1.1)])
        .range([chartHeight, 0]);
    
    return yLinearScale;
};

// Enable switching axes by clicking
function render_xAxis(new_xScale, xAxis) {
    var bottomAxis = d3.axisBottom(new_xScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
    
    return xAxis;
};

function render_yAxis(new_yScale, yAxis) {
    var leftAxis = d3.axisLeft(new_yScale);

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);
    
    return yAxis;
};

// Updating positions of bubbles and texts function
function renderCircle(circleGroup, new_xScale, chosen_xAxis, new_yScale, chosen_yAxis) {
    circleGroup.transition()
        .duration(1000)
        .attr('cx', (d) => new_xScale(d[chosen_xAxis]))
        .attr('cy', (d) => new_yScale(d[chosen_yAxis]));
    
    return circleGroup;
};

function renderText(textGroup, new_xScale, chosen_xAxis, new_yScale, chosen_yAxis) {
    textGroup.transition()
        .duration(1000)
        .attr('x', (d) => new_xScale(d[chosen_xAxis]))
        .attr('y', (d) => new_yScale(d[chosen_yAxis]));

    return textGroup;
};

// Updating tooltip
function updateTooltip(chosen_xAxis, chosen_yAxis, circleGroup) {
    if (chosen_xAxis === 'poverty') {
        var xLabel = 'Poverty';
    }
    else if (chosen_xAxis === 'age') {
        var xLabel = 'Age';
    }
    else {
        var xLabel = 'Household income';
    }

    if (chosen_yAxis === 'obesity') {
        var yLabel = 'Obesity';
    }
    else if (chosen_yAxis === 'smokes') {
        var yLabel = 'Smokes';
    }
    else {
        var yLabel = 'Healthcare';
    }

    var tooltip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([80, -60])
        .html((d) => `${d.state}<br>${xLabel}: ${d[chosen_xAxis]}<br>${yLabel}: ${d[chosen_yAxis]}`);
    
    circleGroup.call(tooltip);

    circleGroup.on('mouseover', tooltip.show)
        .on('mouseout', tooltip.hide);

    return circleGroup;
};

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
    var xLinearScale = xScale(census, chosen_xAxis);
    var yLinearScale = yScale(census, chosen_yAxis);
    
    // Axes functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Draw axes
    var xAxis = chartGroup.append('g')
        .attr('transform', `translate(0, ${chartHeight})`)
        .call(bottomAxis);
    
    var yAxis = chartGroup.append('g')
        .call(leftAxis);
    
    // Plot
    var circleGroup = chartGroup.selectAll('circle')
        .data(census)
        .enter()
        .append('circle')
        .attr('cx', (d) => xLinearScale(d[chosen_xAxis]))
        .attr('cy', (d) => yLinearScale(d[chosen_yAxis]))
        .attr('r', 15)
        .attr('opacity', '0.75')
        .classed('stateCircle', true);
    
    var textGroup = chartGroup.selectAll('.stateText')
        .data(census)
        .enter()
        .append('text')
        .attr('x', (d) => xLinearScale(d[chosen_xAxis]))
        .attr('y', (d) => yLinearScale(d[chosen_yAxis]))
        .attr('dy', 6)
        .text((d) => d.abbr)
        .classed('stateText', true);
    
    // Legends
    var legendGroup_x = chartGroup.append('g')
        .attr('transform', `translate(${chartWidth / 2}, ${chartHeight + 20})`);
    
    var legendGroup_y = chartGroup.append('g')
        .attr('transform', `translate(${0 - (margin.left / 3)}, ${chartHeight / 2})`)
    
    var legendPoverty = legendGroup_x.append('text')
        .attr('x', 0)
        .attr('y', 20)
        .attr('value', 'poverty')
        .text('In Poverty (%)')
        .classed('aText', true)
        .classed('active', true);
    
    var legendAge = legendGroup_x.append('text')
        .attr('x', 0)
        .attr('y', 40)
        .attr('value', 'age')
        .text('Age (Median)')
        .classed('aText', true)
        .classed('inactive', true);

    var legendIncome = legendGroup_x.append('text')
        .attr('x', 0)
        .attr('y', 60)
        .attr('value', 'income')
        .text('Household Income (Median)')
        .classed('aText', true)
        .classed('inactive', true);

    var legendObesity = legendGroup_y.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', 0)
        .attr('y', 0 - 60)
        .attr('dy', '1em')
        .text('Obese (%)')
        .classed('aText', true)
        .classed('inactive', true);

    var legendSmokes = legendGroup_y.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', 0)
        .attr('y', 0 - 40)
        .attr('dy', '1em')
        .text('Smokes (%)')
        .classed('aText', true)
        .classed('inactive', true);
    
    var legendHealthcare = legendGroup_y.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', 0)
        .attr('y', 0 - 20)
        .attr('dy', '1em')
        .text('Lacks Healthcare (%)')
        .classed('aText', true)
        .classed('active', true);
    
    var circleGroup = updateTooltip(chosen_xAxis, chosen_yAxis, circleGroup);

    // Event listener for x-axis
    legendGroup_x.selectAll('text')
        .on('click', function() {
            var value = d3.select(this)
                .attr('value');
            
            if (value !== chosen_xAxis) {
                chosen_xAxis = value; // Update x-axis accordingly by clicking
                xLinearScale = xScale(census, chosen_xAxis); // Update scale function
                xAxis = render_xAxis(xLinearScale, xAxis); // Update transition of the axis
                circleGroup = renderCircle(circleGroup, xLinearScale, chosen_xAxis, yLinearScale, chosen_yAxis); // Update bubbles
                circleGroup = updateTooltip(chosen_xAxis, chosen_yAxis, circleGroup); // Update tooltip
                textGroup = renderText(textGroup, xLinearScale, chosen_xAxis, yLinearScale, chosen_yAxis); // Update texts
                
                if (chosen_xAxis === 'poverty') {
                    legendPoverty
                        .classed('active', true)
                        .classed('inactive', false);
                    legendAge
                        .classed('active', false)
                        .classed('inactive', true);
                    legendIncome
                        .classed('active', false)
                        .classed('inactive', true);
                }
                else if (chosen_xAxis === 'age') {
                    legendPoverty
                        .classed('active', false)
                        .classed('inactive', true);
                    legendAge
                        .classed('active', true)
                        .classed('inactive', false);
                    legendIncome
                        .classed('active', false)
                        .classed('inactive', true);                
                }
                else {
                    legendPoverty
                        .classed('active', false)
                        .classed('inactive', true);
                    legendAge
                        .classed('active', false)
                        .classed('inactive', true);
                    legendIncome
                        .classed('active', true)
                        .classed('inactive', false);
                }
            }
        })

        // Event listener for y-axis
        legendGroup_y.selectAll('text')
        .on('click', function() {
            var value = d3.select(this)
                .attr('value');
            
            if (value !== chosen_yAxis) {
                chosen_yAxis = value; // Update x-axis accordingly by clicking
                yLinearScale = yScale(census, chosen_yAxis); // Update scale function
                yAxis = render_yAxis(yLinearScale, yAxis); // Update transition of the axis
                circleGroup = renderCircle(circleGroup, xLinearScale, chosen_xAxis, yLinearScale, chosen_yAxis); // Update bubbles
                circleGroup = updateTooltip(chosen_xAxis, chosen_yAxis, circleGroup); // Update tooltip
                textGroup = renderText(textGroup, xLinearScale, chosen_xAxis, yLinearScale, chosen_yAxis); // Update texts
                
                if (chosen_yAxis === 'obesity') {
                    legendObesity
                        .classed('active', true)
                        .classed('inactive', false);
                    legendSmokes
                        .classed('active', false)
                        .classed('inactive', true);
                    legendHealthcare
                        .classed('active', false)
                        .classed('inactive', true);
                }
                else if (chosen_yAxis === 'Smokes') {
                    legendObesity
                        .classed('active', false)
                        .classed('inactive', true);
                    legendSmokes
                        .classed('active', true)
                        .classed('inactive', false);
                    legendHealthcare
                        .classed('active', false)
                        .classed('inactive', true);                
                }
                else {
                    legendObesity
                        .classed('active', false)
                        .classed('inactive', true);
                    legendSmokes
                        .classed('active', false)
                        .classed('inactive', true);
                    legendHealthcare
                        .classed('active', true)
                        .classed('inactive', false);
                }
            }
        });
});