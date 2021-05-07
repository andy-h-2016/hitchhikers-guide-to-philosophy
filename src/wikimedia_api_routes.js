const fetch = require('node-fetch');
import regenerationRuntime from 'regenerator-runtime';


async function fetchFirstLink(page, count = 1) {
  const url = "https://en.wikipedia.org/w/api.php?" +
    new URLSearchParams({
        origin: "*",
        action: "parse",
        prop: "text",
        page: page,
        format: "json",
        redirects: 1
    });

  const req = await fetch(url);
  const json = await req.json();
  // console.log(json.parse.text["*"].slice(0,50000));
  const html = json.parse.text["*"];
  const parser = new DOMParser();
  const DOM = parser.parseFromString(html, "text/html");
  let htmlElements = DOM.querySelectorAll(".mw-parser-output > p:not([class])");
 
  // console.log('html', htmlElements);
  
  let relevantNode;
  while (relevantNode === undefined) {
    for (let node of htmlElements) {
      let numChildNodes = 0;
      node.childNodes.forEach(child => {
        if (child.nodeValue !== "\n") {
          numChildNodes += 1;
        }
      });

      if (numChildNodes > 1 && node.innerHTML.match(/<a/)) {
        relevantNode = node;
        break
      }
    }
    if (relevantNode === undefined) {
      htmlElements = DOM.querySelectorAll(".mw-parser-output > ul > li");
    }
  }
  
  // console.log('relevantNode', relevantNode)
  const innerHTML = relevantNode.innerHTML;
  // console.log('html', innerHTML)

  const parantheses2Regex = /(?<!(?:\([\w\s]*)|from[\w\s]*|<small>\s?|<i>\s?)<a[\w\s]*href="\/wiki\/(?!Help|File|Category)[\w_\(\):\-\.\/"]+"/g;
  const noParanthesesRegex = /<a(?:[\w\s]+)?href="\/wiki\/(?!Help|File|Category)[\w_\(\):\-\.\/"]+"/g;

  const mostMatches = innerHTML.match(parantheses2Regex) || innerHTML.match(noParanthesesRegex)

  
  // if (count > 1) {
    // console.log('match', mostMatches)
  // }
  const n = count - 1; //zero index;
  const nthMatch = mostMatches[n];
  // console.log('nthMatch', nthMatch)
  const title = nthMatch.match(/wiki\/([\w_\(\)\:\-\.\/]+)/)[1];

  return {
    id: title.toLowerCase(),
    label: title.replace('_', ' '),
    url: `https://en.wikipedia.org/wiki/${title}`,
    group: 1,
    level: 1
  }

}

export default fetchFirstLink;