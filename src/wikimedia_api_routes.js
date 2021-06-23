const fetch = require('node-fetch');
import regenerationRuntime from 'regenerator-runtime';


export async function fetchRandomArticleTitle() {
  const url = "https://en.wikipedia.org/w/api.php?" +
    new URLSearchParams({
        origin: "*",
        action: "query",
        list: "random",
        rnnamespace: 0,
        rnlimit: 1,
        format: "json",
        redirects: 1
    });

  const req = await fetch(url);
  const json = await req.json();
  return json.query.random[0].title
}

export async function fetchArticleTitle(page) {
  page = page.replaceAll(' ', '_');

  const url = "https://en.wikipedia.org/w/api.php?" +
    new URLSearchParams({
        origin: "*",
        action: "parse",
        prop: "displaytitle",
        page: page,
        format: "json",
        redirects: 1
    });

  const req = await fetch(url);
  const json = await req.json();
    console.log('json', json)

  return json.parse.displaytitle
}



export async function fetchFirstLink(page, count = 1, group) {
  console.log('input: ', page)
  page = page.replaceAll(' ', '_');
  const url = "https://en.wikipedia.org/w/api.php?" +
    new URLSearchParams({
        origin: "*",
        action: "parse",
        prop: "text",
        page: page,
        format: "json",
        redirects: 1
    });
    
  //fire GET request to url constructed above
  const req = await fetch(url);
  const json = await req.json();
  let html;
  try {
    html = json.parse.text["*"];
  } catch (e) {
     if (e instanceof TypeError) {
      return {error: 422};
    } else {
      throw e;
    }
  }

  //create a DOM from the html string of the Wiki page
  const parser = new DOMParser();
  const DOM = parser.parseFromString(html, "text/html");

  //Narrow down DOM to p tags in the body
  let htmlElements = DOM.querySelectorAll(".mw-parser-output > p:not([class])");


  let relevantNodes = '';
    //iterate through all tags within htmlElements
    for (let node of htmlElements) {
      let numChildNodes = 0;
      node.childNodes.forEach(child => {
      
        if (child.textContent.match(/[\\n]+/)) {
          // only counting nodes that are more than just a newline
          numChildNodes += 1;
        }
      });

      if (numChildNodes > 1 && node.innerHTML.match(/<a/)) {
        relevantNodes += node.outerHTML;
      }
    }

    // if relevant node is still not found, then look for line items
    if (relevantNodes === '') {
      htmlElements = DOM.querySelectorAll(".mw-parser-output > ul > li");
    }
  // }
  console.log('htmlElements: ', htmlElements)
  console.log('relevantNodes: ', relevantNodes)
  // const paranthesesRegex = /(?<!(?:\([\w\s]*)|from[\w\s]*|<small>\s?|<i>\s?)<a[\w\s]*href="\/wiki\/(?!Help|File|Category|Wikipedia)[\w_\(\):\-\.\/"]+"/g;
  const paranthesesRegex = /(?<!(?:\([\w\s]*)|\(.*from[\w\s]*|<small>\s?|<i>\s?)<a[\w\s]*href="\/wiki\/(?!Help|File|Category|Wikipedia)[\w_\(\):\-\.\/"]+"/g;
  const noParanthesesRegex = /<a(?:[\w\s]+)?href="\/wiki\/(?!Help|File|Category|Wikipedia)[\w_\(\):\-\.\/",]+"/g;

  const mostMatches = relevantNodes.match(paranthesesRegex) || relevantNodes.match(noParanthesesRegex)
  // const mostMatches = relevantNode.innerHTML.match(paranthesesRegex) || relevantNode.innerHTML.match(noParanthesesRegex)

  const n = count - 1; //zero index;

  let nthMatch;
  try {
    nthMatch = mostMatches[n];
  } catch (e) {
    if (e instanceof TypeError) {
      return {error: 422};
    } else {
      throw e;
    }
  }

  const title = nthMatch.match(/wiki\/([\w_\(\)\:\-\.\/,]+)/)[1];
  console.log('next page: ', title)
  return {
    id: title.replaceAll('_', ' '),
    url: `https://en.wikipedia.org/wiki/${title}`,
    group: group,
    level: 1
  }

}

