import React from 'react';
import logo from './logo.svg';
import './App.css';
import { hierarchy } from 'd3-hierarchy';
import { Results } from './results';

function App() {
  return (
    <>
      <span>Bin pack</span>
      <Results />
    </>
  );
}

export default App;
