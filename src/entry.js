import {fetchFirstLink, fetchRandomArticleTitle} from './wikimedia_api_routes';
import {createDiagram} from './diagram/force_diagram';

//input into d3 renderer as Object.values(nodes)
let group = 0;
const nodes = {
  philosophy: {
    id: "philosophy", 
    url: "https://en.wikipedia.org/wiki/Philosophy",
    group: group, 
    level: 1
  }
}

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

    //if node already exists, don't add on
    if (!nodes[nextPage.id]) {
      currentAdditions[nextPage.id] = nextPage;
    }

    //no matter what, need to add link 
    currentLinks.push({
      source: prevPage.id,
      target: nextPage.id,
      value: 1
    })
  }

  for (let pageId in currentAdditions) {
    nodes[pageId] = currentAdditions[pageId]
  }

  links.push(...currentLinks);
  
  const graphContainer = document.getElementById('graph-container');

  createDiagram(Object.values(nodes), links);

}


document.addEventListener("DOMContentLoaded", () => {
  // updateDiagram(Object.values(nodes));
  createDiagram(Object.values(nodes))
  const form = document.querySelector(".article-form");
  form.addEventListener("submit", handleSubmit);
  
  const randomButton = document.querySelector('.random-submit');
  randomButton.addEventListener("click", submitRandomArticle)
});

