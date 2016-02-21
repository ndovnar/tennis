;
jQuery(function ($) {
    //clientIo.socket.id  client session id
    var entity = undefined;

    var keyEvents = {left: false, right: false};

    function keySet(e, state) {
        var key = e.keyCode;

        if (key == 37 || key == 39 || key == 32) {

            e.preventDefault();

            switch (key) {

                case 37:
                    key = 'left';
                    break;
                case 39:
                    key = 'right';
                    break;

                case 32:
                    key = 'space';
                    break;

            }

            keyEvents[key] = state;

        }
    }

    $(document).keydown(function (e) {
        keySet(e, true);
    });
    $(document).keyup(function (e) {
        keySet(e, false);
    });

    var ClientIo = (function () {
        function ClientIo() {
            this.init();
        }

        ClientIo.prototype.init = function () {
            this.socket = io.connect();
            this.bindEvents();
        };

        ClientIo.prototype.bindEvents = function () {
            this.socket.on('connected', this.onConnected.bind(this));
            this.socket.on('entity', this.entity.bind(this));
        };

        ClientIo.prototype.onConnected = function () {
            this.socket.emit('createRoom', 'room2');
            //this.socket.emit('joinRoom','room2')
        };

        ClientIo.prototype.createRoom = function (roomName) {
            this.socket.emit('createRoom', roomName);
        };

        ClientIo.prototype.entity = function (data) {
            entity = data;
        };

        return ClientIo;
    })();

    var clientIo = new ClientIo();


    var canvas = document.getElementById('myCanvas');
    var ctx = canvas.getContext('2d');


    function draw() {
        ctx.clearRect(0, 0, 2000, 2000);
        ctx.beginPath();
        ctx.arc(entity.ball.position.x, entity.ball.position.y, entity.ball.radius, 0, 2 * Math.PI, false);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.stroke();
        //ctx.clearRect(0, 0, 2000, 2000);
        ctx.fillStyle = '#fff';
        ctx.fillRect(entity.playerOne.position.x, entity.playerOne.position.y, entity.playerOne.width, entity.playerOne.height);
        ctx.fillRect(entity.playerTwo.position.x, entity.playerTwo.position.y, entity.playerTwo.width, entity.playerTwo.height);
    }

    var ss = 15;
    var dd = 15;

    function loop() {
        ss += 1;
        dd += 1;
        requestAnimationFrame(loop);
        if (entity !== undefined) {
            draw();
            clientIo.socket.emit('keyEvents', keyEvents);
        }

        //$('body').css({'background-position': ss + 'px ' + dd + 'px'})
    }

    loop();


}($));