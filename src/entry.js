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
let copyOfLinks = [];

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
    let count = 1;
    let potentialPage = await fetchFirstLink(nextPage.id, count, group);

    // check if page has already been visited
    // Output of while loop is a potentialPage that has not been visited before
    while (!!currentAdditions[potentialPage.id]) {
      count += 1;
      potentialPage = await fetchFirstLink(potentialPage.id, count, group)
    }
    prevPage = nextPage;
    nextPage = potentialPage; // the unvisited potentialPage becomews the next Page

    //If page doesn't already exist, add it into the nodes and add corresponding list
    //Otherwise do nothing. While loop will break when the conditional below is false.
    if (!nodes[nextPage.id]) {
      currentAdditions[nextPage.id] = nextPage;

      currentLinks.push({
        source: prevPage.id,
        target: nextPage.id,
        value: 1
      })
    }

    //The d3 force methods within createDiagram mutates its inputs, adding x, y, and other attributes.
    //To protect the currentLinks array create a copy to construct the constructionGraph with
    const copyOfCurrentLinks = Array.from(currentLinks);
    // console.log('WIP Link: ', copyOfCurrentLinks[copyOfCurrentLinks.length - 1].source);
    createDiagram(constructionGraph, Object.values(currentAdditions), copyOfCurrentLinks)
    // constructionGraph = null;
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
  copyOfLinks = Array.from(links)
  
  console.log('last Link: ', currentLinks[currentLinks.length - 1].source);

  console.log('main links: ', links[links.length - 1]);
  createDiagram(mainGraph, Object.values(nodes), copyOfLinks);

}

const closeModal = (e, modal) => {
  e.preventDefault();
  e.stopPropagation();
  modal.classList.add('is-close');
}

const toggleInstructions = e => {
  e.currentTarget.firstElementChild.classList.toggle("hidden")
}

document.addEventListener("DOMContentLoaded", () => {
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

  const instructionsIcon = document.querySelector('.instructions-icon');
  instructionsIcon.addEventListener("mouseenter", toggleInstructions);
  instructionsIcon.addEventListener("mouseleave", toggleInstructions);

});

