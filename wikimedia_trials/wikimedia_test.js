import fetch from 'node-fetch';

function fetchAllLinks(title, startingPoint) {
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
    return new Promise(() => ({}));
  } else if (startingPoint !== 0) {
    params.plcontinue = startingPoint;
  }

  Object.keys(params).forEach(key => url += "&" + key + "=" + params[key]);
  // console.log('url', url)
  return fetch(url)
    .then(response => response.json())
    .then(jsonResponse => {
      const pages = jsonResponse.query.pages;
      console.log('json', jsonResponse)
      for (const pageId in pages) {
        //should only be inputting one title at a time, so there will only be one pageId to iterate thru. Using for loop to grab the unknown key in the pages object.
        for (const link of pages[pageId].links) {
          const title = link.title;
          if (title.toUpperCase() === title) {
            //filter out acronyms or else we'll be looping through acronyms forever
            continue
          } else {
            const titleLength = title.length;
            // linksMap[titleLength] = title;
            linksMap[title] = title;
          }
        }
      }
      console.log('ARGS', title, startingPoint)

      let nextStartingPoint;

      //check if jsonRespone.continue is defined before grabbing plcontinue
      jsonResponse.continue ? (nextStartingPoint = jsonResponse.continue.plcontinue) : undefined;
      // return fetchAllLinks(title, nextStartingPoint)
      //   .then(result => {
      //     console.log('intermediate results', result)
      //     return {linksMap, ...result}
      //   });
      return linksMap
    })
    // .then(result => result)
    .catch(error => console.log('error', error));
  }

 fetchAllLinks("FDA", 0).then(result => console.log('RESULTS',result), err=> console.log('err', err));
