import * as d3 from 'd3'

let margin = { top: 100, left: 50, right: 150, bottom: 30 }

let height = 700 - margin.top - margin.bottom

let width = 600 - margin.left - margin.right

let svg = d3
  .select('#chart-2')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', `translate(${margin.left}, ${margin.top})`)

let parseTime = d3.timeParse('%B-%y')

let xPositionScale = d3.scaleLinear().range([0, width])
let yPositionScale = d3.scaleLinear().range([height, 0])

let colorScale = d3
  .scaleOrdinal()
  .range([
    '#8dd3c7',
    '#ffffb3',
    '#bebada',
    '#fb8072',
    '#80b1d3',
    '#fdb462',
    '#b3de69',
    '#fccde5',
    '#d9d9d9',
    '#bc80bd'
  ])

let line = d3
  .line()
  .x(function(d) {
    return xPositionScale(d.datetime)
  })
  .y(function(d) {
    return yPositionScale(d.price)
  })

d3.csv(require('./data/housing-prices.csv'))
  .then(ready)
  .catch(err => {
    console.log(err)
  })

function ready(datapoints) {
  datapoints.forEach(d => {
    d.datetime = parseTime(d.month)
  })
  let dates = datapoints.map(d => d.datetime)
  let prices = datapoints.map(d => +d.price)

  xPositionScale.domain(d3.extent(dates))
  yPositionScale.domain(d3.extent(prices))

  let nested = d3
    .nest()
    .key(function(d) {
      return d.region
    })
    .entries(datapoints)

  svg
    .append('text')
    .attr('class', 'title-text')
    .attr('font-size', '24')
    .attr('text-anchor', 'middle')
    .text('U.S. housing prices fall in winter')
    .attr('x', width / 2)
    .attr('y', -40)
    .attr('dx', 40)

  let rectWidth =
    xPositionScale(parseTime('February-17')) -
    xPositionScale(parseTime('November-16'))

  let xAxis = d3
    .axisBottom(xPositionScale)
    .tickFormat(d3.timeFormat('%b %y'))
    .ticks(9)
  svg
    .append('g')
    .attr('class', 'axis x-axis')
    .attr('transform', 'translate(0,' + height + ')')
    .call(xAxis)

  let yAxis = d3.axisLeft(yPositionScale)
  svg
    .append('g')
    .attr('class', 'axis y-axis')
    .call(yAxis)

  d3.select('#intro-graph-2').on('stepin', () => {
    // console.log('hello intro graph 2!')
    svg
      .selectAll('.price-line')
      .transition()
      .remove()
    svg
      .selectAll('.price-circle')
      .transition()
      .remove()
    svg
      .selectAll('.region-text')
      .transition()
      .remove()
  })

  d3.select('#add-lines').on('stepin', () => {
    // console.log(nested)
    svg
      .selectAll('.price-line')
      .data(nested)
      .enter()
      .append('path')
      .transition()
      .attr('class', 'price-line')
      .attr('d', d => line(d.values))
      .attr('stroke', d => colorScale(d.key))
      .attr('stroke-width', 2)
      .attr('fill', 'none')

    svg
      .selectAll('.price-circle')
      .data(nested)
      .enter()
      .append('circle')
      .attr('class', 'price-circle')
      .attr('r', 4)
      .attr('cy', d => yPositionScale(d.values[0].price))
      .attr('cx', d => xPositionScale(d.values[0].datetime))
      .attr('fill', d => colorScale(d.key))

    svg
      .selectAll('.region-text')
      .data(nested)
      .enter()
      .append('text')
      .attr('class', 'region-text')
      .attr('y', d => yPositionScale(d.values[0].price))
      .attr('x', d => xPositionScale(d.values[0].datetime))
      .text(d => d.key)
      .attr('dx', 6)
      .attr('dy', 4)
      .attr('font-size', '12')
  })

  d3.select('#highlight-average').on('stepin', () => {
    // console.log('avg highlight working')

    svg.selectAll('.price-circle').attr('fill', d => {
      if (d.key === 'U.S.') {
        return 'red'
      } else {
        return 'lightgrey'
      }
    })

    svg
      .selectAll('.region-text')
      .attr('fill', d => {
        if (d.key === 'U.S.') {
          return 'red'
        } else {
          return 'lightgrey'
        }
      })
      .style('font-weight', 800)

    svg.selectAll('.price-line').attr('stroke', d => {
      if (d.key === 'U.S.') {
        return 'red'
      } else {
        return 'lightgrey'
      }
    })
  })

  d3.select('#highlight-region').on('stepin', () => {
    // console.log('region highlight working')
    var expensiveRegions = [
      'Pacific',
      'Mountain',
      'West South Central',
      'South Atlantic'
    ]
    svg.selectAll('.price-circle').attr('fill', d => {
      if (expensiveRegions.indexOf(d.key) !== -1) {
        return '#c0e1eb'
      } else if (d.key === 'U.S.') {
        return 'red'
      } else {
        return 'lightgrey'
      }
    })

    svg.selectAll('.region-text').attr('fill', d => {
      if (expensiveRegions.indexOf(d.key) !== -1) {
        return '#c0e1eb'
      } else if (d.key === 'U.S.') {
        return 'red'
      } else {
        return 'lightgrey'
      }
    })

    svg.selectAll('.price-line').attr('stroke', d => {
      if (expensiveRegions.indexOf(d.key) !== -1) {
        return '#c0e1eb'
      } else if (d.key === 'U.S.') {
        return 'red'
      } else {
        return 'lightgrey'
      }
    })

    svg
      .select('.winter-rect')
      .transition()
      .remove()
  })

  d3.select('#winter-rect').on('stepin', () => {
    // console.log('last step')
    svg
      .append('rect')
      .attr('class', 'winter-rect')
      .attr('x', xPositionScale(parseTime('December-16')))
      .attr('y', 0)
      .attr('width', rectWidth)
      .attr('height', height)
      .attr('fill', '#C2DFFF')
      .lower()
  })

  function render() {
    // console.log('time to rerender')
    let screenWidth = svg.node().parentNode.parentNode.offsetWidth
    let screenHeight = svg.node().parentNode.parentNode.offsetHeight
    let newWidth = screenWidth - margin.left - margin.right
    let newHeight = screenHeight - margin.top - margin.bottom

    let actualSvg = d3.select(svg.node().parentNode)
    actualSvg
      .attr('height', newHeight + margin.top + margin.bottom)
      .attr('width', newWidth + margin.left + margin.right)

    xPositionScale.range([0, newWidth])
    yPositionScale.range([newHeight, 0])

    svg.select('.title-text').attr('x', newWidth / 2)

    rectWidth =
      xPositionScale(parseTime('February-17')) -
      xPositionScale(parseTime('November-16'))

    svg
      .select('.winter-rect')
      .attr('x', xPositionScale(parseTime('December-16')))
      .attr('width', rectWidth)
      .attr('height', newHeight)

    svg.select('.x-axis').call(xAxis)
    svg.select('.y-axis').call(yAxis)
  }
  window.addEventListener('resize', render)
  render()
}
