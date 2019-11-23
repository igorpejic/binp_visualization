import React from 'react';
import logo from './logo.svg';
import './App.css';
import { hierarchy } from 'd3-hierarchy';
import { MyD3Component } from './Vis';

function App() {
  return (
    <>
      <span>Bin pack</span>
      <MyD3Component />
    </>
  );
}

export default App;
