import * as ArticleNode from './article_node';
import fetchFirstLink from './wikimedia_api_routes';
import {createDiagram, updateDiagram} from '../d3_demos/force_diagram';

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
  // console.log('e', e)
  
  let nextPage = await fetchFirstLink(newTitle);
  nodes.push(nextPage)
  // links.push()

  // keep grabbing the next page until the philosophy page is reached
  while (nextPage.id !== 'philosophy') {
    let potentialPage = await fetchFirstLink(nextPage.id);

    // check if page has already been visited
    let count = 1;
    while (!!nodes[potentialPage.id]) {
      //count 
      count += 1;
      console.log('DUPLICATE', potentialPage);
      potentialPage = await fetchFirstLink(potentialPage.id, count)
      // return
    }
    nextPage = potentialPage;
    nodes[nextPage.id] = nextPage;
    console.log('result', nextPage)
  }

  
}




document.addEventListener("DOMContentLoaded", () => {
  const graphContainer = document.getElementById('graph-container');
  graphContainer.appendChild(updateDiagram(nodes));

  const form = document.querySelector(".article-form");
  form.addEventListener("submit", handleSubmit); 
});

