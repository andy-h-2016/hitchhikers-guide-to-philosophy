import fetch from 'node-fetch';

async function fetchAllLinks(title, startingPoint) {
  console.log('ARGS', title, startingPoint)
  let linksMap = {};
  
  let url = "https://en.wikipedia.org/w/api.php?origin=*"; 
  let params = {
    action: "query",
    format: "json",
    titles: title,
    prop: "links",
    pllimit: "max",
    plnamespace: 0,
  };
  
  if (startingPoint === undefined) {
    return Promise.resolve({});
  } else if (startingPoint !== 0) {
    params.plcontinue = startingPoint;
  }
  
  Object.keys(params).forEach(key => url += "&" + key + "=" + params[key]);
  // console.log('url', url)
  const response = await fetch(url);
  const jsonResponse = await response.json();
  const pages = jsonResponse.query.pages;
  for (const pageId in pages) {
    //should only be inputting one title at a time, so there will only be one pageId to iterate thru. Using for loop to grab the unknown key in the pages object.
    for (const link of pages[pageId].links) {
      const title = link.title;
      if (title.toUpperCase() === title) {
        //filter out acronyms or else we'll be looping through acronyms forever
        continue
      } else {
        const titleLength = title.length;
        linksMap[titleLength] = title;
        linksMap[title] = title;
      }
    }
  }
  console.log('INTERMEDIATE', linksMap)

  let nextStartingPoint;

  //check if jsonRespone.continue is defined before grabbing plcontinue
  jsonResponse.continue ? (nextStartingPoint = jsonResponse.continue.plcontinue) : undefined;
  const nextResults = await fetchAllLinks(title, nextStartingPoint);
  return {linksMap, ...nextResults}
  // return linksMap

  }

 fetchAllLinks("Albert Einstein", 0).then(allLinks => {
   console.log('allLinksS',allLinks)
  })
