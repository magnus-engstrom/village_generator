class WorldObject {
  constructor(x, y, texture, rotation=0, scale=1, perimiter=false) {
    this.x = x;
    this.y = y;
    this.texture = texture;
    this.rotation = rotation;
    this.keep = true;
    this.perimiter = perimiter;
    this.scale = scale;
  }
}