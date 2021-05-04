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
  if (htmlElements.length < 2 && !htmlElements[0].innerHTML.match(/<a/)) {
    //on Disambiguation pages, there is only 1 <p> and it typically does not have any links.
    //Instead, they have <li> with links in them.
    htmlElements = DOM.querySelectorAll(".mw-parser-output > ul > li");
  }
  console.log('html', htmlElements);
  let relevantNode;
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
  console.log('relevantNode', relevantNode)
  const innerHTML = relevantNode.innerHTML;
  console.log('html', innerHTML)

  // const linkRegex = /(?<!(?:\(.+)|<small>)<a(?:[\w\s]+)?href="\/wiki\/(?!Help|File|Category)([\w_\(\):\-\.\/"]+)"/;
  // const linkRegex = /(?<!(?:\([\w\s]+)|<small>)<a(?:[\w\s]+)?href="\/wiki\/(?!Help|File|Category)([\w_\(\):\-\.\/"]+)"/;
  const paranthesesRegex = /(?<=.+\))[\w\s\-\.]+<a[\w\s]*href="\/wiki\/(?!Help|File|Category)[\w_\(\):\-\.\/"]+"/g;
  // const parantheses2Regex = /(?<!(?:\([\w\s]+)|<small>)<a(?:[\w\s]+)?href="\/wiki\/(?!Help|File|Category)[\w_\(\):\-\.\/"]+"/g;
  const parantheses2Regex = /(?<!(?:\([\w\s]*)|from\s|<small>\s?|<i>\s?)<a[\w\s]*href="\/wiki\/(?!Help|File|Category)[\w_\(\):\-\.\/"]+"/g;
  const noParanthesesRegex = /<a(?:[\w\s]+)?href="\/wiki\/(?!Help|File|Category)[\w_\(\):\-\.\/"]+"/g;

  // const matches = [
  //   innerHTML.match(paranthesesRegex),
  //   innerHTML.match(parantheses2Regex),
  // ];

  // let mostMatches;
  // let longestLength = 0;
  // matches.forEach(match => {
  //   if (match && match.length > longestLength) {
  //     longestLength = match.length;
  //     mostMatches = match;
  //   }
  // });

  const mostMatches = innerHTML.match(parantheses2Regex) || innerHTML.match(noParanthesesRegex)

  
  // if (count > 1) {
    console.log('match', mostMatches)
  // }
  const n = count - 1; //zero index;
  const nthMatch = mostMatches[n];
  console.log('nthMatch', nthMatch)
  const title = nthMatch.match(/wiki\/([\w_\(\)\:\-\.\/]+)/)[1];

  return {
    title,
    url: `https://en.wikipedia.org/wiki/${title}`
  }

}

// const link = async (page) => await fetchFirstLink(page)
// link("epistemology").then(result => console.log(result));
// let links = async () => await fetchAllLinks("Albert Einstein", 'INITIAL');
// };
// fetchAllLinks("Avengers", 'INITIAL').then(links => console.log(links))
// let philosophyLink = await fetchPhilosophyLink("Albert Einstein", 0);
// console.log('links', links())
// console.log('Philly', philosophyLink)

// module.exports.fetchFirstLink = fetchFirstLink;
export default fetchFirstLink;