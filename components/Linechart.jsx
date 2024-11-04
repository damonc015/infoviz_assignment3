'use client';
import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';

const LineChart = ({ wageData, selectedStates, fedWage, setSelectedStates }) => {
  const svgRef = useRef();
  const [normOr2020, setNormOr2020] = useState(true);

  // useEffect(() => {
  //   console.log("selectedStates in LineChart:", selectedStates);
  // }, [wageData, selectedStates, fedWage]);

  useEffect(() => {
    if (!fedWage || Object.keys(fedWage).length === 0) return;

    d3.select(svgRef.current).selectAll("*").remove();

    // dimensions
    const margin = { top: 40, right: 300, bottom: 60, left: 60 };
    const width = 1200 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const selectedWage = normOr2020 ? 'wage' : 'wage2020';

    // scale the y-axis
    let allWages = fedWage.map(d => Number(d[selectedWage]));
    
    // scale y-axis for added state values
    if (wageData && selectedStates) {
      selectedStates.forEach(stateName => {
        const stateData = wageData.find(d => d.state === stateName);
        if (stateData) {
          const stateWages = stateData.data
            .map(d => Number(normOr2020 ? d['State.Minimum.Wage'] : d['State.Minimum.Wage.2020.Dollars']))
            .filter(wage => wage !== null && !isNaN(wage));
          allWages = allWages.concat(stateWages);
        }
      });
    }

    const xScale = d3.scaleLinear()
      .domain([1968, 2020])
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(allWages) * 1.1])
      .range([height, 0]);

    const colorScale = d3.scaleOrdinal()
      .range(d3.schemeCategory10.slice(1));

    // axes and title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', -margin.top / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .text('Federal vs. State Minimum Wage 1968-2020');

    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.format('d')));

    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height + margin.bottom - 10)
      .attr('text-anchor', 'middle')
      .text('Year');

    svg.append('g')
      .call(d3.axisLeft(yScale));

    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -margin.left + 20)
      .attr('x', -(height / 2))
      .attr('text-anchor', 'middle')
      .text('Dollars');

    // gridlines
    svg.append('g')
      .attr('class', 'grid')
      .attr('opacity', 0.05)
      .call(d3.axisLeft(yScale)
        .tickSize(-width)
        .tickFormat(''));

    svg.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0,${height})`)
      .attr('opacity', 0.05)
      .call(d3.axisBottom(xScale)
        .tickSize(-height)
        .tickFormat(''));

    // legend
    const legend = svg.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${width + 20}, 0)`);


    if (wageData && selectedStates) {
      selectedStates.forEach((stateName, index) => {
        const stateData = wageData.find(d => d.state === stateName);
        if (!stateData) return;

        const yearData = stateData.data.map(d => ({
          year: d.Year,
          wage: normOr2020 ? d['State.Minimum.Wage'] : d['State.Minimum.Wage.2020.Dollars']
        })).filter(d => d.wage !== null);

        const stateLine = d3.line()
          .x(d => xScale(d.year))
          .y(d => yScale(d.wage));

        // state lines
        svg.append('path')
          .datum(yearData)
          .attr('fill', 'none')
          .attr('stroke', colorScale(stateName))
          .attr('stroke-width', 1.5)
          .attr('opacity', 0.55)
          .attr('d', stateLine);

        // make legend items wrap to two columns
        const itemsPerColumn = 25;
        const columnWidth = 150;  
        const column = Math.floor(index / itemsPerColumn);
        const row = index % itemsPerColumn;
        const legendX = column * columnWidth;
        const legendY = (row * 20) + 20;  

        legend.append('line')
          .attr('x1', legendX)
          .attr('x2', legendX + 30)
          .attr('y1', legendY)
          .attr('y2', legendY)
          .attr('stroke', colorScale(stateName))
          .attr('stroke-width', 2);

        legend.append('text')
          .attr('x', legendX + 40)
          .attr('y', legendY + 4)
          .text(stateName)
          .style('font-size', '12px')
          .attr('alignment-baseline', 'middle');
      });
    }

    // federal wage line
    const fedLine = d3.line()
      .x(d => xScale(d.year))
      .y(d => yScale(d[selectedWage]));

    svg.append('path')
      .datum(fedWage)
      .attr('fill', 'none')
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 3)
      .attr('d', fedLine);

    // federal wage legend
    legend.append('line')
      .attr('x1', 0)
      .attr('x2', 30)
      .attr('y1', 0)
      .attr('y2', 0)
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 3);

    legend.append('text')
      .attr('x', 40)
      .attr('y', 4)
      .text('Federal Wage')
      .style('font-size', '12px')
      .attr('alignment-baseline', 'middle');

  }, [fedWage, wageData, selectedStates, normOr2020]);

  return (
    <div>
      {fedWage && Object.keys(fedWage).length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={() => setNormOr2020(true)}
            className={`buttons ${normOr2020 ? 'selected' : 'unselected'}`}
          >
            Unadjusted Dollars
          </button>
          <button
            onClick={() => setNormOr2020(false)}
            className={`buttons ${!normOr2020 ? 'selected' : 'unselected'}`}
          >
            2020 Adjusted Dollars
          </button>
          <button
            onClick={() => setSelectedStates([])}
            className={`buttons`}
          >
            Clear All States
          </button>
        </div>
      )}
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default LineChart;
