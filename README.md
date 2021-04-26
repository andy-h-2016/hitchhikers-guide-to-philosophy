# Wiki Road to Philosophy

## Background
An unplanned feature of Wikipedia is how many of its articles can lead back to the <a href="https://en.wikipedia.org/wiki/Philosophy">Philosophy</a> page. This phenomenon has spawned a game for people to race to get to the Philosophy page from a random Wikipedia article. It has even become notable enough to have its own <a href="https://en.wikipedia.org/wiki/Wikipedia:Getting_to_Philosophy">article</a> on Wikipedia. The Wiki Road to Philosohy visualizes the trail of articles that are traversed to get from any given article to the Philosophy page. The strategy employed is to traverse through the article with the shortest title (excluding acronyms since they stand for longer titles) with the assumption that articles with shorter titles are more likely to be abstract and therefore closer to the topic of philosophy.

## Functionality & MVP
Users will be able to:
* Enter an article title and see the list of articles that lead to the Philosphy article. This list will be represented as a chain of nodes.
* Select a node to see details about the corresponding article. These details will include the distance away from the Philosophy article, as well as suggestions for other articles from which to start a new chain of nodes leading to Philosophy.
    * Chains that use the same articles will show as converging.

In addition, there will be a splash page introducing the app and how to use it. 

## Wireframe
The app will consist of a screen showing all of the nodes. As nodes are added to the screen, the zoom level will auto-scale to fit all of the nodes on the screen. Zoom controls will be available. Primary control scheme will be the mouse clicking and dragging to select nodes and move the view window around.
<img src=".assets/images/wireframe.png"/>


## Architecture & Technologies
The Wiki Road to Philosophy will be accomplished with the following technologies:
* `HTML/CSS` for rendering of the nodes.
* `Javascript` to handle user interaction via event listeners.
* `MediaWiki API` to access data on the links each Wikipedia article has.
* `Node Fetch` module to handle the AJAX requests to and responses from the `MediaWiki API`.

## Implementation Timeline
* Day 1: 
    * Create high-level proposal to map out goals and path to completion.
    * Get familiarized with `MediaWiki API` endpoints and their outputs.
    * Design `Javascript` functions to fetch the necessary data from the `MediaWiki API`.
* Day 2:
    * Design the `HTML/CSS` elements for the nodes, connections, and details dropdown
    * Implement logic via `Javascript` for creating a single chain of nodes to Philosophy
* Day 3:
    * Add functionality for chains with common nodes to converge.
    * Add functionality for controlling the viewport's zoom and location relative to the nodes.
* Day 4:
    * Create splash page with introduction and instructions.
    * Polish styling.

## Bonus Features

* Optimization: Find the shortest path from one article to another.
* Allow user to input target destination instead of being constrained only to the Philosophy page.
* Add loading modal with animation to run while app is fetching data from MediaWiki API and rendering the HTML/CSS elements.
