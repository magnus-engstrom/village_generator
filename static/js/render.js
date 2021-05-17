const Render = (() => {
    let canvas = document.getElementById('main');
    let ctx = canvas.getContext('2d');
    let width = 640;
    let height = 640;
    let textures = {};
    let tileSize = 0;
    let scale = 0.5;
    let textureSrc = [
      'terrain/terrain_1',
      'trees/tree_10',
      'trees/tree_11',
      'trees/tree_c1',
      'trees/tree_c2',
      'trees/tree_c3',
      'trees/tree_c4',
      'trees/tree_c5',
      'perimiter/perimiter_1',
      'perimiter/perimiter_2',
      'perimiter/perimiter_3',
      'fields/field_1',
      'fields/field_2',
      'fields/field_3',
      'dirt',
      'dirt2',
      'boat_1',
      'sand/sand_1',  
      'sand/sand_2',
      'sand/sand_3',  
      'plant',
      'plant_2',  
      'water', 
      'water2',   
      'rocks1',
      'grass/grass_1',
      'grass/grass_2',
      'grass/grass_3',
      'grass/grass_4',
      'grass/grass_5',
      'road/road_1',
      'road/road_2',
      'road/road_3',
      'road/road_4',
      'paving/paving_1',
      'paving/paving_2',
      'building/building_1',
      'building/building_2',
      'building/building_3',
      'building/building_4',
      'building/building_5',
      'building/building_6',
      'building/building_7',
      'building/building_8',
      'building/building_9',
      'building/building_10',
      'building/building_11',
      'building/building_12',
      'building/building_13',
      'building/building_14',
      'building/building_15',
      'ritual/ritual_1',
      'ritual/ritual_2',
      'ritual/ritual_3',
      'ritual/ritual_4',
      'shadow_1',
      'shadow_2',
    ]
    loadTextures = (callback) => {
      textureSrc.forEach((imgName) => {
        var image = new Image;
        image.src = "/static/img/" + imgName + ".png";
        image.onload = (self) => {
          textures[imgName] = self.target;
          if (Object.keys(textures).length == textureSrc.length) {
            callback();
          }
        }
      });
    }
    clear = () => {
      ctx.clearRect(0, 0, width, height);
    }
    getTextures = (pattern) => {
      return textureSrc.filter(function (str) { return str.indexOf(pattern) > -1; });
    }

    contrastImage = (imgData, contrast) => { 
      var d = imgData.data;
      contrast = (contrast/100) + 1;
      var intercept = 128 * (1 - contrast);
      for(var i=0;i<d.length;i+=4){
          d[i] = d[i]*contrast + intercept;
          d[i+1] = d[i+1]*contrast + intercept;
          d[i+2] = d[i+2]*contrast + intercept;
      }
      return imgData;
    }
    
    drawTexture = (ctx, name, x, y, castShadow=false, a=Utils.randFloat(0.5,1.0), s=Utils.randFloat(0.7, 2.5), rotation=Math.random()*Math.PI*2) => {
      img = textures[Utils.sample(getTextures(name))];
      scale = (tileSize / img.width) * s;
      ctx.globalAlpha = Math.min(a, 1.0);
      ctx.shadowColor = 'rgba(0,0,0,0)';
      if (castShadow) {
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 3;
      }
      ctx.translate(x + tileSize / 2, y + tileSize / 2);
      ctx.rotate(Math.PI / 2);
      ctx.setTransform(scale, 0, 0, scale, Utils.randInt(-2,2) + x + tileSize / 2, Utils.randInt(-2,2) + y + tileSize / 2);
      ctx.rotate(rotation);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      ctx.setTransform(1,0,0,1,0,0);
      ctx.globalAlpha = 1.0;
    }
    drawBaseLayers = () => {
      ctx.globalCompositeOperation = "exclusion";
      ctx.fillStyle = "rgba(" + Utils.hexToRGB("DDEEFF", 1) + ", 1.0)";
      ctx.fillRect( 0, 0, width, height );
      ctx.globalCompositeOperation = "color";
      ctx.fillStyle = "rgba(" + Utils.hexToRGB("cfae6e", 1) + ", 0.4)";
      ctx.fillRect( 0, 0, width, height );
      ctx.globalCompositeOperation = "overlay";
      ctx.fillStyle = "rgba(" + Utils.hexToRGB("000000", 1) + ", 0.1)";
      ctx.fillRect( 0, 0, width, height );
      ctx.globalCompositeOperation = "lighten";
      ctx.fillStyle = "rgba(" + Utils.hexToRGB("4f662c", 1) + ", 0.7)";
      ctx.fillRect( 0, 0, width, height );
      ctx.globalCompositeOperation = "source-over";
    },
    resize = (w, h) => {
      canvas.width = w;
      canvas.height = h;
      //canvas.style.height = h+"px";
      width = w;
      height = h;
    }
    return {
      init: (ts, shape, callback) => {
        tileSize = ts;
        loadTextures(callback);
      },
      drawHeightMap: (heightGrid) => {
        clear();
        resize(heightGrid[0].length * tileSize, heightGrid.length * tileSize);
        heightGrid.forEach((row, y) => {
          row.forEach((col, x) => {
            ctx.fillStyle = "rgba(255,255,255," + col + ")";
            ctx.fillRect( x*tileSize, y*tileSize, tileSize, tileSize );
          });
        });
      },
      drawObjects: (objects) => {
        objects.forEach((obj) => {
          if (obj.texture == 'building') {
            drawTexture(ctx, 'perimiter', obj.x*tileSize, obj.y*tileSize, false, 0.6, Utils.randFloat(6.5, 8.0), obj.rotation);
            drawTexture(ctx, 'building', obj.x*tileSize, obj.y*tileSize, true, 1, Utils.randFloat(2.5, 3.5), obj.rotation);
          }
          if (obj.texture == 'ritual') {
            drawTexture(ctx, 'ritual', obj.x*tileSize, obj.y*tileSize, false, 0.8, Utils.randFloat(6.5, 10.0));
          }
          if (obj.texture == 'boat') {
            drawTexture(ctx, 'boat', obj.x*tileSize, obj.y*tileSize, true, 1.0, Utils.randFloat(3.5, 4.0));
          }
        });
      },
      drawEnv: (envGrid, heightGrid, envGrid1D, envTypes) => {
        let ts = tileSize;
        drawBaseLayers();
        envGrid1D[envTypes['water']].forEach((c) => {
          drawTexture(ctx, 'water2', c.x*ts, c.y*ts, false, 1);
          drawTexture(ctx, 'water', c.x*ts, c.y*ts, false, 3*heightGrid[c.y][c.x]);
        });         
        envGrid1D[envTypes['sand']].forEach((c) => {
          drawTexture(ctx, 'sand', c.x*ts, c.y*ts, false, 1-(heightGrid[c.y][c.x]*2.0), Utils.randFloat(1.0, 2.0));
          drawTexture(ctx, 'sand', c.x*ts, c.y*ts, false, 1-(heightGrid[c.y][c.x]*1.2), Utils.randFloat(0.5, 2.0));

        }); 
        envGrid1D[envTypes['field']].forEach((c) => {
          drawTexture(ctx, 'grass', c.x*ts, c.y*ts, false, heightGrid[c.y][c.x]/1.1);
        }); 
        envGrid1D[envTypes['grass']].forEach((c) => {
          let neighbors = Utils.getNeighbors(envGrid, c.x, c.y, 1);
          if (Utils.inArray(neighbors, envTypes['water'])) {
            drawTexture(ctx, 'grass', c.x*ts, c.y*ts, false, 1-(heightGrid[c.y][c.x]*1.2), Utils.randFloat(0.5, 1.0));           
          } else {
            drawTexture(ctx, 'grass', c.x*ts, c.y*ts, false, heightGrid[c.y][c.x]/1.1);
          }

        }); 
        envGrid1D[envTypes['road']].forEach((c) => {
          let neighbors = Utils.getNeighbors(envGrid, c.x, c.y, 2);
          if (Utils.inArray(neighbors, envTypes['woods'])) {
            drawTexture(ctx, 'terrain', c.x*ts, c.y*ts, false, Utils.randFloat(0.05, 0.1), Utils.randFloat(1.0, 3.5));
          }
          ctx.globalCompositeOperation = "hue";
          drawTexture(ctx, 'road', c.x*ts, c.y*ts, false, 0.3, Utils.randFloat(2.0,2.0));
          ctx.globalCompositeOperation = "source-over";
          drawTexture(ctx, 'road', c.x*ts, c.y*ts, false, 0.1, Utils.randFloat(1.0, 1.5));
          drawTexture(ctx, 'road', c.x*ts, c.y*ts, false, 0.1, Utils.randFloat(0.5, 1.5));
        }); 
        envGrid1D[envTypes['paving']].forEach((c) => {
          ctx.globalCompositeOperation = "hue";
          drawTexture(ctx, 'road', c.x*ts, c.y*ts, false, 0.2, Utils.randFloat(2.0, 3.0));
          ctx.globalCompositeOperation = "source-over";
          drawTexture(ctx, 'road', c.x*ts, c.y*ts, false, 0.1, Utils.randFloat(1.0, 1.5));
        }); 
        envGrid1D[envTypes['field']].forEach((c) => {
          drawTexture(ctx, 'dirt', c.x*ts, c.y*ts, false, Utils.randFloat(0, 0.6), Utils.randFloat(1.5, 3.5)); 
        });
        envGrid1D[envTypes['field']].forEach((c) => {
          if (Utils.randFloat() < 0.3) drawTexture(ctx, 'plant', c.x*ts, c.y*ts, true, 0.6, Utils.randFloat(0.5, 2.0)); 
        });
        envGrid1D[envTypes['rocks']].forEach((c) => {
          drawTexture(ctx, 'rocks', c.x*ts, c.y*ts, false, 1.0, Utils.randFloat(0.5, 1.5));       
        }); 
        envGrid1D[envTypes['terrain']].forEach((c) => {
          drawTexture(ctx, 'terrain', c.x*ts, c.y*ts, false, Utils.randFloat(0, 0.2));     
        }); 
        envGrid1D[envTypes['woods']].forEach((c) => {
          ctx.globalCompositeOperation = "darken";
          drawTexture(ctx, 'grass', c.x*ts, c.y*ts, false, 1-heightGrid[c.y][c.x]);
          drawTexture(ctx, 'grass', c.x*ts, c.y*ts, false, 1-heightGrid[c.y][c.x]);
          drawTexture(ctx, 'terrain', c.x*ts, c.y*ts, false, heightGrid[c.y][c.x]*0.1*Math.random(), Utils.randFloat(1.0, 3.5)); //true  
          ctx.globalCompositeOperation = "source-over";
          if (Utils.haveOnlyNeighbor(envGrid, c.x, c.y, 1, 1)) {
            drawTexture(ctx, 'shadow', c.x*ts, c.y*ts, false, Math.random()*0.1, Utils.randFloat(1.0, 3.5));
            drawTexture(ctx, 'tree', c.x*ts, c.y*ts, false, 0.8, Utils.randFloat(1.0, 2.5)); //true  
          } else {
            drawTexture(ctx, 'tree', c.x*ts, c.y*ts, true, 0.8, Utils.randFloat(1.0, 2.5)); //true  
          }
        }); 
      },
      finalize: (population, score) => {
        let imageData = ctx.getImageData(0, 0, width, height);
        ctx.putImageData(contrastImage(imageData, 5), 0, 0);
        ctx.fillStyle = "#999";
        ctx.textAlign = "right";
        ctx.font = "14px Arial";
        ctx.fillText("Population: ", width-145, height-5);
        ctx.fillStyle = "#CCC";
        ctx.textAlign = "left";
        ctx.fillText(population, width-145, height-5);
        ctx.fillStyle = "#999";
        ctx.textAlign = "right";
        ctx.fillText("Total score: ", width-35, height-5);
        ctx.fillStyle = "#CCC";
        ctx.textAlign = "left";
        ctx.fillText(score, width-35, height-5);
      }
    }
  })();