import fetch from 'node-fetch';

// const url = "https://en.wikipedia.org/w/api.php?" +
//     new URLSearchParams({
//         origin: "*",
//         action: "query",
//         page: "Albert Einstein",
//         format: "json",
//     });

// try {
//     const req = await fetch(url);
//     const json = await req.json();
//     console.log(json.parse.text["*"]);
//     // console.log(json)
// } catch (e) {
//     console.error(e);
// }


const url = "https://en.wikipedia.org/w/api.php?" +
    new URLSearchParams({
        origin: "*",
        action: "query",
        prop: "info",
        format: "json",
        titles: "Albert Einstein",
        inprop: "url"        
    });

try {
    const req = await fetch(url);
    const json = await req.json();
    console.log(json.query.pages)
    //
// '736': {
//   pageid: 736,
//   ns: 0,
//   title: 'Albert Einstein',
//   contentmodel: 'wikitext',
//   pagelanguage: 'en',
//   pagelanguagehtmlcode: 'en',
//   pagelanguagedir: 'ltr',
//   touched: '2021-04-26T12:55:01Z',
//   lastrevid: 1019657459,
//   length: 179681,
//   fullurl: 'https://en.wikipedia.org/wiki/Albert_Einstein',
//   editurl: 'https://en.wikipedia.org/w/index.php?title=Albert_Einstein&action=edit',
//   canonicalurl: 'https://en.wikipedia.org/wiki/Albert_Einstein'
// }
} catch (e) {
    console.error(e);
}
