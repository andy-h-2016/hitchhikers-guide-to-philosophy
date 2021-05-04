const fetch = require('node-fetch');

async function fetchAllLinks(title, startingPoint) {
  let linksMap = {};
  // console.log('title', title)
  let url = "https://en.wikipedia.org/w/api.php?origin=*"; 
  let params = {
    action: "query",
    format: "json",
    titles: title,
    prop: "links",
    pllimit: "max",
    plnamespace: 0,
    redirects: 1
  };
  
  if (startingPoint === undefined) {
    return Promise.resolve({});
  } else if (startingPoint !== 'INITIAL') {
    params.plcontinue = startingPoint;
  }
  
  Object.keys(params).forEach(key => url += "&" + key + "=" + params[key]);
  const response = await fetch(url);
  const jsonResponse = await response.json();
  // console.log('jsonResponse', jsonResponse)
  const pages = jsonResponse.query.pages;
  for (const pageId in pages) {
    //should only be inputting one title at a time, so there will only be one pageId to iterate thru. Using for loop to grab the unknown key in the pages object.
    for (const link of pages[pageId].links) {
      const title = link.title;
      if (title.toUpperCase() === title) {
        //filter out acronyms or else we'll be looping through acronyms forever
        continue
      } else if (title === "Philosophy") {
        linksMap["Philosophy"] = "Philosophy";
      } else {
        const titleLength = title.length;
        linksMap[titleLength] = title;
      }
    }
  }

  let nextStartingPoint;

  //check if jsonRespone.continue is defined before grabbing plcontinue
  jsonResponse.continue ? (nextStartingPoint = jsonResponse.continue.plcontinue) : undefined;
  const nextResults = await fetchAllLinks(title, nextStartingPoint);
  // console.log('linksMap',{...linksMap})
  return {...linksMap, ...nextResults}
  // return linksMap
}


// let links = async () => await fetchAllLinks("Albert Einstein", 'INITIAL');
// };
// fetchAllLinks("Avengers", 'INITIAL').then(links => console.log(links))
// let philosophyLink = await fetchPhilosophyLink("Albert Einstein", 0);
// console.log('links', links())
// console.log('Philly', philosophyLink)

module.exports.fetchAllLinks = fetchAllLinks;
// module.exports.pluckAPIValue = pluckAPIValue;