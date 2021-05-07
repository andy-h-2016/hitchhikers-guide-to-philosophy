const d3 = require('d3');
const d3Force = require('d3-force');

export function createDiagram() {
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

  const data = require('./miserables.json');
  console.log('data', data)

  const links = data.links.map(d => Object.create(d));
  const nodes = data.nodes.map(d => Object.create(d));

  const simulation = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).id(d => d.id))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2));

  const svg = d3.create("svg")
    .attr("viewBox", [0, 0, width, height]);


  const link = svg.append("g")
    .attr("stroke", "#999")
    .attr("stroke-opacity", 0.6)
    .selectAll("line")
    .data(links)
    .join("line")
    .attr("stroke-width", d => Math.sqrt(d.value));

  const node = svg.append("g")
    .attr("stroke", "#fff")
    .attr("stroke-width", 1.5)
    .selectAll("circle")
    .data(nodes)
    .join("circle")
    .attr("r", 5)
    .attr("fill", color)
    .call(drag(simulation));

  node.append("title")
    .text(d => d.id);

  simulation.on("tick", () => {
    link
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y);

    node
      .attr("cx", d => d.x)
      .attr("cy", d => d.y);
  });

  // observableLib.invalidation.then(() => simulation.stop());
  console.log('svg', svg)
  console.log('svgNode', svg.node())
  return svg.node();

}


export function updateDiagram(nodes, links = []) {

  function getNeighbors(node) {
    return baseLinks.reduce(function (neighbors, link) {
        if (link.target.id === node.id) {
          neighbors.push(link.source.id)
        } else if (link.source.id === node.id) {
          neighbors.push(link.target.id)
        }
        return neighbors
      },
      [node.id]
    )
  }

  function isNeighborLink(node, link) {
    return link.target.id === node.id || link.source.id === node.id
  }


  function getNodeColor(node, neighbors) {
    if (Array.isArray(neighbors) && neighbors.indexOf(node.id) > -1) {
      return node.level === 1 ? 'blue' : 'green'
    }

    return node.level === 1 ? 'red' : 'gray'
  }


  function getLinkColor(node, link) {
    return isNeighborLink(node, link) ? 'green' : '#E5E5E5'
  }

  function getTextColor(node, neighbors) {
    return Array.isArray(neighbors) && neighbors.indexOf(node.id) > -1 ? 'green' : 'black'
  }

  let width = window.innerWidth
  let height = window.innerHeight

  let svg = d3.select('svg')
  svg.attr('width', width).attr('height', height)

  let linkElements, nodeElements, textElements

  // we use svg groups to logically group the elements together
  let linkGroup = svg.append('g').attr('class', 'links')
  let nodeGroup = svg.append('g').attr('class', 'nodes')
  let textGroup = svg.append('g').attr('class', 'texts')

  // we use this reference to select/deselect
  // after clicking the same element twice
  let selectedId

  // simulation setup with all forces
  let linkForce = d3
    .forceLink()
    .id(function (link) { return link.id })
    .strength(function (link) { return link.strength })

  let simulation = d3
    .forceSimulation()
    .force('link', linkForce)
    .force('charge', d3.forceManyBody().strength(-120))
    .force('center', d3.forceCenter(width / 2, height / 2))

  let dragDrop = d3.drag().on('start', function (node) {
    node.fx = node.x
    node.fy = node.y
  }).on('drag', function (node) {
    simulation.alphaTarget(0.7).restart()
    node.fx = d3.event.x
    node.fy = d3.event.y
  }).on('end', function (node) {
    if (!d3.event.active) {
      simulation.alphaTarget(0)
    }
    node.fx = null
    node.fy = null
  })

  // select node is called on every click
  // we either update the data according to the selection
  // or reset the data if the same node is clicked twice
  function selectNode(selectedNode) {
    if (selectedId === selectedNode.id) {
      selectedId = undefined
      resetData()
      updateSimulation()
    } else {
      selectedId = selectedNode.id
      updateData(selectedNode)
      updateSimulation()
    }

    let neighbors = getNeighbors(selectedNode)

    // we modify the styles to highlight selected nodes
    nodeElements.attr('fill', function (node) { return getNodeColor(node, neighbors) })
    textElements.attr('fill', function (node) { return getTextColor(node, neighbors) })
    linkElements.attr('stroke', function (link) { return getLinkColor(selectedNode, link) })
  }

  // this helper simple adds all nodes and links
  // that are missing, to recreate the initial state
  function resetData() {
    let nodeIds = nodes.map(function (node) { return node.id })

    baseNodes.forEach(function (node) {
      if (nodeIds.indexOf(node.id) === -1) {
        nodes.push(node)
      }
    })

    links = baseLinks
  }

  // diffing and mutating the data
  function updateData(selectedNode) {
    let neighbors = getNeighbors(selectedNode)
    let newNodes = baseNodes.filter(function (node) {
      return neighbors.indexOf(node.id) > -1 || node.level === 1
    })

    let diff = {
      removed: nodes.filter(function (node) { return newNodes.indexOf(node) === -1 }),
      added: newNodes.filter(function (node) { return nodes.indexOf(node) === -1 })
    }

    diff.removed.forEach(function (node) { nodes.splice(nodes.indexOf(node), 1) })
    diff.added.forEach(function (node) { nodes.push(node) })

    links = baseLinks.filter(function (link) {
      return link.target.id === selectedNode.id || link.source.id === selectedNode.id
    })
  }

  function updateGraph() {
    // links
    linkElements = linkGroup.selectAll('line')
      .data(links, function (link) {
        return link.target.id + link.source.id
      })

    linkElements.exit().remove()

    let linkEnter = linkElements
      .enter().append('line')
      .attr('stroke-width', 1)
      .attr('stroke', 'rgba(50, 50, 50, 0.2)')

    linkElements = linkEnter.merge(linkElements)

    // nodes
    nodeElements = nodeGroup.selectAll('circle')
      .data(nodes, function (node) { return node.id })

    nodeElements.exit().remove()

    let nodeEnter = nodeElements
      .enter()
      .append('circle')
      .attr('r', 10)
      .attr('fill', function (node) { return node.level === 1 ? 'red' : 'gray' })
      .call(dragDrop)
      // we link the selectNode method here
      // to update the graph on every click
      .on('click', selectNode)

    nodeElements = nodeEnter.merge(nodeElements)

    // texts
    textElements = textGroup.selectAll('text')
      .data(nodes, function (node) { return node.id })

    textElements.exit().remove()

    let textEnter = textElements
      .enter()
      .append('text')
      .text(function (node) { return node.label })
      .attr('font-size', 15)
      .attr('dx', 15)
      .attr('dy', 4)

    textElements = textEnter.merge(textElements)
  }

  function updateSimulation() {
    updateGraph()

    simulation.nodes(nodes).on('tick', () => {
      nodeElements
        .attr('cx', function (node) { return node.x })
        .attr('cy', function (node) { return node.y })
      textElements
        .attr('x', function (node) { return node.x })
        .attr('y', function (node) { return node.y })
      linkElements
        .attr('x1', function (link) { return link.source.x })
        .attr('y1', function (link) { return link.source.y })
        .attr('x2', function (link) { return link.target.x })
        .attr('y2', function (link) { return link.target.y })
    })

    simulation.force('link').links(links)
    simulation.alphaTarget(0.7).restart()
  }

  // last but not least, we call updateSimulation
  // to trigger the initial render
  updateSimulation()

}