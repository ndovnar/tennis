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
            };

            ClientIo.prototype.onConnected = function () {
                this.createRoom('55');
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
                app.player = 'playerOne';
                //$(canvas).addClass('playerOne');
            };
            ClientIo.prototype.playerTwoConnect = function () {
                //$(canvas).addClass('playerTwo');
                $(canvas).removeClass('rotate');
                app.player = 'playerTwo';
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
                this.player = undefined;

                this.renderEntity = [];
                this.updateEntity = [];


                this.lastTime = 0;

                this.init();


            }

            App.prototype.init = function () {

                this.bindEvents();

                this.imageLoader = new ImageLoader({
                    imageArray: ['../img/game-sprites.png', '../img/ball.png'],
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

            App.prototype.updateKeyEvents = function () {

                if (this.player == 'playerOne') {
                    this.playerTwo.keyEvents = this.entity.playerTwo.keyEvents;
                }
                else if (this.player == 'playerTwo') {
                    this.playerOne.keyEvents = this.entity.playerOne.keyEvents;
                }

                this[this.player].keyEvents = keyEvents;

            };

            App.prototype.update = function () {

                this.updateKeyEvents();


                var i,
                    entityLength = this.updateEntity.length;

                for (var i = 0; i < entityLength; i++) {
                    this.updateEntity[i]();
                }


            };

            App.prototype.render = function () {

                ctx.clearRect(0, 0, 2000, 5000);

                var i,
                    entityLength = this.renderEntity.length;

                for (var i = 0; i < entityLength; i++) {
                    this.renderEntity[i]();
                }


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
                this.sprite = new Sprite(this.App.imageLoader.get('../img/game-sprites.png'), this.position, [-13, -13], [464, 780], [62, 62], [26, 26], 24, [0, 1, 2, 3]);


                this.App.updateEntity.push(this.update.bind(this));
                this.App.renderEntity.push(this.render.bind(this));
            }

            Ball.prototype.update = function () {
                this.position = this.App.entity.ball.position;
                this.radius = this.App.entity.ball.radius;
                this.sprite.update(this.App.dt, this.position);
            };

            Ball.prototype.render = function () {
                this.sprite.render();
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
                this.sprite = undefined;
                this.keyEvents = {};

                this.engine = {
                    left: new RacketEngine(this, 'left'),
                    right: new RacketEngine(this, 'right')
                };


                if (player === 'playerOne') {
                    this.sprite = new Sprite(this.App.imageLoader.get('../img/game-sprites.png'), this.position, [0, 0], [0, 0], [600, 130], [250, 56], 25, [0, 1, 2, 1, 0, 3, 4, 5, 4, 3], 'vertical');
                }
                else if (player === 'playerTwo') {
                    this.sprite = new Sprite(this.App.imageLoader.get('../img/game-sprites.png'), this.position, [0, 0], [600, 0], [600, 130], [250, 56], 25, [0, 1, 2, 1, 0, 3, 4, 5, 4, 3], 'vertical');
                }

                this.App.updateEntity.push(this.update.bind(this));
                this.App.renderEntity.push(this.render.bind(this));

            }

            Racket.prototype.update = function () {

                this.position = this.App.entity[this.player].position;
                this.width = this.App.entity[this.player].width;
                this.height = this.App.entity[this.player].height;

                this.sprite.update(this.App.dt, this.position);

                this.engine.left.update(this.App.dt);
                this.engine.right.update(this.App.dt);

            };

            Racket.prototype.render = function () {

                this.engine.left.render();
                this.engine.right.render();
                this.sprite.render();

            };

            return Racket;

        })();

        var RacketEngine = (function () {

            function RacketEngine(Racket, location) {

                this.MAX_ROTATE_ANGLE = 50;

                this.Racket = Racket;
                this.location = location;
                this.speedRotate = 400;
                this.width = 48;
                this.height = 52;
                this.angle = 0;
                this.position = undefined;
                this.sprite = undefined;


                if (this.Racket.player == 'playerOne') {
                    if (this.location == 'left') {
                        this.sprite = new Sprite(this.Racket.App.imageLoader.get('../img/game-sprites.png'), this.position, [10, -15], [0, 780], [116, 124], [48, 52], 20, [0, 1], 'vertical');
                    }
                    else if (this.location == 'right') {
                        this.sprite = new Sprite(this.Racket.App.imageLoader.get('../img/game-sprites.png'), this.position, [-10, -15], [116, 780], [116, 124], [48, 52], 20, [0, 1], 'vertical');
                    }
                }

                if (this.Racket.player == 'playerTwo') {
                    if (this.location == 'left') {
                        this.sprite = new Sprite(this.Racket.App.imageLoader.get('../img/game-sprites.png'), this.position, [10, 18], [232, 780], [116, 124], [48, 52], 20, [0, 1], 'vertical');
                    }
                    else if (this.location == 'right') {
                        this.sprite = new Sprite(this.Racket.App.imageLoader.get('../img/game-sprites.png'), this.position, [-10, 18], [348, 780], [116, 124], [48, 52], 20, [0, 1], 'vertical');
                    }
                }

            }

            RacketEngine.prototype.update = function (dt) {

                function rotateLeft(state) {

                    if (state) {
                        if (this.angle > -this.MAX_ROTATE_ANGLE) {
                            this.angle -= this.speedRotate * this.Racket.App.dt;
                        }
                        else {
                            this.angle = -this.MAX_ROTATE_ANGLE;
                        }

                    }
                    else if (!state) {
                        if (this.angle < 0) {
                            this.angle += this.speedRotate * this.Racket.App.dt;
                        }
                        else {
                            this.angle = 0;
                        }

                    }
                }

                function rotateRight(state) {
                    if (state) {
                        if (this.angle < this.MAX_ROTATE_ANGLE) {
                            this.angle += this.speedRotate * this.Racket.App.dt;
                        }
                        else {
                            this.angle = this.MAX_ROTATE_ANGLE;
                        }

                    }
                    else {
                        if (this.angle > 0) {
                            this.angle -= this.speedRotate * this.Racket.App.dt;
                        }

                        else {
                            this.angle = 0;
                        }
                    }
                }

                if (this.Racket.player == 'playerOne' && this.location == 'left' || this.Racket.player == 'playerTwo' && this.location == 'left') {
                    this.position = {
                        x: this.Racket.position.x,
                        y: this.Racket.position.y
                    };
                }

                if (this.Racket.player == 'playerOne' && this.location == 'right' || this.Racket.player == 'playerTwo' && this.location == 'right') {
                    this.position = {
                        x: this.Racket.position.x + this.Racket.width - this.width,
                        y: this.Racket.position.y
                    };

                }

                if (this.Racket.player == 'playerOne' && this.location == 'left' && this.Racket.keyEvents.right ||
                    this.Racket.player == 'playerTwo' && this.location == 'right' && this.Racket.keyEvents.left
                ) {
                    rotateLeft.call(this, true);
                }

                else if (this.Racket.player == 'playerOne' && this.location == 'right' && this.Racket.keyEvents.left ||
                    this.Racket.player == 'playerTwo' && this.location == 'left' && this.Racket.keyEvents.right
                ) {
                    rotateRight.call(this, true);
                }

                else if (this.Racket.player == 'playerOne' && this.location == 'right' && !this.Racket.keyEvents.left ||
                    this.Racket.player == 'playerTwo' && this.location == 'left' && !this.Racket.keyEvents.right) {
                    rotateRight.call(this, false);
                }

                else if (this.Racket.player == 'playerOne' && this.location == 'left' && !this.Racket.keyEvents.right ||
                    this.Racket.player == 'playerTwo' && this.location == 'right' && !this.Racket.keyEvents.left
                ) {
                    rotateLeft.call(this, false);
                }

                this.sprite.update(dt, this.position);
            };

            RacketEngine.prototype.render = function () {

                ctx.save();

                if (this.Racket.player == 'playerOne' || this.Racket.player == 'playerTwo') {

                    ctx.translate(this.position.x + this.width / 2, this.position.y + this.height / 2);

                    ctx.rotate(this.angle * Math.PI / 180);

                    ctx.translate(-this.position.x - this.width / 2, -this.position.y - this.height / 2);

                }

                this.sprite.render();


                ctx.restore();

            };


            return RacketEngine;

        })();

        var Sprite = (function () {
            function Sprite(image, position, positionImage, positionSprite, size, sizeOutputImage, speed, frames, dir, once) {
                this.image = image;


                this.dt = 0;
                this.position = position;
                this.positionImage = positionImage || [0, 0];
                this.positionSprite = positionSprite || [0, 0];
                this.size = size;
                this.sizeOutputImage = sizeOutputImage;
                this.speed = speed;
                this.frames = frames;
                this.dir = dir || 'horizontal';
                this.once = once;

                this.index = 0;
                this.frame = 0;

            }

            Sprite.prototype.update = function (dt, position, sizeOutputImage) {
                this.dt = dt;
                this.position = position;
                this.sizeOutputImage = sizeOutputImage || this.sizeOutputImage;
                this.index += this.speed * this.dt;

                if (this.speed > 0) {

                    var max = this.frames.length;

                    var idx = Math.floor(this.index);

                    this.frame = this.frames[idx % max];

                    if (this.once && idx > max) {

                        this.done = true;

                        return;

                    }

                }
                else {
                    this.frame = 0;
                }

                this.x = this.positionSprite[0];
                this.y = this.positionSprite[1];

                if (this.dir == 'vertical') {
                    this.y += this.frame * this.size[1];
                }
                else {
                    this.x += this.frame * this.size[0];
                }

            };

            Sprite.prototype.render = function () {

                ctx.drawImage(this.image,
                    this.x, this.y,
                    this.size[0], this.size[1],
                    this.position.x + this.positionImage[0], this.position.y + this.positionImage[1],
                    this.sizeOutputImage[0], this.sizeOutputImage[1]);

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

    }($)
);