import * as d3 from 'd3'

let margin = { top: 20, left: 25, right: 0, bottom: 70 }

let height = 600 - margin.top - margin.bottom
let width = 800 - margin.left - margin.right

let svg = d3
  .select('#chart-4')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', `translate(${margin.left}, ${margin.top})`)

// The data set uses a time format like this: 2013-12-01.
let parseTime = d3.timeParse('%Y-%m-%d')

var xPositionScale = d3.scaleLinear().range([0, width])
var yPositionScale = d3.scaleLinear().range([height, 0])

var line = d3
  .line()
  .x(d => xPositionScale(d.date))
  .y(d => yPositionScale(d.pct_change))

Promise.all([
  d3.csv(require('./data/ces.csv')),
  d3.csv(require('./data/wages.csv'))
])
  .then(ready)
  .catch(err => console.log('Failed on', err))

function ready([ces, wages]) {
  console.log('the ces data:', ces)
  // console.log('the wages data', wages)

  // Creating a g for each row/job in ces data.
  svg
    .selectAll('.job-graphs')
    .data(ces)
    .enter()
    .append('g')
    .attr('class', 'job-graphs')
    .each(function(d) {
      var svg = d3.select(this)

      let dataColumns = Object.keys(d).filter(d => d[0] === '2')
      // console.log(dataColumns)
      let datapoints = dataColumns.map(colName => {
        return {
          name: d['industry'],
          jobs: +d[colName],
          date: parseTime(colName),
          pct_change:
            ((+d[colName] - +d['2004-01-01']) / +d['2004-01-01']) * 100
        }
      })
      // Give the xPositionScale its domain
      xPositionScale.domain([parseTime('2004-01-01'), parseTime('2014-04-01')])
      let pctChangeList = datapoints.map(d => d.pct_change)
      yPositionScale.domain(d3.extent(pctChangeList))
      console.log(pctChangeList)
      svg
        .datum(datapoints)
        .append('path')
        .attr('d', line)
        .attr('fill', 'none')
        .attr('stroke', 'red')

      console.log(datapoints)
    }) // end of .each function
} // end of ready function
