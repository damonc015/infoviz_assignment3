"use client";

import * as d3 from 'd3';
import { useEffect, useState } from 'react';
import Mapchart from './Mapchart';
import LineChart from './Linechart';

const Container = () => {

    const [statesData, setStatesData] = useState(null)
    const [wageData, setWageData] = useState(null)
    const [fedWage, setFedWage] = useState([])
    const [selectedStates, setSelectedStates] = useState([]);

    useEffect(() => {
        fetch('/gz_2010_us_040_00_5m.json')
          .then(response => response.json())
          .then(data => {
            setStatesData(data);
            return fetch('/Minimum_Wage_Data.csv');
          })
          .then(response => response.text())
          .then(data => {
            const parsedCsv = d3.csvParse(data);
            
            const federalWagesByYear = Array.from(
              new Set(parsedCsv.map(d => d.Year))
            ).map(year => ({
              year: year,
              wage: parsedCsv.find(d => d.Year === year)['Federal.Minimum.Wage'],
              wage2020: parsedCsv.find(d => d.Year === year)['Federal.Minimum.Wage.2020.Dollars']
            })).sort((a, b) => a.year - b.year);
            setFedWage(federalWagesByYear)
            // d3.group returns map
            const groupedByState = d3.group(parsedCsv, d => d.State);
            // convert back to array of objects
            const stateWageData = Array.from(groupedByState, ([state, data]) => ({
              state,
              data
            }))
            .filter(state => state.state !== 'District of Columbia' && state.state !== 'Puerto Rico');
            setWageData(stateWageData);
          })
          .catch(error => console.error('Error loading the data:', error));
          
      }, []);
      
    return (
      <div className="container">
        <div className="chart-wrapper">
          <LineChart wageData={wageData} selectedStates={selectedStates} setSelectedStates={setSelectedStates}fedWage={fedWage}/>
        </div>
        <div className="chart-wrapper"> 
          <Mapchart statesData={statesData} selectedStates={selectedStates} setSelectedStates={setSelectedStates} />
        </div>
      </div>
    );
}

export default Container;
