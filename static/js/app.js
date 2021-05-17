const Game = (() => {
  let heightMap, env;
  let worldObjects = [];
  let initWidth = 900;
  let initHeight = 900;
  let tileSize = 7;
  let sessionId = String(Date.now()) + String(Utils.randInt(0,100));
  let worldCount = 0;
  initRandom = () => {
    heightMap = new PerlinNoiseMap(initWidth, initHeight, tileSize);
    heightMap.place_fields(Utils.randInt(2, 15));
    Statistics.send(sessionId, worldCount);
  }
  initFromPixelGrid = (startGrid) => {
    heightMap = new PerlinNoiseMap(initWidth, initHeight, tileSize, startGrid);
  }
  calculateScore = () => {
    let score = 0;
    let boatCount = worldObjects.filter((o) => o.texture == 'boat' ).length * 3;
    let fieldCount = env.getFlattenedGrid()[env.types['field']].length * 0.1;
    let waterCount = env.getFlattenedGrid()[env.types['water']].length * 0.005;
    let woodCount = env.getFlattenedGrid()[env.types['woods']].length * 0.005;
    score = (2*env.population + fieldCount + boatCount + waterCount + woodCount) / (heightMap.grid.length/100);
    return parseInt(score * (1-Utils.avg(heightMap.grid)));
  }
  createWorld = () => {
    worldCount++;
    worldObjects = [];
    env = new Environment(heightMap.grid);
    env.smooth(4);
    for (let i=0;i<Utils.randInt(5,15);i++) {
      let end = Utils.sample([
        env.getRandomSpace(),
        env.getRandomEdgeSpace(), 
      ]);
      let start = env.getRoad();
      let checkpoint = start;
      PathFinder.createPath(
        [start.x, start.y],
        [end.x, end.y], 
        env.grid, 
        heightMap.grid
      ).forEach((p, i) => {
        if (p.x != 0 && p.y != 0 && p.x != env.grid[0].length-1 && p.y != env.grid.length-1 && env.getCell(p.x, p.y) != undefined && env.getCell(p.x, p.y) != env.types['water']) {
          let angle = Math.atan2(((checkpoint.x+p.y)/2) - p.x, ((checkpoint.y+p.x)/2) - p.y) - Math.PI/4;
          if (Math.random() < 0.3) {
            xBuild = Utils.sample([-5,0,0,0,5]);
            yBuild = Utils.sample([-5,0,0,0,5]);
            if (Utils.haveOnlyNeighbor(env.grid, p.x+xBuild, p.y+yBuild, 4, env.types['grass'])) {
              worldObjects.push(new WorldObject(p.x+xBuild, p.y+yBuild, 'building', angle, 1, true));
              env.setCell(p.x+xBuild, p.y+yBuild, env.types['building']);
              Utils.lineCoords(p.x, p.x+xBuild, p.y,  p.y+yBuild).forEach((coord) => {
                env.setCell(coord.x, coord.y,  env.types['paving'])
              });
            }
          }
          if (Math.random() < 0.02) {
            xBuild = Utils.sample([-11,0,11]);
            yBuild = Utils.sample([-11,0,11]);
            if (Utils.haveOnlyNeighbor(env.grid, p.x+xBuild, p.y+yBuild, 5, 0)) {
              env.fillArea(p.x+xBuild, p.y+yBuild, 5, env.types['field'], []);
            }
          }
          env.setCell(p.x, p.y, env.types['road'])
          env.fillArea(p.x, p.y, 1, 0, [1, 2, 5, 6]);
          if (Math.random() < 0.1) env.fillArea(p.x, p.y, 1, 0, [2, 5, 6]);
          if (i % 20 == 0) checkpoint = p;
        }
      });
      if (!Utils.inArray(Utils.getNeighbors(env.grid, end.x, end.y, 2), env.types['building'])) {
        env.fillArea(end.x, end.y, 2, 0, [env.types['sand'], env.types['building']]);
        worldObjects.push(new WorldObject(end.x, end.y, 'building', 0, 1, true));
        env.setCell(end.x, end.y, env.types['building']);
      }
    }
    let ritual_place = Utils.sample(env.getFlattenedGrid()[env.types['grass']]);
    if (Math.random() < 0.2 && Utils.haveOnlyNeighbor(env.grid, ritual_place.x, ritual_place.y, 3, env.types['grass'])) {
      worldObjects.push(new WorldObject(ritual_place.x, ritual_place.y, 'ritual', 0, 1, true));
      env.setCell(ritual_place.x, ritual_place.y, env.types['building']);
    }
    env.getFlattenedGrid()[env.types['sand']].forEach((sand) => {
      if (Math.random() < 0.06 && Utils.mode(Utils.getNeighbors(env.grid, sand.x, sand.y, 1)) == env.types['water']) {
        worldObjects.push(new WorldObject(sand.x, sand.y, 'boat', 0, 1, true));
        env.setCell(sand.x, sand.y, env.types['building']);
      }
    });
    worldObjects.forEach((o) => {
      let n = Utils.getNeighbors(env.grid, o.x, o.y, 2);
      if (n.indexOf(env.types['road']) > -1 || o.x < 3 || o.y < 3 || o.x > env.grid[0].length-3 || o.y > env.grid.length-3) {
        o.keep = false;
      } else if (o.texture == 'building') {
        env.increasePopulation(Utils.randInt(1,7));
      }
    });
    worldObjects = worldObjects.filter((o) => o.keep );
  },
  createHeightmapFromImage = (img) => {
    var reader = new FileReader();
    reader.onload = function(event){
      var img = new Image();
      img.onload = async () => {
        var canvas = document.createElement('canvas');
        let ctx = canvas.getContext('2d');
        let ratio = initWidth / parseInt(img.width / tileSize);
        canvas.width = initHeight / tileSize;
        canvas.height = (parseInt(img.height / tileSize) * ratio) / tileSize;
        ctx.drawImage(img,0,0, canvas.width, canvas.height);
        let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let pixelGrid = [];
        let pixelRow = [];
        let iC = 0
        for (i = 0; i < imgData.data.length; i += 4) {
          let value = (imgData.data[i] + imgData.data[i + 1] + imgData.data[i + 2]) / 765;
          pixelRow.push(value);
          if (iC == canvas.width-1) {
            pixelGrid.push(pixelRow);
            pixelRow = [];
            iC = 0;
          } else {
            iC++;
          }
        }
        initFromPixelGrid(pixelGrid);
        for (let i=15; i>=0; i--) {
          heightMap.smooth();
          Render.drawHeightMap(heightMap.grid);
          await new Promise(r => setTimeout(r, i));
        }
        createWorld();
        renderEnvironment();
        Render.finalize(env.population, calculateScore());
        Statistics.send(sessionId, worldCount, 'generate from image');
      }
      img.src = event.target.result;
    }
    reader.readAsDataURL(img);   
  },
  renderEnvironment = () => {
    Render.drawEnv(env.grid, heightMap.grid, env.getFlattenedGrid(), env.types);
    Render.drawObjects(worldObjects);
  }
  return {
    start: () => {
      initRandom();
      setTimeout( () => Render.init(tileSize, Utils.shape(heightMap.grid), Game.createRandomWorld), 0);
    },
    refresh: () => {
      initRandom();
      Game.createRandomWorld();
    },
    createRandomWorld: async () => {
      for (let i=30; i>=0; i--) {
        heightMap.smooth();
        Render.drawHeightMap(heightMap.grid);
        await new Promise(r => setTimeout(r, i));
      }
      createWorld();
      renderEnvironment();
      Render.finalize(env.population, calculateScore());
    },
    handleFile: (e) => {
      createHeightmapFromImage(e.target.files[0]);
    },
  }
})(); 
Game.start();
document.getElementById('inp').onchange = (e) => {
  Game.handleFile(e);
};
document.getElementById('random').onclick = (e) => {
  Game.refresh();
};
document.getElementById('download').onclick = (e) => {
  let canvasImage = document.getElementById('main').toDataURL('image/png');
  let xhr = new XMLHttpRequest();
  xhr.responseType = 'blob';
  xhr.onload = function () {
      let a = document.createElement('a');
      a.href = window.URL.createObjectURL(xhr.response);
      a.download = 'my_village.png';
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      a.remove()
    };
  xhr.open('GET', canvasImage);
  xhr.send();
  Statistics.send(sessionId, worldCount, 'download image');
};