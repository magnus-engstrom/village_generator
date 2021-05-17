const Utils = (() => {
    array_shape = (arr ) => {
      let dims = [ arr.length, arr[0].length ];
      if (dims[1] == undefined) dims[1] = -1;
      return dims;
    }
    return {
      randInt: (min, max) => {
        return min + Math.floor(Math.random() * (max-min));
      },
      randFloat: (min=0.0, max=1.0) => {
        return min + Math.random() * (max-min);
      },
      shape: (arr) => {
        return array_shape(arr);
      },
      clone: (obj) => {
        return JSON.parse(JSON.stringify(obj))
      },
      avg: (arr) => {
        let shape = array_shape(arr);
        if (shape[1] != -1) {
          let avg = 0;
          arr.forEach((row) => {
            avg += row.reduce( ( p, c ) => p + c, 0 ) / row.length;
          });
          return avg / shape[0];
        } else {
          return arr.reduce( ( p, c ) => p + c, 0 ) / arr.length;
        }
      },
      randomInt: (values, weights) => {
        var num = Math.random(),
            s = 0,
            lastIndex = weights.length - 1;
        for (var i = 0; i < lastIndex; ++i) {
            s += weights[i];
            if (num < s) return values[i];
        }
        return values[lastIndex];
      },
      minMax: (arr) => {
        let min, max 
        arr.forEach((row) => {
          if (min == undefined || Math.min(...row) < min) min = Math.min(...row);
          if (max == undefined || Math.max(...row) > max) max = Math.max(...row);
        });
        return [min, max];
      },
      hexToRGB: (hex, fade) => {
        colorFade = 0; //(Math.floor((fade*fade+(Math.random()*0.25))*30));
        var bigint = parseInt(hex, 16);
        var r = Math.max(((bigint >> 16) & 255) + colorFade, 0);
        var g = Math.max(((bigint >> 8) & 255) + colorFade, 0);
        var b = Math.max((bigint & 255) + colorFade, 0);
        return r + "," + g + "," + b;
      },
      mode: (arr) => {
        return arr.sort((a,b) =>
              arr.filter(v => v===a).length
            - arr.filter(v => v===b).length
        ).pop();
      },
      inArray: (arr, value) => {
        let hash = {};
        for(var i=0; i<arr.length; i++) {
            hash[arr[i]] = i;
        }
        return hash.hasOwnProperty(value);
      },
      extractCoordinates: (arr, type) => {
        let coords = [];
        arr.forEach((row, y) => {
          row.forEach((col, x) => {
            if (col == type) coords.push({'x': x, 'y': y});
          });
        }); 
        return coords;
      },
      sample: (arr) => {
        return arr[Utils.randInt(0,arr.length)];
      },
      getNeighbors: (grid, xStart, yStart, radius) => {
        let neighbors = [];
        for (let y=yStart-radius; y<=yStart+radius; y++) {
          for (let x=xStart-radius; x<=xStart+radius; x++) {
            if (y > 0 && grid.length > y && x > 0 && grid[0].length > x) {
              neighbors.push(grid[y][x]);
            }
          }
        }
        return neighbors;
      },
      haveOnly: (arr, value) => {
        arr.sort();
        return arr[0] == arr[arr.length -1] && arr[0] == value;
      },
      haveOnlyNeighbor: (grid, xStart, yStart, radius, type) => {
        return Utils.haveOnly(Utils.getNeighbors(grid, xStart, yStart, radius), type);
      },
      lineCoords: (xStart, xEnd, yStart, yEnd) => {
        let coords = [{'x': xStart, 'y': yStart}];
        let xCurrent = xStart;
        let yCurrent = yStart;
        let xStep = (xStart < xEnd) ? 1 : -1;
        let yStep = (yStart < yEnd) ? 1 : -1;
        while(xCurrent != xEnd || yCurrent != yEnd) {
          if (xCurrent != xEnd) xCurrent += xStep;
          if (yCurrent != yEnd) yCurrent += yStep;
          coords.push({'x': xCurrent, 'y': yCurrent});
        }
        coords.push({'x': xEnd, 'y': yEnd});
        return coords;
      },
    }
  })();