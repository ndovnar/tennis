;
jQuery(function ($) {
    //clientIo.socket.id  client session id

    //var entity = undefined;


    var canvas = document.getElementById('tennis');
    var ctx = canvas.getContext('2d');

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
            this.socket.on('playerOneConnect', this.playerOneConnect.bind(this));
            this.socket.on('playerTwoConnect', this.playerTwoConnect.bind(this));

            this.socket.on('test', function (data) {
                console.log(Date.now()+ ' serverTime: ' + data );
            })

        };

        ClientIo.prototype.onConnected = function () {

        };

        ClientIo.prototype.createRoom = function (roomName) {
            this.socket.emit('createRoom', roomName);
        };
        ClientIo.prototype.joinRoom = function (roomName) {
            this.socket.emit('joinRoom', roomName);
        };

        ClientIo.prototype.emitKeyEvents = function (data) {
            this.socket.emit('keyEvents', data);
        };

        ClientIo.prototype.playerOneConnect = function () {
            $(canvas).addClass('rotate');
            $(canvas).addClass('playerOne');
        };
        ClientIo.prototype.playerTwoConnect = function () {
            $(canvas).removeClass('rotate');
            $(canvas).addClass('playerTwo');
        };
        ClientIo.prototype.entity = function (data) {
            app.entity = JSON.parse(data);
        };

        return ClientIo;
    })();

    var App = (function () {

        var keyEvents = {
            left: false,
            right: false,
            space: false
        };

        function App() {
            this.entity = undefined;

            this.init();
            this.loop();
        }

        App.prototype.init = function () {
            this.bindEvents();
        };


        App.prototype.bindEvents = function () {
            $(document).on('click', '.new-game', this.newGame);
            $(document).on('click', '.join-game', this.joinGame);
            $(document).on('keydown', this.keySet);
            $(document).on('keyup', this.keySet);
        };


        App.prototype.newGame = function (e) {
            e.preventDefault();
            var gameName = prompt('');
            clientIo.createRoom(gameName);
        };

        App.prototype.joinGame = function (e) {
            e.preventDefault();
            var gameName = prompt('');
            clientIo.joinRoom(gameName);
        };

        App.prototype.keySet = function (e) {

            var key = e.keyCode,
                state = (e.type == 'keydown') ? true : false;


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

                clientIo.emitKeyEvents(keyEvents);

            }
        };

        App.prototype.loop = function () {
            requestAnimationFrame(this.loop.bind(this));

            if (this.entity !== undefined) {
                this.draw();
            }

        };

        App.prototype.draw = function () {
            ctx.clearRect(0, 0, 2000, 2000);
            ctx.beginPath();
            ctx.arc(this.entity.ball.position.x, this.entity.ball.position.y, this.entity.ball.radius, 0, 2 * Math.PI, false);
            ctx.fillStyle = '#fff';
            ctx.fill();
            ctx.stroke();
            //ctx.clearRect(0, 0, 2000, 2000);
            ctx.fillStyle = '#fff';
            ctx.fillRect(this.entity.playerOne.position.x, this.entity.playerOne.position.y, this.entity.playerOne.width, this.entity.playerOne.height);
            ctx.fillRect(this.entity.playerTwo.position.x, this.entity.playerTwo.position.y, this.entity.playerTwo.width, this.entity.playerTwo.height);
        };

        return App;
    })();

    var clientIo = new ClientIo();

    var app = new App();




}($));