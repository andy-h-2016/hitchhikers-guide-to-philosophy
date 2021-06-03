import {fetchFirstLink, fetchRandomArticleTitle} from './wikimedia_api_routes';
import {createDiagram} from './diagram/force_diagram';
//input into d3 renderer as Object.values(nodes)

let group = 0;
const nodes = {
  Philosophy: {
    id: "Philosophy", 
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
  e.preventDefault();
  e.stopPropagation();

  const randomArticleTitle = await fetchRandomArticleTitle();

  const userInput = document.querySelector('.user-input');
  userInput.value = randomArticleTitle;

  handleSubmit(e, randomArticleTitle);
} 

const handleSubmit = async (e, input) => {
  // grab a page
  e.preventDefault();
  e.stopPropagation();

  
  const sidebar = document.querySelector('.sidebar');
  sidebar.classList.remove('hidden');
  
  const inputEle = document.querySelector('.user-input')
  input ||= inputEle.value;
  group += 1;
  //replace with API route to grab page title and url info
  
  //regex parse in case user pasted in a url
  const wikiRegex = /en\.wikipedia\.org\/wiki\/(.+)/
  const urlMatch = input.match(wikiRegex);

  let nextPage;
  if (urlMatch) {
    nextPage = {
      id: urlMatch[1],
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
    console.log('nodes', nodes)
    console.log('nextPage', nextPage)
    console.log('nextPage.id', nextPage.id)
    console.log(nodes[nextPage.id] === "Philosophy") 
    let count = 1;
    let potentialPage = await fetchFirstLink(nextPage.id, count, group);

    // check if page has already been visited
    // Output of while loop is a potentialPage that has not been visited before
    // console.log('currentAdditions', currentAdditions)
    // console.log('potentialPage', potentialPage)
    // console.log('currentAdditions[potentialPage]', currentAdditions[potentialPage])
    while (!!currentAdditions[potentialPage.id]) {
      //count 
      count += 1;
      // console.log('DUPLICATE', potentialPage.id, count);
      potentialPage = await fetchFirstLink(potentialPage.id, count, group)
      // return
    }
    prevPage = nextPage;
    nextPage = potentialPage; // the unvisited potentialPage becomews the next Page
    // console.log('nextPage', nextPage)

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
  
  // reset construction graph
  const constructionContainer = document.querySelector('#construction-container');
  constructionContainer.innerHTML = `
    <g class='viewbox construction-viewbox'>
      <g class='links construction-links' stroke='#999' stroke-opacity='0.6'></g>
      <g class='nodes construction-nodes' stroke='#fff' stroke-width='1.5'></g>
    </g>
    `;
    sidebar.classList.add('hidden');

  //transfer key value pairs from currentAdditions to nodes
  for (let pageId in currentAdditions) {
    nodes[pageId] = currentAdditions[pageId]
  }

  links.push(...currentLinks);
  // console.log('nodes', Object.values(nodes))
  // console.log('links', links)
  createDiagram(mainGraph, Object.values(nodes), links);

}

const closeModal = (e, modal) => {
  e.preventDefault();
  e.stopPropagation();
  modal.classList.add('is-close');
}

document.addEventListener("DOMContentLoaded", () => {
  // updateDiagram(Object.values(nodes));
  createDiagram(mainGraph, Object.values(nodes))
  const form = document.querySelector(".article-form");
  
  form.addEventListener("submit", handleSubmit);

  const submitButton = document.querySelector(".user-submit");
  submitButton.addEventListener("click", handleSubmit)
  
  const randomButton = document.querySelector('.random-submit');
  randomButton.addEventListener("click", submitRandomArticle);

  const modal = document.querySelector('.modal-screen');
  modal.addEventListener("click", e => closeModal(e, modal));
  
  const closeButton = document.querySelector('.close-modal');
  closeButton.addEventListener("click", e => closeModal(e, modal))

  const modalForm = document.querySelector('.modal-form');
  modalForm.addEventListener("click", e => e.stopPropagation());


});

