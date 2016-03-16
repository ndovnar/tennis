;
jQuery(function ($) {

        var touchtime = 0;



        var canvas, ctx;
        canvas = $('<canvas>', {'id': 'tennis'}).attr({width: 1600, height: 1080});
        ctx = $(canvas).get(0).getContext('2d');


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
                this.socket.on('playerConnect', this.playerConnect.bind(this));
                this.socket.on('giveRoomsList', this.giveRoomsList.bind(this));
                this.socket.on('updateNickName', this.updateNickName.bind(this));
                this.socket.on('updateScore', this.updateScore.bind(this));
            };

            ClientIo.prototype.onConnected = function () {

            };

            ClientIo.prototype.createRoom = function (data) {
                this.socket.emit('createRoom', data);
            };
            ClientIo.prototype.joinRoom = function (data) {
                this.socket.emit('joinRoom', data);
            };

            ClientIo.prototype.emitKeyEvents = function (data) {
                this.socket.emit('keyEvents', data);
            };

            ClientIo.prototype.playerOneConnect = function () {
                $(canvas).addClass('rotate');
                app.player = 'playerOne';
            };
            ClientIo.prototype.playerTwoConnect = function () {
                $(canvas).removeClass('rotate');
                app.player = 'playerTwo';

            };
            ClientIo.prototype.playerConnect = function (data) {
                app.gameState = true;
                window.location.hash = data;
            };

            ClientIo.prototype.updateNickName = function (data) {
                app.nickName = data;
            };

            ClientIo.prototype.leave = function () {
                app.gameState = false;
                this.socket.emit('leaveRoom');
            };

            ClientIo.prototype.entity = function (data) {
                app.entity = JSON.parse(data);
            };

            ClientIo.prototype.getRoomsList = function () {
                this.socket.emit('getRoomsList');
            };

            ClientIo.prototype.giveRoomsList = function (data) {
                app.roomsList = data;
                app.updateRoomList();
            };

            ClientIo.prototype.updateScore = function (data) {
                app.score = data;
                app.updateScore();
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
                this.score = [0, 0];
                this.entity = undefined;
                this.dt = undefined;
                this.player = undefined;
                this.nickName = undefined;
                this.gameState = false;
                this.pageState = undefined;

                this.roomsList = [];

                this.renderEntity = [];
                this.updateEntity = [];


                this.lastTime = 0;

            }

            App.prototype.init = function () {
                this.changeAppState();
                this.bindEvents();
                this.nickName = undefined;

                this.imageLoader = new ImageLoader({
                    imageArray: ['../img/game-sprites.png'],
                    callbacks: [this.createEntity.bind(this)]
                });

            };


            App.prototype.bindEvents = function () {
                $(document).on('click', '#NewGame', this.newGame);
                $(document).on('click', '#JoinGame', this.joinGame);
                $(document).on('click', '.game-list tbody tr', this.selectionGame);
                $(window).on('hashchange', this.changeAppState.bind(this));
            };

            App.prototype.doubleClick = function () {
                if (touchtime == 0) {
                    //set first click
                    touchtime = new Date().getTime();
                } else {
                    //compare first click to this click and see if they occurred within double click threshold
                    if (((new Date().getTime()) - touchtime) < 800) {
                        //double click occurred
                        keyEvents.space = true;

                        setTimeout(function () {
                            keyEvents.space = false;
                        }, 100);

                        touchtime = 0;
                    } else {
                        //not a double click so set as a new first click
                        touchtime = new Date().getTime();
                    }
                }
            };

            App.prototype.selectionGame = function (e) {
                $('.game-list tbody tr').removeClass('selected');
                $(this).toggleClass('selected');
            };

            App.prototype.bindGameEvents = function () {
                $(window).bind('blur', this.keySet);
                $(document).bind('keydown', this.keySet);
                $(document).bind('keyup', this.keySet);
                $(document).bind('touchstart', this.keySet);
                $(document).bind('touchstart', this.doubleClick);
                $(document).bind('touchend', this.keySet);

            };

            App.prototype.unbindGameEvents = function () {
                $(window).unbind('blur', this.keySet);
                $(document).unbind('keydown', this.keySet);
                $(document).unbind('touchstart', this.keySet);
                $(document).unbind('touchstart', this.doubleClick);
                $(document).unbind('touchend', this.keySet);
            };

            App.prototype.createEntity = function () {
                this.ball = new Ball(this);

                this.playerOne = new Racket(this, 'playerOne');

                this.playerTwo = new Racket(this, 'playerTwo');
            };

            App.prototype.changeAppState = function () {

                var updateAppState = function (state) {


                    $('.main-page').removeClass('remove-animation').addClass('add-animation');

                    var url = state;
                    var pageHtml = '';
                    var callback = undefined;

                    if (state.indexOf('Game') != 0) {
                        clientIo.leave();
                        this.unbindGameEvents();
                    }
                    else if (state.slice(0, 4) == 'Game') {
                        state = 'Game';
                    }


                    switch (state) {
                        case 'Home':
                            pageHtml =
                                '<div class="container center">' +
                                '<nav> ' +
                                '<div class="nav-container"> ' +
                                '<ul> ' +
                                '<li><a class="link blue" href="#New_Game">New Game</a></li> ' +
                                '<li><a class="link orange" href="#Join_Game">Join Game</a></li> ' +
                                '</ul> ' +
                                '</div> ' +
                                '</nav>' +
                                '</div>';
                            break;
                        case 'New_Game':
                            pageHtml =
                                '<div class="container center">' +
                                '<div class="new-game">' +
                                '<form>' +
                                '<input type="text" name="nickName" placeholder="Your Nick Name"  autocomplete="off">' +
                                '<input type="text" name="gameName" placeholder="Game Name"  autocomplete="off">' +
                                '</form>' +

                                '<a id="NewGame" href="#" class="link blue">Create Game</a>' +
                                '</div>' +
                                '</div>';

                            break;
                        case 'Join_Game':

                            callback = clientIo.getRoomsList.bind(clientIo);
                            pageHtml = '<div class="container center"></div>';


                            break;
                        case 'Game':


                            if (!this.gameState) {
                                window.location.hash = 'Home';
                                return;
                            }


                            pageHtml = '<div class="touch-control"><div class="left"></div><div class="right"></div></div>' +
                                '<div class="score">Player-1 - 10 : Player-1 - 10</div>' +
                                '<div class="tennis-box"></div>';
                            callback = function () {

                                $('.tennis-box').append(canvas);

                                this.updateScore();
                                this.bindGameEvents();
                                this.loop();

                            }.bind(this);
                            break;


                        default :
                            pageHtml = '<div class="container center"> page ' + '"' + state + '"' + ' not found</div>';

                    }


                    window.location.hash = url;
                    this.pageState = url;


                    $('.main-page.add-animation').one("transitionend webkitTransitionEnd oTransitio+nEnd MSTransitionEnd", function (e) {

                        if ($('.main-page').attr('class').indexOf('add-animation') >= 0) {

                            if (callback != undefined) {
                                $('.main-page').html(pageHtml).promise().done(function () {
                                    callback();
                                });

                            }
                            else {
                                $('.main-page').html(pageHtml);
                            }
                        }


                        $('.main-page').removeClass('add-animation').addClass('remove-animation');


                    }).children().on("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function (e) {
                        e.stopPropagation();
                    });


                };

                var urlHash = window.location.hash.substr(1);

                if (urlHash != '') {
                    updateAppState.call(this, urlHash);
                }
                else {
                    updateAppState.call(this, 'Home');
                }

            };

            App.prototype.updateScore = function () {
                if (this.pageState.slice(0, 4) != 'Game') {
                    return;
                }
                var scoreHtml = '<div class="playerOne">' + this.nickName[0] + ' : ' + this.score[0] + '</div>' +
                    '<div class="playerTwo">' + this.nickName[1] + ' : ' + this.score[1] + '</div>';
                $('.score').html(scoreHtml);
            };

            App.prototype.newGame = function (e) {
                e.preventDefault();
                var nickName = $('.new-game input[name="nickName"]').val();
                var gameName = $('.new-game input[name="gameName"]').val();


                clientIo.createRoom({nickName: nickName, gameName: gameName});
            };

            App.prototype.joinGame = function (e) {
                e.preventDefault();
                if (!$('tr').hasClass('selected')) {
                    return;
                }

                var gameName = $('tr.selected .game-name').text();
                var nickName = $('input[name="nickName"]').val();


                clientIo.joinRoom({gameName: gameName, nickName: nickName});

            };

            App.prototype.updateRoomList = function () {
                if (this.pageState != 'Join_Game') {
                    return;
                }

                var listRoomHtml =
                    '<div class="game-list">' +
                    '<table>' +
                    '<thead>' +
                    '<tr><td>Game Name</td><td>Players</td></tr>' +
                    '</thead>' +
                    '<tbody>';


                for (var key in this.roomsList) {
                    listRoomHtml += '<tr><td class="game-name">' + this.roomsList[key].roomName + '</td>' + '<td class="players-room">' + this.roomsList[key].players + '<span>/2</span></td></tr>'
                }
                listRoomHtml += '</tbody></table><input type="text" name="nickName" autocomplete="off" placeholder="Your Nick Name"><a id="JoinGame" href="#" class="link blue small">Connected</a></div></div>';

                $('.container').html(listRoomHtml);


            };

            App.prototype.keySet = function (e) {
                var key, state;

                if (e.type === 'blur') {

                    for (var key in keyEvents) {
                        keyEvents[key] = false
                    }

                    clientIo.emitKeyEvents(keyEvents);

                    return false;
                }

                if (e.type === 'touchstart' || e.type === 'touchend') {

                    var targetClass = $(e.target).attr('class');

                    state = false;
                    if (e.type === 'touchstart') {
                        state = true;
                    }

                    if (targetClass == 'left') {
                        key = 37;
                    }
                    if (targetClass == 'right') {
                        key = 39;
                    }


                }

                else {
                    key = e.keyCode;
                    state = (e.type == 'keydown') ? true : false;
                }


                if (key == 37 || key == 39 || key == 32) {

                    if (e.preventDefault) {
                        e.preventDefault();
                    }

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

                this.MAX_ROTATE_ANGLE = 70;

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

        $(window).load(function () {
            app.init();
        });

    }($)
);