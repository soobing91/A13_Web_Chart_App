// Set up an svg area
var svgArea = d3.select('body').select('svg')
    if(!svgArea.empty()) {
        svgArea.remove();
    };

var svgWidth = 1000;
var svgHeight = 600;

var svg = d3.select('#scatter')
    .classed('chart', true)
    .append('svg')
    .attr('width', svgWidth)
    .attr('height', svgHeight);

// Set up a chart area
var margin = {
    top: 20,
    right: 100,
    bottom: 100,
    left: 100
};

var chartWidth = svgWidth - margin.left - margin.right;
var chartHeight = svgHeight - margin.top - margin.bottom;

var chartGroup = svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

// Set up initial parameters
var chosen_xAxis = 'poverty';
var chosen_yAxis = 'healthcare';

// Functions that re-scale axes with event listener triggered
function xScale(census, chosen_xAxis) {
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(census, (d) => d[chosen_xAxis] * 0.8),
            d3.max(census, (d) => d[chosen_xAxis] * 1.2)])
        .range([0, chartWidth]);
    
    return xLinearScale;
};

function yScale(census, chosen_yAxis) {
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(census, (d) => d[chosen_yAxis] * 0.8),
            d3.max(census, (d) => d[chosen_yAxis] * 1.2)])
        .range([chartHeight, 0]);
    
    return yLinearScale;
};

// Functions that draw the re-scaled axes
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
        .call(leftAxis)
    
    return yAxis;
};

// Functions that update positions of bubbles and texts
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

// Function that updates a tooltip
function updateTooltip(chosen_xAxis, chosen_yAxis, circleGroup) {
    if (chosen_xAxis === 'poverty') {
        var xLabel = 'In poverty (%)';
    }
    else if (chosen_xAxis === 'age') {
        var xLabel = 'Median age'
    }
    else {
        var xLabel = 'Median household income'
    }

    if (chosen_yAxis === 'healthcare') {
        var yLabel = 'Lack of healthcare (%)'
    }
    else if (chosen_yAxis === 'smokes') {
        var yLabel = 'Smokers (%)'
    }
    else {
        var yLabel = 'Obesity (%)'
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
        d.poverty = +d.poverty,
        d.age = +d.age,
        d.income = +d.income,
        d.healthcare = +d.healthcare,
        d.smokes = +d.smokes,
        d.obesity = +d.obesity
    });

    // Initial scale functions
    var xLinearScale = xScale(census, chosen_xAxis);
    var yLinearScale = yScale(census, chosen_yAxis);

    // Initial axes functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Draw initial axes
    var xAxis = chartGroup.append('g')
        .attr('transform', `translate(0, ${chartHeight})`)
        .call(bottomAxis);
    
    var yAxis = chartGroup.append('g')
        .call(leftAxis);
    
    // Initial bubbles and texts
    var circleGroup = chartGroup.selectAll('circle')
        .data(census)
        .enter()
        .append('circle')
        .attr('cx', (d) => xLinearScale(d[chosen_xAxis]))
        .attr('cy', (d) => yLinearScale(d[chosen_yAxis]))
        .attr('r', 15)
        .attr('opacity', 0.75)
        .classed('stateCircle', true);
    
    var textGroup = chartGroup.selectAll('stateText')
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
        .attr('transform', `translate(${0 - (margin.left / 3)}, ${chartHeight / 2})`);

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
    
    var legendHealthcare = legendGroup_y.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', 0)
        .attr('y', 0 - 20)
        .attr('dy', '1em')
        .attr('value', 'healthcare')
        .text('Lacks Healthcare (%)')
        .classed('aText', true)
        .classed('active', true);
    
    var legendSmokes = legendGroup_y.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', 0)
        .attr('y', -40)
        .attr('dy', '1em')
        .attr('value', 'smokes')
        .text('Smokes (%)')
        .classed('aText', true)
        .classed('inactive', true);
    
    var legendObesity = legendGroup_y.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', 0)
        .attr('y', 0 - 60)
        .attr('dy', '1em')
        .attr('value', 'obesity')
        .text('Obesity (%)')
        .classed('aText', true)
        .classed('inactive', true);
    
    // Update tooltip function above csv import
    var circleGroup = updateTooltip(chosen_xAxis, chosen_yAxis, circleGroup);

    // Event listener for x-axis
    legendGroup_x.selectAll('text')
        .on('click', function() {
            var value = d3.select(this).attr('value');

            if (value !== chosen_xAxis) {
                chosen_xAxis = value; // Updating the value accordingly
                xLinearScale = xScale(census, chosen_xAxis); // Re-scale the axis
                xAxis = render_xAxis(xLinearScale, xAxis); // Draw the re-scaled axis
                circleGroup = renderCircle(circleGroup, xLinearScale, chosen_xAxis, yLinearScale, chosen_yAxis); // Re-position bubbles
                circleGroup = updateTooltip(chosen_xAxis, chosen_yAxis, circleGroup); // Update tooltips
                textGroup = renderText(textGroup, xLinearScale, chosen_xAxis, yLinearScale, chosen_yAxis); // Re-position texts

                // Highlight the chosen axis
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
                };
            };
        });

    // Event listener for y-axis
    legendGroup_y.selectAll('text')
        .on('click', function() {
            var value = d3.select(this).attr('value');
        
            if (value !== chosen_yAxis) {
                chosen_yAxis = value; // Update the value accordingly
                yLinearScale = yScale(census, chosen_yAxis); // Re-scale the axis
                yAxis = render_yAxis(yLinearScale, yAxis); // Draw the re-scaled axis
                circleGroup = renderCircle(circleGroup, xLinearScale, chosen_xAxis, yLinearScale, chosen_yAxis); // Re-position bubbles
                circleGroup = updateTooltip(chosen_xAxis, chosen_yAxis, circleGroup); // Update tooltips
                textGroup = renderText(textGroup, xLinearScale, chosen_xAxis, yLinearScale, chosen_yAxis); // Re-position texts

                // Highlight the chosen axis
                if (chosen_yAxis === 'healthcare') {
                    legendHealthcare
                        .classed('active', true)
                        .classed('inactive', false);
                    legendSmokes
                        .classed('active', false)
                        .classed('inactive', true);
                    legendObesity
                        .classed('active', false)
                        .classed('inactive', true);
                }
                else if (chosen_yAxis === 'smokes') {
                    legendHealthcare
                        .classed('active', false)
                        .classed('inactive', true);
                    legendSmokes
                        .classed('active', true)
                        .classed('inactive', false);
                    legendObesity
                        .classed('active', false)
                        .classed('inactive', true);                
                }
                else {
                    legendHealthcare
                        .classed('active', false)
                        .classed('inactive', true);
                    legendSmokes
                        .classed('active', false)
                        .classed('inactive', true);
                    legendObesity
                        .classed('active', true)
                        .classed('inactive', false);
                };
            };
        });
});