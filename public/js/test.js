(function () {

    /*var image = new Image();

     var dt = 0.016;


     image.src = '../img/racket-sprites-1.png';

     var canvas = document.getElementById('tennis');


     var ctx = canvas.getContext('2d');

     var Sprite = (function () {
     function Sprite(url, pos, size, speed, frames, dir, once) {

     this.url = url;
     this.pos = pos;
     this.size = size;
     this.speed = speed;
     this.frames = frames;
     this.dir = dir || 'horizontal';
     this.once = once;
     this.index = 0;

     }

     Sprite.prototype.update = function () {
     this.index += this.speed * dt;
     };

     Sprite.prototype.render = function () {
     var frame;

     if (this.speed > 0) {

     var max = this.frames.length;

     var idx = Math.floor(this.index);

     frame = this.frames[idx % max];


     if (this.once && idx > max) {

     this.done = true;

     return;

     }

     }

     else {

     frame = 0;

     }

     var x = this.pos[0];
     var y = this.pos[1];

     if (this.dir == 'vertical') {

     y += frame * this.size[1];

     }

     else {

     x += frame * this.size[0];

     }

     ctx.drawImage(image,
     x, y,
     this.size[0], this.size[1],
     0, 0,
     this.size[0], this.size[1]
     )

     };

     return Sprite;
     })();


     var sp = new Sprite('../img/racket-sprites-1.png', [0, 0], [85, 254], 65, [0, 1, 0, 1, 2]);

     function loop() {
     ctx.clearRect(0, 0, 300, 300);
     sp.update();
     sp.render();

     requestAnimationFrame(loop);
     }

     loop();*/

    var canvas = document.getElementById('tennis');
    var ctx = canvas.getContext('2d');

    var image = new Image;
    image.src = '../img/racket-sprites.png';


    function loop() {
        ctx.clearRect(0, 0, 2000, 2000);
        ctx.fillStyle = '#fff';

        ctx.drawImage(image,
            0, 0,
            254, 67,
            0, 0,
            254,67
        );

        requestAnimationFrame(loop);
    }

    loop();
})();