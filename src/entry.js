import {fetchFirstLink, fetchRandomArticleTitle} from './wikimedia_api_routes';
import {createDiagram} from './diagram/force_diagram';
debugger
//input into d3 renderer as Object.values(nodes)
let group = 0;
const nodes = {
  philosophy: {
    id: "philosophy", 
    url: "https://en.wikipedia.org/wiki/Philosophy",
    group: group, 
    level: 1
  }
};

const mainGraph = {
  svg: "#main-container",
  viewbox: ".main-viewbox",
  links: ".main-links",
  nodes: ".main-nodes"
};

const constructionGraph = {
  svg: "#construction-container",
  viewbox: ".construction-viewbox",
  links: ".construction-links",
  nodes: ".construction-nodes"
};

const links = [];

const submitRandomArticle = async (e) => {
  const randomArticleTitle = await fetchRandomArticleTitle();
  handleSubmit(e, randomArticleTitle);
} 

const handleSubmit = async (e, input) => {
  // grab a page
  e.preventDefault();
  e.stopPropagation();

  input ||= e.target[0].value;
  group += 1;
  //replace with API route to grab page title and url info
  
  const wikiRegex = /https\:\/\/en\.wikipedia\.org\/wiki\/(.+)/
  const titleMatch = input.match(wikiRegex);

  let nextPage;
  if (titleMatch !== null) {
    nextPage = {
      id: titleMatch[1],
      url:  input,
      group: group,
      level: 1
    };
  } else {
    nextPage = {
      id: input,
      url:  `https://en.wikipedia.org/wiki/${input.replaceAll(' ', '_')}`,
      group: group,
      level: 1
    };
  }

  let prevPage;

  // keep grabbing the next page until an existing node is reached
  const currentAdditions = {};
  currentAdditions[nextPage.id] = nextPage;
  const currentLinks = [];
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
    console.log('nextPage', nextPage)

    //If page doesn't already exist, add it into the nodes and add corresponding list
    //otherwise do nothing. While loop will break when the conditional below is false.
    if (!nodes[nextPage.id]) {
      currentAdditions[nextPage.id] = nextPage;

      currentLinks.push({
        source: prevPage.id,
        target: nextPage.id,
        value: 1
      })
    }

    //The d3 force methods within createDiagram mutates its inputs
    //to protect the 
    const copyOfCurrentLinks = Array.from(currentLinks);
    createDiagram(constructionGraph, Object.values(currentAdditions), copyOfCurrentLinks)
  }



  currentLinks.push({
    source: prevPage.id,
    target: nextPage.id,
    value: 1
  })
  
  //reset construction graph
  const constructionContainer = document.querySelector('#construction-container');
  constructionContainer.innerHTML = `
    <g class='viewbox construction-viewbox'>
      <g class='links construction-links' stroke='#999' stroke-opacity='0.6'></g>
      <g class='nodes construction-nodes' stroke='#fff' stroke-width='1.5'></g>
    </g>
    `;

  //transfer key value pairs from currentAdditions to nodes
  for (let pageId in currentAdditions) {
    nodes[pageId] = currentAdditions[pageId]
  }

  links.push(...currentLinks);
  
  createDiagram(mainGraph, Object.values(nodes), links);

}


document.addEventListener("DOMContentLoaded", () => {
  // updateDiagram(Object.values(nodes));
  createDiagram(mainGraph, Object.values(nodes))
  const form = document.querySelector(".article-form");
  form.addEventListener("submit", handleSubmit);
  
  const randomButton = document.querySelector('.random-submit');
  randomButton.addEventListener("click", submitRandomArticle)
});

