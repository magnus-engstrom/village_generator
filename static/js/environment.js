class Environment {
    constructor(heightMap) {
      let shape = Utils.shape(heightMap);
      this.population = 0;
      this.grid = [];
      this.openFields = [];
      this.prevEdge = [-1,-1];
      this.types = {
        'water': 4,
        'sand': 2,
        'rocks': 3,
        'grass': 0,
        'woods': 1,
        'building': -1,
        'road': 5,
        'paving': 6,
        'field': 7,
        'terrain': 8,
      }
      let n = Utils.avg(heightMap)*0.08;
      for (let y = 0; y < shape[0]; y++) {
        this.grid.push([]);
        for (let x = 0; x < shape[1]; x++) {
          if (heightMap[y][x] + Math.random()*n-n*2 < 0.34) {
            this.grid[y].push(this.types['water']);
          } else if (heightMap[y][x] + Math.random()*n-n*2 < 0.42) {
            this.grid[y].push(this.types['sand']);
          } else if (heightMap[y][x] + Math.random()*n-n*2 > 0.68 && heightMap[y][x] + Math.random()*n-n*2 < 0.69) {
            this.grid[y].push(this.types['rocks']);
          } else if (heightMap[y][x] + Math.random()*n-n*2 > 0.44 && heightMap[y][x] + Math.random()*n-n*2 < 0.48) {
            this.grid[y].push(this.types['woods']);
          } else if (heightMap[y][x] + Math.random()*n-n*2 < 0.71 || heightMap[y][x] + Math.random()*n-n*2 > 0.95 || Math.random()*n > 0.05) {
            this.grid[y].push(this.types['grass']);
            this.openFields.push([x, y]);
          } else  {
            this.grid[y].push(this.types['woods']);
            this.openFields.push([x, y]);
          }
        }
      }
    }
    increasePopulation(n) {
      this.population += n;
    }
    getFlattenedGrid() {
      let hash = {};
      Object.values(this.types).forEach((v) => {
        hash[v.toString()] = [];
        this.grid.forEach((row, y) => {
          row.forEach((col, x) => {
            if (col === v) hash[v.toString()].push({ 'x': x, 'y': y });
          });
        });
      });
      return hash;
    }
    setCell(x, y, type) {
      if (y < this.grid.length && y > 0 && x < this.grid[0].length && x > 0) {
        this.grid[y][x] = type;
      } 
    }
    getCell(x, y) {
      return this.grid[y][x];
    }
    getRandomEdgeSpace() {
      let edgeSpaces = this.getFlattenedGrid()[this.types['grass']].filter(a => (a.x == 0 || a.y == 0 || a.x == this.grid[0].length-1 || a.y == this.grid.length-1) && a.x != this.prevEdge.x && a.y != this.prevEdge.y);
      if (edgeSpaces.length == 0) return this.getRandomSpace();
      this.prevEdge = Utils.sample(edgeSpaces);
      return this.prevEdge;
    }
    getRandomSpace() {
      let spaces = this.getFlattenedGrid()[this.types['grass']].filter(a => a.x != 0 && a.y != 0 && a.x != this.grid[0].length-1 && a.y != this.grid.length-1);
      //let spaces = this.openFields.filter(a => a[0] != 0 && a[1] != 0 && a[0] != this.grid[0].length-1 && a[0] != this.grid.length-1);
      return Utils.sample(spaces);
    }
    getRoad() {
      if (this.getFlattenedGrid()[this.types['road']].length == 0) {
        return this.getRandomSpace();
      } else {
        return Utils.sample(this.getFlattenedGrid()[this.types['road']]);
      }
    }
    fillArea(xStart, yStart, padding, filling, exclude=[]) {
      if (yStart < this.grid.length && yStart > 0 && xStart < this.grid[0].length && xStart > 0) {
        for (let y=yStart-padding; y<=yStart+padding; y++) {
          for (let x=xStart-padding; x<=xStart+padding; x++) {
            if (y > 0 && this.grid.length > y && x > 0 && this.grid[0].length > x && exclude.indexOf(this.grid[y][x]) == -1) {
              this.grid[y][x] = filling;
            }
          }
        }
      }
    }
    smooth(itr) {
      let pr = 0;
      while (pr < itr) {
        let new_grid = Utils.clone(this.grid); 
        this.grid.forEach((row, y) => {
          row.forEach((col, x) => {
            let neighbors = [];
            for (let i=-1;i<2;i++) {
              for (let ii=-1;ii<2;ii++) {
                if (0 <= i+x && i+x < row.length && 0 <= ii+y && ii+y < this.grid.length) {
                  if (i == 0 && ii == 0) continue;
                  neighbors.push(this.grid[y+ii][x+i]);
                }
              }
            }
            new_grid[y][x] = Utils.mode(neighbors);
          });
        });
        this.grid = Utils.clone(new_grid);
        pr++;
      }
    }
  }