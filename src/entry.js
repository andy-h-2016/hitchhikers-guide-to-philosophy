import * as ArticleNode from './article_node';
import fetchFirstLink from './wikimedia_api_routes';

const nodes = {
  Philosophy: ArticleNode.createNode({
    title: "Philosophy",
    parent: []
  })};

const handleSubmit = async (e) => {
  e.preventDefault();
  e.stopPropagation();

  const newTitle = e.target[0].value;
  // console.log('e', e)
  
  let nextPage = await fetchFirstLink(newTitle);
  let linksToPhilosophy = [nextPage.title];
    console.log('result', nextPage)

  while (nextPage.title.toLowerCase() !== 'philosophy') {
    let potentialPage = await fetchFirstLink(nextPage.title);

    let count = 1;
    while (linksToPhilosophy.includes(potentialPage.title)) {
      count += 1;
      console.log('DUPLICATE', potentialPage);
      potentialPage = await fetchFirstLink(potentialPage.title, count)
      // return
    }
    nextPage = potentialPage;
    linksToPhilosophy.push(nextPage.title);
    console.log('result', nextPage)
  }
  
  // nodes[newTitle] = ArticleNode.createNode({
  //   title: newTitle, 
  //   child: linksObj.Philosophy || linksToPhilosophy[1]
  // })

  // // loop from 2nd link to second to last link in linksToPhilosophy array
  // // need special setup for the last link and for Philosophy
  // length = linksToPhilosophy.length
  // for (let i = 1; i < length - 1; i++) {
  //   let link = linksToPhilosophy[i];
  //   nodes[link] = ArticleNode.createNode({
  //     parent: linksToPhilosophy[i - 1],
  //     title: link,
  //     child: linksToPhilosophy[i + 1]
  //   })
  // }

  // const lastLink = linksToPhilosophy[length - 1];
  // nodes[lastLink] = ArticleNode.createNode({
  //   parent: linksToPhilosophy[length - 2],
  //   title: lastLink,
  //   child: "Philosophy"
  // })

  // nodes.Philosophy.parent.push(lastLink);
  
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".article-form");
  form.addEventListener("submit", handleSubmit); 
});