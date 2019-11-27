import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { hierarchy } from 'd3-hierarchy';

const height = 1000;
const heatmapHeight = 100;
const heatmapWidth = 100;

export const D3Visualization = props => {
  /* The useRef Hook creates a variable that "holds on" to a value across rendering
       passes. In this case it will hold our component's SVG DOM element. It's
       initialized null and React will assign it later (see the return statement) */
  const d3Container = useRef(null);

  /* The useEffect Hook is for running side effects outside of React,
       for instance inserting elements into the DOM using D3 */
  const createHeatmap = d => {
    // addding ids here is a hack to make the selector for all nodes easier
    let width = heatmapWidth;
    let height = heatmapHeight;
    width = width;
    height = height;
    let svg = d3.create('svg:defs');
    ///let svg = d;

    // Labels of row and columns
    const data = d.data.board;
    let _data = d.data.board;

    var myGroups = [...Array(data[0].length).keys()];
    var myVars = [...Array(data.length).keys()];

    // Build X scales and axis:

    svg = svg
      .append('g')
      .attr('transform', `translate(-${width}, -${height / 2})`);

    /*
    var x = d3
      .scaleBand()
      .range([0, width])
      .domain(myGroups)
      .padding(0.01);
    svg.append('g').call(d3.axisBottom(x));

    // Build X scales and axis:
    var y = d3
      .scaleBand()
      .range([height, 0])
      .domain(myVars)
      .padding(0.01);

    svg.append('g').call(d3.axisLeft(y));
    */

    const colorSet = d3.schemeTableau10;
    //Read the data
    const tileWidth = width / data.length;
    const tileHeight = height / data[0].length;
    data.map((l, j) => {
      l.map((el, i) => {
        svg
          .append('rect')
          .attr('x', i * tileWidth)
          .attr('y', j * tileHeight)
          .attr('height', tileHeight)
          .attr('width', tileWidth)
          .style('fill', function() {
            const ret =
              el == 0
                ? 'black'
                : el < colorSet.length
                ? colorSet[el]
                : d3.schemeSet1[el - colorSet.length];
            return ret;
          });
      });
    });
    return svg.node();
  };
  useEffect(
    () => {
      if (d3Container.current) {
        d3.select('svg')
          .selectAll('*')
          .remove();
        const dy = 120;
        const dx = 236;
        const margin = { top: 100, right: 120, bottom: 10, left: 40 };
        //const margin = {
        //  top: heatmapHeight / 2,
        //  right: heatmapWidth * 2,
        //  bottom: heatmapHeight / 2,
        //  left: 40,
        //};

        const svg = d3.select(d3Container.current);
        const HEATMAP_OFFSET = 150;
        console.log(props.resultToDisplay, 'ccc');
        const treeData =
          props.resultToDisplay && props.resultToDisplay.result_tree
            ? JSON.parse(props.resultToDisplay.result_tree)
            : {};
        const root = d3.hierarchy(treeData);
        if (!(root && root.data && root.data.tiles)) {
          return;
        }
        const tree = d3.tree();
        const descendants = root.descendants();
        const ORIENTATIONS = 2;
        let width =
          ((heatmapWidth + HEATMAP_OFFSET) * root.data.tiles.length) /
          ORIENTATIONS;

        svg.attr('viewBox', [
          -margin.left,
          -margin.top,
          (heatmapWidth + 100) * descendants.length,
          dx,
        ]);

        //tree.size([width, height]);
        tree.nodeSize([dy, dx]);
        const diagonal = d3
          .linkHorizontal()
          .x(d => d.y)
          .y(d => d.x);

        root.x0 = dy / 2;
        root.y0 = 0;
        descendants.forEach((d, i) => {
          d.id = i;
          d._children = d.children;

          // hides children
          //if (d.depth) d.children = null;
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

          //.attr('viewBox', [ 0, left.x - margin.top, width + heatmapWidth, height, ])
          const transition = svg
            .transition()
            .attr('viewBox', [-margin.left, left.x - margin.top, width, height])
            .duration(duration)
            .tween(
              'resize',
              window.ResizeObserver ? null : () => () => svg.dispatch('toggle')
            );

          // Update the nodes…
          const node = gNode.selectAll('g.selectorClass').data(nodes, d => {
            return d.id;
          });

          // Enter any new nodes at the parent's previous position.
          const nodeEnter = node
            .enter()
            .append('g')
            .attr('class', 'selectorClass')
            .attr('transform', d => `translate(${source.y0},${source.x0})`)
            .attr('fill-opacity', 0)
            .attr('stroke-opacity', 0)
            .on('click', d => {
              d.children = d.children ? null : d._children;
              update(d);
            });

          nodeEnter.append(d => createHeatmap(d));

          const TEXT_WIDTH = 10;
          const NODE_OFFSET = 50;
          nodeEnter
            .append('text')
            .attr('dy', '0.31em')
            .attr('x', d =>
              d._children
                ? -heatmapWidth - TEXT_WIDTH
                : -heatmapWidth - TEXT_WIDTH - NODE_OFFSET
            )
            .attr('y', -10)
            .attr('text-anchor', d => (d._children ? 'end' : 'start'))
            .text(d => `Score: ${d.data.score}`)
            .attr('text-decoration', d => (d._children ? 'underline' : ''))
            .attr('text-decoration', d => (d._children ? 'underline' : ''))
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
      }
    },

    /*
            useEffect has a dependency array (below). It's a list of dependency
            variables for this useEffect block. The block will run after mount
            and whenever any of these variables change. We still have to check
            if the variables are valid, but we do not have to compare old props
            to next props to decide whether to rerender.
        */
    [props]
  );

  return (
    <svg
      width={1000}
      height={2000}
      className="d3-component"
      ref={d3Container}
    />
  );
};
