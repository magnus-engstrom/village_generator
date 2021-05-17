class SearchNode {
  constructor(x, y, parent, xEnd=-1, yEnd=-1) {
    this.xPos = x;
    this.yPos = y;
    this.parent = parent;
    this.score = -1;
    if (xEnd + yEnd < 0) {
      this.xEnd = parent.xEnd;
      this.yEnd = parent.yEnd;
    } else {
      this.xEnd = xEnd;
      this.yEnd = yEnd;
      this.calculateScore(0);
    }
    this.foundTarget = false;
  }
  calculateScore(envType, heightPenalty) {
    let panalties = {
      '0': 1, // grass
      '1': 2, // woods
      '2': 10, // sand
      '3': 3, // rocks
      '4': 50, // water
      '5': -5, // road
      '6': -1.5, // road
      '7': 10, // building
      '8': 2,
    }
    this.score = Math.abs(this.xPos-this.xEnd) + Math.abs(this.yPos-this.yEnd);
    if (this.score < 1) {
      this.foundTarget = true;
    } else {
      this.score += (1 - heightPenalty);
      this.score += panalties[envType];
    }
  }
  spawnNodes(envGrid, heigtGrid) {
    let childNodes = [];
    if (this.xPos > 0) childNodes.push(new SearchNode(this.xPos-1, this.yPos, this));
    if (this.xPos < envGrid[0].length-1) childNodes.push(new SearchNode(this.xPos+1, this.yPos, this));
    if (this.yPos > 0) childNodes.push(new SearchNode(this.xPos, this.yPos-1, this));
    if (this.yPos < envGrid.length-1) childNodes.push(new SearchNode(this.xPos, this.yPos+1, this));
    // if (this.xPos > 0 && this.yPos > 0) childNodes.push(new SearchNode(this.xPos-1, this.yPos-1, this));
    // if (this.xPos > 0 && this.yPos < envGrid.length) childNodes.push(new SearchNode(this.xPos-1, this.yPos+1, this));
    // if (this.xPos < envGrid.length[0] && this.yPos > 0) childNodes.push(new SearchNode(this.xPos+1, this.yPos-1, this));
    // if (this.xPos < envGrid.length[0] && this.yPos < envGrid.length) childNodes.push(new SearchNode(this.xPos+1, this.yPos+1, this));
    childNodes.forEach((node) => {
      node.calculateScore(envGrid[node.yPos][node.xPos], heigtGrid[node.yPos][node.xPos]);
      if (node.foundTarget) return;
    });
    return childNodes;
  }
}

const PathFinder = (() => {
  let openNodes = [];
  let searchGrid = [];
  let heightGrid = [];
  let finalPath = [];
  let closedNodes = [];
  searchPathRecursive = (currentNode) => {
    closedNodes.push([currentNode.yPos, currentNode.xPos]);
    currentNode.spawnNodes(searchGrid, heightGrid).forEach((childNode) => {
      if (!Utils.inArray(closedNodes, [childNode.yPos, childNode.xPos])) {
        openNodes.push(childNode);
        if (childNode.foundTarget && finalPath.length == 0) {
          nNode = childNode;
          while (nNode != undefined) {
            finalPath.push({'x': nNode.xPos, 'y': nNode.yPos});
            nNode = nNode.parent;
          }
        }
      }
    });
    if (finalPath.length > 0) return;
    if (openNodes.length < 1300 && finalPath.length == 0) {
      openNodes.sort((a, b) => a.score - b.score);
      searchPathRecursive(openNodes.shift());
    } else {
      openNodes.sort((a, b) => a.score - b.score);
    }
  }
  return {
    createPath: (start, end, envGrid, noiseGrid) => {
      searchGrid = envGrid;
      heightGrid = noiseGrid;
      finalPath = [];
      closedNodes = [];
      openNodes = [];
      searchPathRecursive(new SearchNode(start[0], start[1], undefined, end[0], end[1]));
      return finalPath;
    }
  }
})();