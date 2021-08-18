var fileLoader = document.getElementById('fileLoader');
var image = document.getElementById('image');
var canvas = document.getElementById('image-canvas');
var context = null;

//Círculo
let circulo = function () {
    var ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.arc(100, 75, 50, 0, 2 * Math.PI);
    ctx.stroke();
}


document.getElementById('btnCirculo').addEventListener('click', circulo);