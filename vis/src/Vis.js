import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import ReactDOM from 'react-dom';
import { hierarchy } from 'd3-hierarchy';
import { data } from './data';
import kv from './kv.json';
import treeData from './tree.json';

const width = 1500;
const height = 1000;

export const MyD3Component = () => {
  /* The useRef Hook creates a variable that "holds on" to a value across rendering
       passes. In this case it will hold our component's SVG DOM element. It's
       initialized null and React will assign it later (see the return statement) */
  const d3Container = useRef(null);

  /* The useEffect Hook is for running side effects outside of React,
       for instance inserting elements into the DOM using D3 */
  const createHeatmap = (svg, d) => {
    let width = 100;
    let height = 100;
    width = width;
    height = height;

    // Labels of row and columns
    const data = [
      [2, 3, 2, 3, 2, 3, 4],
      [2, 3, 2, 3, 2, 3, 4],
      [5, 6, 5, 6, 5, 6, 6],
      [0, 0, 0, 0, 0, 0, 0],
      [2, 3, 2, 3, 2, 3, 4],
      [5, 6, 5, 6, 5, 6, 6],
      [0, 8, 1, 0, 0, 0, 0],
    ];

    var myGroups = [...Array(data[0].length).keys()];
    var myVars = [...Array(data.length).keys()];

    // Build X scales and axis:
    var x = d3
      .scaleBand()
      .range([0, width])
      .domain(myGroups)
      .padding(0.01);

    svg = svg
      .append('g')
      .attr('transform', `translate(-${width + 10}, -${height})`);

    svg
      .append('text')
      .attr('dy', '0.31em')
      .text(d => {
        console.log(d);
        return Object.keys(d.data);
      });

    svg.append('g').call(d3.axisBottom(x));

    // Build X scales and axis:
    var y = d3
      .scaleBand()
      .range([height, 0])
      .domain(myVars)
      .padding(0.01);

    svg.append('g').call(d3.axisLeft(y));

    //Read the data
    const tileWidth = width / data.length;
    const tileHeight = height / data[0].length;
    console.log(d3.schemeCategory10);
    data.map((l, j) => {
      l.map((el, i) => {
        svg
          .append('rect')
          .attr('x', i * tileWidth)
          .attr('y', j * tileHeight)
          .attr('height', tileHeight)
          .attr('width', tileWidth)
          .style('fill', function() {
            return el == 0
              ? 'white'
              : el < 10
              ? d3.schemeCategory10[el]
              : d3.schemePaired[el];
          });
      });
    });
  };
  useEffect(
    () => {
      if (d3Container.current) {
        const svg = d3.select(d3Container.current);

        const margin = { top: 10, right: 120, bottom: 10, left: 40 };
        const dy = 206;
        const dx = 100;

        const tree = d3.tree();
        tree.size([width, height]);
        tree.nodeSize([dx, dy]);
        const diagonal = d3
          .linkHorizontal()
          .x(d => d.y)
          .y(d => d.x);
        const root = d3.hierarchy(treeData, el => Object.values(el));
        console.log(root.descendants());

        root.x0 = dy / 2;
        root.y0 = 0;
        root.descendants().forEach((d, i) => {
          d.id = i;
          d._children = d.children;
          if (d.depth) d.children = null;
        });

        svg.style('font', '13px sans-serif');

        const gLink = svg
          .append('g')
          .attr('fill', 'none')
          .attr('stroke', '#555')
          .attr('stroke-opacity', 0.4)
          .attr('stroke-width', 1.5);

        const gNode = svg
          .append('g')
          .attr('cursor', 'pointer')
          .attr('pointer-events', 'all');

        function update(source) {
          const duration = d3.event && d3.event.altKey ? 2500 : 250;
          const nodes = root.descendants().reverse();
          const links = root.links();

          // Compute the new tree layout.
          tree(root);

          let left = root;
          let right = root;
          root.eachBefore(node => {
            if (node.x < left.x) left = node;
            if (node.x > right.x) right = node;
          });

          const height = right.x - left.x + margin.top + margin.bottom;

          const transition = svg
            .transition()
            .duration(duration)
            .attr('viewBox', [-margin.left, left.x - margin.top, width, height])
            .tween(
              'resize',
              window.ResizeObserver ? null : () => () => svg.dispatch('toggle')
            );

          // Update the nodes…
          const node = gNode.selectAll('g').data(nodes, d => d.id);

          // Enter any new nodes at the parent's previous position.
          const nodeEnter = node
            .enter()
            .append('g')
            .attr('transform', d => `translate(${source.y0},${source.x0})`)
            .attr('fill-opacity', 0)
            .attr('stroke-opacity', 0)
            .on('click', d => {
              d.children = d.children ? null : d._children;
              update(d);
            });

          nodeEnter
            .append('circle')
            .attr('r', 2.5)
            .attr('fill', d => (d._children ? '#555' : '#999'))
            .attr('stroke-width', 10);

          createHeatmap(nodeEnter);

          nodeEnter
            .append('text')
            .attr('dy', '0.31em')
            .attr('x', d => (d._children ? -6 : 6))
            .attr('text-anchor', d => (d._children ? 'end' : 'start'))
            .text(d => Object.keys(d.data))
            .clone(true)
            .lower()
            .attr('stroke-linejoin', 'round')
            .attr('stroke-width', 3)
            .attr('stroke', 'white');

          // Transition nodes to their new position.
          const nodeUpdate = node
            .merge(nodeEnter)
            .transition(transition)
            .attr('transform', d => `translate(${d.y},${d.x})`)
            .attr('fill-opacity', 1)
            .attr('stroke-opacity', 1);

          // Transition exiting nodes to the parent's new position.
          const nodeExit = node
            .exit()
            .transition(transition)
            .remove()
            .attr('transform', d => `translate(${source.y},${source.x})`)
            .attr('fill-opacity', 0)
            .attr('stroke-opacity', 0);

          // Update the links…
          const link = gLink.selectAll('path').data(links, d => d.target.id);

          // Enter any new links at the parent's previous position.
          const linkEnter = link
            .enter()
            .append('path')
            .attr('d', d => {
              const o = { x: source.x0, y: source.y0 };
              return diagonal({ source: o, target: o });
            });

          // Transition links to their new position.
          link
            .merge(linkEnter)
            .transition(transition)
            .attr('d', diagonal);

          // Transition exiting nodes to the parent's new position.
          link
            .exit()
            .transition(transition)
            .remove()
            .attr('d', d => {
              const o = { x: source.x, y: source.y };
              return diagonal({ source: o, target: o });
            });

          // Stash the old positions for transition.
          root.eachBefore(d => {
            d.x0 = d.x;
            d.y0 = d.y;
          });
        }
        update(root);

        return svg.node();
      }
    },

    /*
            useEffect has a dependency array (below). It's a list of dependency
            variables for this useEffect block. The block will run after mount
            and whenever any of these variables change. We still have to check
            if the variables are valid, but we do not have to compare old props
            to next props to decide whether to rerender.
        */
    [d3Container.current]
  );

  return (
    <svg
      className="d3-component"
      width={width}
      height={height + 1000}
      ref={d3Container}
    />
  );
};
