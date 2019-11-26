import React, { useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { hierarchy } from 'd3-hierarchy';
import { data } from './data';
import kv from './kv.json';
import treeData from './tree.json';

const height = 1000;
const heatmapHeight = 100;
const heatmapWidth = 100;

export const Results = () => {
  useEffect(
    () => {},
    /*
            useEffect has a dependency array (below). It's a list of dependency
            variables for this useEffect block. The block will run after mount
            and whenever any of these variables change. We still have to check
            if the variables are valid, but we do not have to compare old props
            to next props to decide whether to rerender.
        */
    []
  );

  const results = [
    {
      created_on: '1',
      tiles: 10,
      rows: '1',
      cols: '1',
    },
  ];

  return (
    <>
      <h2> Results </h2>
      <table>
        <th>Created on</th>
        <th>Rows</th>
        <th>Cols</th>
        <th>Problem generator</th>
        {results.map(result => (
          <tr>
            <td>{result.created_on}</td>
            <td>{result.tiles}</td>
            <td>{result.rows}</td>
            <td>{result.cols}</td>
          </tr>
        ))}
      </table>
    </>
  );
};
