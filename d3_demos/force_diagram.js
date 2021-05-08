import * as d3 from 'd3';
const d3Force = require('d3-force');

export function createDiagram(nodes, links = []) {
  const height = window.innerHeight;
  const width = window.innerWidth;
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

  const scale = d3.scaleOrdinal(d3.schemeCategory10);
  const color = d => scale(d.group);

  const simulation = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).id(d => d.id))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2).strength(0.5));
    // .force("x", d3.forceX())
    // .force("y", d3.forceY());

  const svg = d3.select("svg")
  .attr("viewBox", [0, 0, width, height]);
    // .attr("viewBox", [-width / 2, -height / 2, width, height]);


  const link = d3.select(".links-group")
    .selectAll("line")
    .data(links)
    .join("line")
    .attr("stroke-width", d => Math.sqrt(d.value));

  const nodeGroup = d3.select(".nodes-group")
    .selectAll("g")
    .data(nodes)
    .join(
      enter => enter.append("g"),
      update => update.attr("transform", d => `translate(${d.x}, ${d.y})`)
    )
    // .enter().append("g");
  // nodeGroup
  //   .merge(nodeGroup.select("g"))
  //   .attr("transform", d => `translate(${d.x}, ${d.y})`);
  
  const node = nodeGroup.append("circle")
    .attr("r", 8)
    .attr("fill", color)
    .call(drag(simulation));


  const label = nodeGroup.append("text")
    .text(d => d.label)
    .attr('x', 0)
    .attr('y', -12)
    .join(
      enter => enter,
      update => update.attr('stroke', 'black')
      )
    // .merge(nodeGroup.select('text'))
    //   .style('color', 'black')


  // const node = d3.select(".nodes-group")
  //   .selectAll("circle")
  //   .data(nodes)
  //   .join("circle")
  //   .attr("r", 5)
  //   .attr("fill", color)
  //   .call(drag(simulation));

  // node.append("title")
  //   .text(d => d.id);

  simulation.on("tick", () => {
    link
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y);


    nodeGroup
      .attr("transform", d => `translate(${d.x}, ${d.y})`)
    // node
    //   .attr("cx", d => d.x)
    //   .attr("cy", d => d.y);
  });

  // observableLib.invalidation.then(() => simulation.stop());
  return svg.node();

}
