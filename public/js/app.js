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
                    imageArray: ['../img/racket.png', '../img/racket-1.png', '../img/engine.png', '../img/engine-1.png', '../img/test.png'],
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
                ctx.fillStyle = '#fff';

                var i,
                    entityLength = this.renderEntity.length;

                for (var i = 0; i < entityLength; i++) {
                    this.renderEntity[i]();
                }

                ctx.beginPath();
                ctx.fillStyle = '#fff';
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
            var testImage;

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
                    this.sprite = new Sprite(this.App.imageLoader.get('../img/racket-1.png'), this.position, [0, 0], [600, 130], [250, 56], 25, [0, 1, 2, 1, 0, 3, 4, 5, 4, 3], 'vertical');
                }
                else if (player === 'playerTwo') {
                    this.sprite = new Sprite(this.App.imageLoader.get('../img/racket.png'), this.position, [0, 0], [600, 130], [250, 56], 25, [0, 1, 2, 1, 0, 3, 4, 5, 4, 3], 'vertical');
                }

                this.App.updateEntity.push(this.update.bind(this));
                this.App.renderEntity.push(this.render.bind(this));

                testImage = this.App.imageLoader.get('../img/test.png');

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

                /*ctx.drawImage(testImage,
                    0, 0,
                    600, 130,
                    this.position.x, this.position.y,
                    250, 56);*/


                this.engine.left.render();
                this.engine.right.render();
                this.sprite.render();


            };

            return Racket;

        })();

        var RacketEngine = (function () {

            function RacketEngine(Racket, location) {

                this.MAX_ROTATE_ANGLE = 45;

                this.Racket = Racket;
                this.location = location;
                this.speedRotate = 400;
                this.width = 49;
                this.height = 33;
                this.angle = 0;
                this.position = undefined;
                this.sprite = undefined;


                if (this.Racket.player == 'playerOne') {
                    if (this.location == 'left') {
                        this.sprite = new Sprite(this.Racket.App.imageLoader.get('../img/engine.png'), this.position, [4, 2], [116, 80], [49, 33], 1, [0], 'vertical');
                    }
                    else if (this.location == 'right') {

                        this.sprite = new Sprite(this.Racket.App.imageLoader.get('../img/engine-1.png'), this.position, [-4, 2], [116, 80], [49, 33], 1, [0], 'vertical');
                    }
                }

                if (this.Racket.player == 'playerTwo') {
                    if (this.location == 'left') {
                        this.sprite = new Sprite(this.Racket.App.imageLoader.get('../img/engine.png'), this.position, [0, 30], [116, 80], [49, 33], 1, [0], 'vertical');
                    }
                    else if (this.location == 'right') {
                        this.sprite = new Sprite(this.Racket.App.imageLoader.get('../img/engine-1.png'), this.position, [4, 2], [116, 80], [49, 33], 1, [0], 'vertical');
                    }
                }

            }

            RacketEngine.prototype.update = function (dt) {

                if (this.Racket.player == 'playerOne') {
                    if (this.location == 'left') {

                        this.position = {
                            x: this.Racket.position.x,
                            y: this.Racket.position.y
                        };

                        if (this.Racket.keyEvents.right) {
                            if (this.angle > -this.MAX_ROTATE_ANGLE) {
                                this.angle -= this.speedRotate * this.Racket.App.dt;
                            }
                            else {
                                this.angle = -this.MAX_ROTATE_ANGLE;
                            }

                        }
                        else if (!this.Racket.keyEvents.right) {
                            if (this.angle < 0) {
                                this.angle += this.speedRotate * this.Racket.App.dt;
                            }
                            else {
                                this.angle = 0;
                            }

                        }

                    }
                    else if (this.location == 'right') {

                        this.position = {

                            x: this.Racket.position.x + this.Racket.width - this.width,
                            y: this.Racket.position.y

                        };

                        if (this.Racket.keyEvents.left) {
                            if (this.angle < this.MAX_ROTATE_ANGLE) {
                                this.angle += this.speedRotate * this.Racket.App.dt;
                            }
                            else {
                                this.angle = this.MAX_ROTATE_ANGLE;
                            }

                        }
                        else if (!this.Racket.keyEvents.left) {
                            if (this.angle > 0) {
                                this.angle -= this.speedRotate * this.Racket.App.dt;
                            }

                            else {
                                this.angle = 0;
                            }
                        }


                    }
                }
                else {
                    this.position = this.Racket.position;
                }
                this.sprite.update(dt, this.position);
            };

            RacketEngine.prototype.render = function () {

                ctx.save();

                if (this.Racket.player == 'playerOne') {

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
            function Sprite(image, position, positionImage, size, sizeOutputImage, speed, frames, dir, once) {
                this.image = image;


                this.dt = 0;
                this.position = position;
                this.positionImage = positionImage || [0, 0];
                this.size = size;
                this.sizeOutputImage = sizeOutputImage;
                this.speed = speed;
                this.frames = frames;
                this.dir = dir || 'horizontal';
                this.once = once;

                this.index = 0;
                this.frame = 0;
                this.x = 0;
                this.y = 0;

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

                this.x = 0;
                this.y = 0;

                if (this.dir = 'vertical') {
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