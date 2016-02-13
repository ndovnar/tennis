;
jQuery(function ($) {
    //clientIo.socket.id  client session id
    var ball = {
        pos: [0, 0]
    };
    var IO = {
        init: function () {
            IO.socket = io.connect();
            IO.bindEvents();
        },
        bindEvents: function () {
            IO.socket.on('connected', IO.onConnect);
            IO.socket.on('pos', function (data) {
                ball.pos = data;
                console.log('set data', data);
                //requestAnimationFrame(loop);
                //loop();
            })
        },
        onConnect: function () {
            IO.socket.emit('getPos');
        }
    };

    IO.init();

    /*var dt = 1;
    var speed = 1;
    var lastTime = 1;*/

   /* setInterval(function () {
        var now = Date.now();
        dt = (now - lastTime) / 1000.0;


        if (ball.pos[0] > 1300 - 15) {
            speed = -speed;
        }
        else if (ball.pos[0] < 0) {
            speed = -speed;
        }

        ball.pos[0] += speed;

    }, 1000 / 200);*/

    var canvas = document.getElementById('myCanvas');
    var ctx = canvas.getContext('2d');


    function ct() {
        ctx.beginPath();
        ctx.clearRect(0, 0, 1300, 1300);
        ctx.arc(ball.pos[0], 75, 10, 0, 2 * Math.PI, false);
        ctx.fillStyle = 'red';
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'red';
        ctx.stroke();
    }

    function loop() {
        ct();
        console.log('draw data', ball.pos);
        requestAnimationFrame(loop);
    };

    loop();

    /* var ClientIo = (function () {
     function ClientIo() {
     this.init();
     }

     ClientIo.prototype.init = function () {
     this.socket = io.connect();
     this.bindEvents();
     };

     ClientIo.prototype.bindEvents = function () {
     this.socket.on('connected', this.onConnected.bind(this));
     this.socket.on('giveId', this.giveId.bind(this));
     };

     ClientIo.prototype.onConnected = function () {
     this.socket.emit('getId');
     };
     ClientIo.prototype.giveId = function (data) {
     this.id = data;
     };

     ClientIo.prototype.createRoom = function (roomName) {
     this.socket.emit('createRoom', roomName);
     };

     return ClientIo;
     })();*/

    //var clientIo = new ClientIo();


    /*var clientIo = {

     init: function () {
     clientIo.socket = io.connect();
     clientIo.bindEvents();
     },

     bindEvents: function () {
     clientIo.socket.on('newGameCreated', clientIo.onNewGameCreated);
     }


     };


     clientIo.init();

     $('.create-room').click(function (e) {
     e.preventDefault();
     console.log(clientIo.socket.id);
     var room = prompt();

     clientIo.socket.emit('createNewRoom', room);
     });

     $('.some-room').click(function (e) {
     e.preventDefault();
     var room = prompt();
     clientIo.socket.emit('joinRoom', room);

     });
     $('.get-rooms').click(function (e) {
     e.preventDefault();
     console.log('s');
     clientIo.socket.emit('getRooms');
     });*/

}($));