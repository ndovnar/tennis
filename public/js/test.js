var canvas = document.getElementById('tennis'),
    ctx = canvas.getContext('2d');


var ball = {
    size: 50,
    speed: 5,
    position: 1000,

    update: function () {
        this.position += this.speed;
        if (this.position > 2000) {
            console.log('ss');
            this.speed = -this.speed;
        }
        if (this.position < 150) {
            this.speed = -this.speed;
        }
    },

    render: function () {
        ctx.save();
        ctx.clearRect(0, 0, 5000, 5000);
        ctx.translate(0, -this.position / 2 );

        ctx.fillRect(500, 100, 200, 40);

        ctx.fillRect(500, 2000, 200, 40);

        ctx.fillRect(500, this.position, this.size, this.size);
        ctx.restore();
        //ctx.fillRect(500,this.position,this.size,this.size);
    }

};


function loop() {
    ctx.fillStyle = '#fff';
    ball.update();
    ball.render();
    requestAnimationFrame(loop);
}

loop();