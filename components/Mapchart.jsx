'use client';
import React, { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'


const Mapchart = ({statesData, selectedStates, setSelectedStates}) => {
  const svgRef = useRef()

  useEffect(() => {
    if (!statesData) return

    d3.select(svgRef.current).selectAll("*").remove()

    // dimensions
    const width = 540
    const height = 400
    const margin = { top: 40, right: 20, bottom: 20, left: 20 }

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .style('max-width', '100%')
      .style('height', 'auto')


    // make map
    const projection = d3.geoAlbersUsa()
      .fitSize([width - margin.left - margin.right, height - margin.top - margin.bottom], statesData)
    const path = d3.geoPath().projection(projection)

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    const filteredStates = statesData.features.filter(d => 
      d.properties.NAME !== 'District of Columbia' && d.properties.NAME !== 'Puerto Rico'
    );

    // title
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', margin.top)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .text('Select/unselect states to compare above:')

    // Draw states 
    g.selectAll('path')
      .data(filteredStates)
      .enter()
      .append('path')
      .attr('d', path)
      .attr('class', 'state')
      .style('cursor', 'pointer')
      .style('fill', d => selectedStates.includes(d.properties.NAME) ? '#4CAF50' : '#ccc')
      .on('mouseover', function(event, d){
          const element = d3.select(this);
          
          if (!selectedStates.includes(d.properties.NAME)) {
            element.style('fill', '#999')
                   .style('opacity', 0.8);
          }
          element.style('opacity', 1);

          const centroid = path.centroid(d);
          g.append('text')
            .attr('class', 'state-label')
            .attr('x', centroid[0])
            .attr('y', centroid[1])
            .attr('text-anchor', 'middle')
            .attr('alignment-baseline', 'middle')
            .style('font-size', '12px')
            .style('pointer-events', 'none')
            .text(d.properties.NAME);
      })
      .on('mouseout', function(event, d) {
        const element = d3.select(this);
        
        if (!selectedStates.includes(d.properties.NAME)) {
          element.style('fill', '#ccc');
        }
        element.style('opacity', 1);
        g.selectAll('.state-label').remove();
      })
      .on('click', function(event, data) {
        // console.log(data);
        const stateName = data.properties.NAME;
        const isSelected = selectedStates.includes(stateName);
        
        if (isSelected) {
          setSelectedStates(prev => prev.filter(state => state !== stateName));
          d3.select(this).style('fill', '#ccc');
        } else {
          setSelectedStates(prev => [...prev, stateName]);
          d3.select(this).style('fill', '#4CAF50');
        }
      })

  }, [statesData, selectedStates])

  return (
    <div className='container'>
      <svg ref={svgRef} className='svg'></svg>
    </div>
  )
}

export default Mapchart
