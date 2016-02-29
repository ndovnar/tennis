;
jQuery(function ($) {



    //clientIo.socket.id  client session id


    var canvas = document.getElementById('tennis'),
        ctx = canvas.getContext('2d');

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
                /*setTimeout(function () {
                 console.log(Date.now() - data);
                 }, 1000);
                 console.log(Date.now() + ' serverTime: ' + data);*/
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

            this.dt = undefined;

            this.renderEntity = [];
            this.updateEntity = [];


            this.lastTime = 0;

            this.init();

        }

        App.prototype.init = function () {

            this.bindEvents();

            this.imageLoader = new ImageLoader({
                imageArray: ['../img/racket-sprites.png', '../img/racket-sprites-2.png'],
                callbacks: [this.createEntity.bind(this), this.loop.bind(this)]
            });

        };


        App.prototype.bindEvents = function () {
            $(document).on('click', '.new-game', this.newGame);
            $(document).on('click', '.join-game', this.joinGame);
            $(window).on('blur', this.keySet);
            $(document).on('keydown', this.keySet);
            $(document).on('keyup', this.keySet);
        };

        App.prototype.createEntity = function () {
            this.ball = new Ball(this);

            this.playerOne = new Racket(this, 'playerOne');

            this.playerTwo = new Racket(this, 'playerTwo');
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
            if (e.type === 'blur') {

                for (var key in keyEvents) {
                    keyEvents[key] = false
                }

                clientIo.emitKeyEvents(keyEvents);

                return false;
            }

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

        App.prototype.update = function () {

            var i,
                entityLength = this.updateEntity.length;

            for (var i = 0; i < entityLength; i++) {
                this.updateEntity[i]();
            }

        };

        App.prototype.render = function () {
            ctx.clearRect(0, 0, 2000, 2000);
            ctx.beginPath();
            ctx.fillStyle = '#fff';

            var i,
                entityLength = this.renderEntity.length;


            for (var i = 0; i < entityLength; i++) {
                this.renderEntity[i]();
            }


            ctx.closePath();


        };

        App.prototype.loop = function () {

            var now = Date.now();

            this.dt = (now - this.lastTime) / 1000;

            if (this.entity !== undefined) {
                this.update();
                this.render();
            }

            this.lastTime = now;

            requestAnimationFrame(this.loop.bind(this));

        };


        return App;
    })();

    var Ball = (function () {
        function Ball(App) {
            this.App = App;
            this.position = undefined;
            this.radius = undefined;


            this.App.updateEntity.push(this.update.bind(this));
            this.App.renderEntity.push(this.render.bind(this));
        }

        Ball.prototype.update = function () {
            this.position = this.App.entity.ball.position;
            this.radius = this.App.entity.ball.radius;


        };

        Ball.prototype.render = function () {
            ctx.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI, false);
            ctx.fill();
        };

        return Ball;
    })();

    var Racket = (function () {

        function Racket(App, player) {
            this.App = App;
            this.player = player;

            this.position = undefined;
            this.width = undefined;
            this.height = undefined;

            if (player === 'playerOne') {
                this.sprite = new Sprite(this.App, this.position, [0, -45],'../img/racket-sprites.png', [254, 85], 65, [0, 1, 2, 1, 2, 3, 2], 'vertical');
            }
            else {
                this.sprite = new Sprite(this.App, this.position, [0, 0], '../img/racket-sprites-2.png', [254, 85], 65, [0, 1, 2, 1, 2, 3, 2], 'vertical');
            }

            this.App.updateEntity.push(this.update.bind(this));
            this.App.renderEntity.push(this.render.bind(this));

        }

        Racket.prototype.update = function () {
            this.position = this.App.entity[this.player].position;
            this.width = this.App.entity[this.player].width;
            this.height = this.App.entity[this.player].height;
            this.sprite.update(this.position, [this.width, this.height]);
        };

        Racket.prototype.render = function () {
            this.sprite.render();
        };

        return Racket;

    })();

    var Sprite = (function () {
        function Sprite(App, position, positionImage, url, size, speed, frames, dir, once) {
            this.App = App;

            this.url = url;
            this.position = position;
            this.positionImage = positionImage || [0, 0];
            this.size = size;
            this.speed = speed;
            this.frames = frames;
            this.dir = dir || 'horizontal';
            this.once = once;
            this.index = 0;

        }

        Sprite.prototype.update = function (position) {

            this.position = position;

            this.index += this.speed * this.App.dt;

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
            var x = 0;
            var y = 0;


            if (this.dir == 'vertical') {

                y += frame * this.size[1];

            }

            else {

                x += frame * this.size[0];

            }

            ctx.drawImage(this.App.imageLoader.get(this.url),
                x, y,
                this.size[0], this.size[1],
                this.position.x + this.positionImage[0], this.position.y + this.positionImage[1],
                this.size[0], this.size[1]);

        };

        return Sprite;
    })();

    var ImageLoader = (function () {

        function ImageLoader(object) {

            this.downloadsImage = {};
            this.readyCallbacks = [];

            this.onReady(object.callbacks);

            var i,
                urlArray = object.imageArray,
                urlArrayLength = urlArray.length;

            for (i = 0; i < urlArrayLength; i++) {
                this.load(urlArray[i]);
            }


        }


        ImageLoader.prototype.load = function (url) {

            if (this.downloadsImage[url]) {

                return this.downloadsImage[url];

            }

            else {

                var image = new Image;

                var imageOnLoad = function () {

                    this.downloadsImage[url] = image;

                    if (this.isReady()) {

                        this.readyCallbacks.forEach(function (func) {
                            func();
                        });

                    }

                };

                image.onload = function () {

                    imageOnLoad.call(this);

                }.bind(this);

                this.downloadsImage[url] = false;

                image.src = url;

            }

        };

        ImageLoader.prototype.isReady = function () {

            var ready = true;

            for (var key in this.downloadsImage) {

                if (this.downloadsImage.hasOwnProperty(key) && !this.downloadsImage[key]) {
                    ready = false;
                }

            }

            return ready;

        };

        ImageLoader.prototype.onReady = function (funcArr) {

            this.readyCallbacks = funcArr;

        };

        ImageLoader.prototype.get = function (url) {

            return this.downloadsImage[url] || false;

        };

        return ImageLoader;

    })();

    var clientIo = new ClientIo();

    var app = new App();


}($));