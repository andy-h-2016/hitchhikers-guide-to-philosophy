import fetch from 'node-fetch';

const url = "https://en.wikipedia.org/w/api.php?" +
    new URLSearchParams({
        origin: "*",
        action: "parse",
        page: "Albert Einstein",
        format: "json",
    });

try {
    const req = await fetch(url);
    const json = await req.json();
    console.log(json.parse.text["*"]);
    // console.log(json)
} catch (e) {
    console.error(e);
}
