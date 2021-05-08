import * as ArticleNode from './article_node';
import fetchFirstLink from './wikimedia_api_routes';
import {createDiagram} from '../d3_demos/force_diagram';
import updateDigram from '../d3_demos/update_diagram';

//input into d3 renderer as Object.values(nodes)
let group = 0;
const nodes = {
  philosophy: {
    id: "philosophy", 
    label: "Philosophy", 
    url: "https://en.wikipedia.org/wiki/Philosophy",
    group: group, 
    level: 1
  }
}

const links = [];

const handleSubmit = async (e) => {
  // grab a page

  e.preventDefault();
  e.stopPropagation();

  const newTitle = e.target[0].value;
  group += 1;
  //replace with API route to grab page title and url info
  let nextPage = {
    id: newTitle,
    label: newTitle,
    group: group,
    level: 1
  };

  let prevPage;

  // keep grabbing the next page until an existing node is reached
  const currentAdditions = {};
  currentAdditions[nextPage.id] = nextPage;
  const currentLinks = [];
  // currentAdditions[prevPage.id] = prevPage;
  // currentAdditions[nextPage.id] = nextPage;
  console.log('before while', 'page', nextPage, 'node', nodes) 
  while (!nodes[nextPage.id]) {
    let count = 1;
    let potentialPage = await fetchFirstLink(nextPage.id, count, group);

    // check if page has already been visited
    // Output of while loop is a potentialPage that has not been visited before
    while (!!currentAdditions[potentialPage]) {
      //count 
      count += 1;
      console.log('DUPLICATE', potentialPage.id);
      potentialPage = await fetchFirstLink(potentialPage.id, count, group)
      // return
    }
    prevPage = nextPage;
    nextPage = potentialPage; // the unvisited potentialPage becomews the next Page

    currentAdditions[nextPage.id] = nextPage;
    currentLinks.push({
      source: prevPage.id,
      target: nextPage.id,
      value: 1
    })

    console.log('conditional', nodes[nextPage.id], !nodes[nextPage.id])
    console.log('result', nextPage.id)
  }

  for (let pageId in currentAdditions) {
    nodes[pageId] = currentAdditions[pageId]
  }

  links.push(...currentLinks);
  
  console.log('prevPageId', prevPage.id)
  console.log('nextPageId', nextPage.id)
  console.log('nodes', nodes);
  console.log('links', links)
  const graphContainer = document.getElementById('graph-container');

  createDiagram(Object.values(nodes), links);

}




document.addEventListener("DOMContentLoaded", () => {
  // updateDiagram(Object.values(nodes));
  createDiagram(Object.values(nodes))
  const form = document.querySelector(".article-form");
  form.addEventListener("submit", handleSubmit); 
});

