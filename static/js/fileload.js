document.getElementById('inp').onchange = (e) => {
  var reader = new FileReader();
  reader.onload = function(event){
      var img = new Image();
      img.onload = function(){
          var canvas = document.getElementById('photo');
          let ctx = canvas.getContext('2d');
          ctx.drawImage(img,0,0, canvas.width, canvas.height);
      }
      img.src = event.target.result;
  }
  reader.readAsDataURL(e.target.files[0]);   
};
