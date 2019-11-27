import React, { useState, useEffect } from 'react';
import './App.css';
import { hierarchy } from 'd3-hierarchy';
import { data } from './data';
import kv from './kv.json';
import treeData from './tree.json';
import axios from 'axios';
import { D3Visualization } from './Vis';

const API_ROOT = 'http://127.0.0.1:8000/api/';
const height = 1000;
const heatmapHeight = 100;
const heatmapWidth = 100;

export const Results = () => {
  const [data, setData] = useState([]);
  const [chosenResult, chooseResult] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const result = await axios(API_ROOT + 'results/', {
        crossDomain: true,
      }).then(result => setData(result.data));
    }
    fetchData();
  }, []);

  /*
            useEffect has a dependency array (below). It's a list of dependency
            variables for this useEffect block. The block will run after mount
            and whenever any of these variables change. We still have to check
            if the variables are valid, but we do not have to compare old props
            to next props to decide whether to rerender.
  */
  const results = [
    {
      id: 3,
      created_on: '2019-11-26T20:12:04.304002Z',
      rows: 2,
      cols: 3,
      result_tree: null,
      tiles: [],
      score: null,
      problem_generator: '',
    },
    {
      id: 4,
      created_on: '2019-11-26T20:12:04.304002Z',
      rows: 2,
      cols: 3,
      result_tree: null,
      tiles: [],
      score: null,
      problem_generator: '',
    },
  ];
  const chooseNewSolutionToDisplay = result => {
    chooseResult(result);
    console.log(result);
  };

  return (
    <>
      <h2> Results </h2>
      <div>
        <table border="1">
          <th>N Tiles</th>
          <th>Created on</th>
          <th>Rows</th>
          <th>Cols</th>
          <th>Problem generator</th>
          <th>Strategy</th>
          <th>N simulations</th>
          <th>Score (Tiles left) </th>
          <th>Solution found</th>
          {data &&
            data.map(result => (
              <tr
                className={result == chosenResult ? 'selectedText' : ''}
                onClick={chooseNewSolutionToDisplay.bind(this, result)}
              >
                <td>{result.tiles && result.tiles.length}</td>
                <td>{result.created_on}</td>
                <td>{result.rows}</td>
                <td>{result.cols}</td>
                <td>{result.problem_generator}</td>
                <td>{result.strategy}</td>
                <td>{result.n_simulations}</td>
                <td>{result.score}</td>
                <td>{`${result.solution_found}`}</td>
              </tr>
            ))}
        </table>
      </div>
      <br />
      {chosenResult && (
        <div>
          <p>TILES: </p>
          <p>{JSON.stringify(chosenResult.tiles)}</p>
        </div>
      )}
      <D3Visualization resultToDisplay={chosenResult} />
    </>
  );
};
