import * as d3 from 'd3';

const RADIUS = 5;

export function createDiagram(cssSelectors, nodes, links = []) {
  const svgDOM = document.querySelector(cssSelectors.svg);
  const width = svgDOM.clientWidth;
  const height = svgDOM.clientHeight;

  const svg = d3.select(cssSelectors.svg)
    .attr("viewBox", [-width / 2, -height / 2, width, height])

  const viewBox = d3.select(cssSelectors.viewbox)

  svg.call(d3.zoom()
      .extent([[0, 0], [width, height]])
      .scaleExtent([1, 8])
      .on("zoom", zoomed));

  function zoomed({transform}) {
    viewBox.attr("transform", transform);
  }


  //function for dragging nodes around
  const drag = simulation => {
  
    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }
    
    function dragged(event) { 
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }
    
    function dragended(event) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }
    
    return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
  };

  //mapping color to a node's group number
  const scale = d3.scaleOrdinal(d3.schemeCategory10);
  const color = d => scale(d.group);


  const simulation = d3.forceSimulation(nodes)
    .force("charge", d3.forceManyBody().strength(d => -10))
    .force("link", d3.forceLink(links)
      .id(d => d.id)
      .distance(d => 45))
    .force("center", d3.forceCenter().strength(0.01));
    // .force("x", d3.forceX().strength(0.1))
    // .force("y", d3.forceY().strength(0.1));




  const link = d3.select(cssSelectors.links)
    .selectAll("line")
    .data(links)
    .join("line")
    .attr("stroke-width", d => Math.sqrt(d.value));

  const nodeGroup = d3.select(cssSelectors.nodes)
    .selectAll("g")
    .data(nodes)
    .join(
      enter => enter.append("g"),
      update => update.attr("transform", d => `translate(${d.x}, ${d.y})`)
    )
  
  const node = nodeGroup.append("circle")
    .attr("r", RADIUS)
    .attr("fill", color)
    .call(drag(simulation));

  const label = nodeGroup.append("foreignObject")
    .attr('class', 'label-container')
    .html(d => `<a href=${d.url}>${d.id}</a>`)
    .attr('x', RADIUS + 2)
    .attr('y', -(RADIUS * 1.3))
    .attr('stroke', 'white')

  simulation.on("tick", () => {    
    link
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y);

    nodeGroup
      .attr("transform", d => `translate(${d.x}, ${d.y})`)
  });

  return svg.node();
}
