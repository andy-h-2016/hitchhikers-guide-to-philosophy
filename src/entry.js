import * as ArticleNode from './article_node';
import fetchFirstLink from './wikimedia_api_routes';
import {createDiagram} from '../d3_demos/force_diagram';

//input into d3 renderer as Object.values(nodes)
const nodes = {
  philosophy: {
    id: "philosophy", 
    label: "Philosophy", 
    url: "https://en.wikipedia.org/wiki/Philosophy",
    group: 0, 
    level: 1
  }
}
const links = [];

const handleSubmit = async (e) => {
  // grab a page

  e.preventDefault();
  e.stopPropagation();

  const newTitle = e.target[0].value;
  
  //replace with API route to grab page title and url info
  let prevPage = {
    id: newTitle,
    label: newTitle,
    group: 1,
    level: 1
  };
  nodes[prevPage.id] = prevPage;
  // console.log('e', e)
  
  let nextPage = await fetchFirstLink(newTitle);
  nodes[nextPage.id] = nextPage;
  links.push({
    source: prevPage.id,
    target: nextPage.id,
    value: 1
  }) 


  // links.push()

  // keep grabbing the next page until the philosophy page is reached
  while (nextPage.id.toLowerCase() !== 'philosophy') {
    let potentialPage = await fetchFirstLink(nextPage.id);

    // check if page has already been visited
    // Output of while loop is a potentialPage that has not been visited before
    let count = 1;
    while (!!nodes[potentialPage.id] && potentialPage.id.toLowerCase() !== 'philosophy') {
      //count 
      count += 1;
      console.log('DUPLICATE', potentialPage.id);
      potentialPage = await fetchFirstLink(potentialPage.id, count)
      // return
    }
    prevPage = nextPage;
    nextPage = potentialPage; // the unvisited potentialPage becomews the next Page
    nodes[nextPage.id] = nextPage;
    links.push({
      source: prevPage.id,
      target: nextPage.id,
      value: 1
    })
    console.log('result', nextPage.id)
  }

  console.log('nodes', nodes);
  console.log('links', links)
  const graphContainer = document.getElementById('graph-container');

  graphContainer.appendChild(createDiagram(Object.values(nodes), links));

}




document.addEventListener("DOMContentLoaded", () => {
  // updateDiagram(Object.values(nodes));

  const form = document.querySelector(".article-form");
  form.addEventListener("submit", handleSubmit); 
});

