var canvas = document.getElementById('tennis'),
    ctx = canvas.getContext('2d');
//1920x1080
var canvasWidth = 1920;
var canvasHeight = 1080;
ctx.fillStyle = '#fff';

ctx.translate(canvasWidth / 2, canvasHeight / 2);

ctx.rotate(10 * Math.PI / 180);

ctx.translate(-canvasWidth / 2, -canvasHeight / 2);

ctx.fillRect(canvasWidth / 2 - 50, canvasHeight / 2 - 50, 100, 100);
//ctx.translate(-canvasWidth / 2 - 50, -canvasHeight / 2 - 50);
ctx.fillStyle = 'red';
ctx.fillRect(canvasWidth / 2 - 10, canvasHeight / 2 - 10, 20, 20);