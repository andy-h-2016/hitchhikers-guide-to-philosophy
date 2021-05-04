const fetch = require('node-fetch');
// const {DOMParser} = require('linkedom');
import regenerationRuntime from 'regenerator-runtime';


async function fetchFirstLink(page) {
  // console.log('title', title)
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
  // console.log(DOM)
  const pTags = DOM.querySelectorAll(".mw-parser-output > p:not([class])");
  console.log(pTags);
  let relevantP;
  for (let node of pTags) {
    // console.log(node.childNodes)
    // let numChildNodes;
    // node.childNodes.forEach(child => {
    //   if (child.)
    // })
    if (node.innerHTML.match(/<a/)) {
      console.log('true node', node)
      relevantP = node;
      break
    }
  }
  const pHTML = relevantP.innerHTML;
  console.log('html', pHTML);
  // const mwParserOutput.querySelector()
  // const pAfterTableRegex = /(?<=<\/table>\n(?:.+\n)?)<p>[\w\W]+<\/p>/;
  // const pNoTableRegex = /<p>[\w\W]+<\/p>/
  // const pMatches = html.match(pAfterTableRegex) || html.match(pNoTableRegex);
  // const pCapture = pMatches[0];

  // const linkRegex = /(?<!(?:\(.+)|<small>)<a(?:[\w\s]+)?href="\/wiki\/(?!Help|File|Category)([\w_\(\):\-\.\/"]+)"/;
  // const linkRegex = /(?<!(?:\([\w\s]+)|<small>)<a(?:[\w\s]+)?href="\/wiki\/(?!Help|File|Category)([\w_\(\):\-\.\/"]+)"/;
  const paranthesesRegex = /.+\)[\w\s\-\.]+<a(?:[\w\s]+)?href="\/wiki\/(?!Help|File|Category)([\w_\(\):\-\.\/"]+)"/;
  const parantheses2Regex = /(?<!(?:\([\w\s]+)|<small>)<a(?:[\w\s]+)?href="\/wiki\/(?!Help|File|Category)([\w_\(\):\-\.\/"]+)"/;
  const noParanthesesRegex = /<a(?:[\w\s]+)?href="\/wiki\/(?!Help|File|Category)([\w_\(\):\-\.\/"]+)"/;
  const match = pHTML.match(paranthesesRegex) || pHTML.match(parantheses2Regex) || pHTML.match(noParanthesesRegex);
  const title = match[1];
  // const aTag = DOM.querySelector()

  // const title = pMatches.match(linkRegex).slice(0,10);
  // console.log('title', title)
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