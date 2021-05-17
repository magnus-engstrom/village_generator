class PerlinNoiseMap {
    constructor(height, width, tileSize, startGrid=[]) {
      if (startGrid.length == 0) {
        this.grid = Array.from({length: Math.floor(height/tileSize)}, () => {
          return Array.from({length: Math.floor(width/tileSize)}, () => {
            return Utils.randomInt([0,1], [0.4, 0.6])
          } );
        });
      } else {
        this.grid = startGrid;
      }
    }
    place_fields(n) {
      let padding = 10;
      for (let i = 0; i < n; i++) {
        let size = [Utils.randInt(5, 25), Utils.randInt(5, 25)];
        let start = [
          Utils.randInt(padding, this.grid[0].length-size[0]-padding), 
          Utils.randInt(padding, this.grid[1].length-size[1]-padding)
        ];
        for (let y = start[1]; y < start[1]+size[1]; y++) {
          for (let x = start[0]; x < start[0]+size[0]; x++) {
            this.grid[y+Utils.randInt(-padding, padding)][x+Utils.randInt(-padding, padding)] = 0;
          }
        }
      }
    }
    smooth() {
      let new_grid = Utils.clone(this.grid); 
      this.grid.forEach((row, y) => {
        row.forEach((col, x) => {
          let neighbors = [];
          for (let i=-1;i<2;i++) {
            for (let ii=-1;ii<2;ii++) {
              if (0 <= i+x && i+x < row.length) {
                if (0 <= ii+y && ii+y < this.grid.length) {
                  if (i == 0 && ii == 0) {
                    continue;
                  } else {
                    neighbors.push(this.grid[y+ii][x+i]);
                  }
                }
              }
            }
          }
          new_grid[y][x] = Utils.avg(neighbors);
        });
      });
      this.grid = Utils.clone(new_grid);
      let min_max = Utils.minMax(this.grid) 
      this.grid.forEach((row, y) => {
        row.forEach((col, x) => {
          this.grid[y][x] = (this.grid[y][x] - min_max[0]) / (min_max[1] - min_max[0])
        });
      });
    }
  }