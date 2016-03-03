var timer = require('animitter');

var rooms = {};
// this.id **session id
// io.sockets.adapter.rooms  **rooms list

timer(function (deltaTime, elapsedTime, frameCount) {

    for (var key in rooms) {
        rooms[key].tennis.loop(deltaTime);
    }

}).start();


exports.initGame = function (serverIo, socket) {
    var io, serverSocket, ioRooms;


    io = serverIo;
    serverSocket = socket;

    ioRooms = io.sockets.adapter.rooms;

    serverSocket.emit('test', Date.now());

    serverSocket.emit('connected');
    serverSocket.on('createRoom', createRoom);
    serverSocket.on('joinRoom', joinRoom);
    serverSocket.on('keyEvents', keyEvents);
    serverSocket.on('disconnect', disconnect);


    function createRoom(data) {


        // if room does not exist - create room from id data
        if (rooms[data] === undefined) {

            //if the client is already in the room
            for (var key in this.rooms) {

                if (key !== this.id) {
                    console.log('Вы уже находитесь в комнате');

                    return false
                }

            }

            rooms[data] = {};

            rooms[data].tennis = new Tennis(data);

            this.myRoom = data;

            rooms[data].tennis.entity.playerOne.id = this.id;

            serverSocket.emit('playerOneConnect');

            serverSocket.join(data);


        }

        // if the room already exists
        else {

            console.log(data + ' уже существует введите другое имя');

        }
    }

    function joinRoom(data) {

        //if the client is already in the room
        for (var key in this.rooms) {

            if (key !== this.id) {
                console.log('Вы уже находитесь в комнате');

                return false
            }

        }

        //if data id from in rooms list there join room
        if (ioRooms[data] !== undefined && ioRooms[data].length < 2) {

            this.join(data);

            if (rooms[data].tennis.entity.playerOne.id == undefined) {

                rooms[data].tennis.entity.playerOne.id = this.id;

                serverSocket.emit('playerOneConnect');

            }

            else if (rooms[data].tennis.entity.playerTwo.id == undefined) {

                rooms[data].tennis.entity.playerTwo.id = this.id;

                serverSocket.emit('playerTwoConnect');

            }

        }

        else {

            console.log(data + ' такой комнаты не существует');

        }


    }

    function keyEvents(data) {
        /*for (var key in this.adapter.rooms) {
         if (key !== this.id) {
         var roomTennis = rooms[key].tennis;
         if (roomTennis.entity.playerOne.id === this.id) {
         console.log('playerTwo');
         roomTennis.entity.playerOne.control = data
         }
         else if (roomTennis.entity.playerTwo.id === this.id) {
         //console.log('playerTwo');
         roomTennis.entity.playerTwo.control = data
         }
         }
         }*/

        for (var key in rooms) {
            if (io.sockets.adapter.rooms[key].sockets[this.id]) {
                var roomTennis = rooms[key].tennis;
                if (roomTennis.entity.playerOne.id === this.id) {
                    roomTennis.entity.playerOne.control = data
                }
                else if (roomTennis.entity.playerTwo.id === this.id) {
                    roomTennis.entity.playerTwo.control = data
                }
            }
        }
    }

    function disconnect() {
        if (this.myRoom !== undefined) {

            if (!io.sockets.adapter.rooms[this.myRoom]) {
                delete rooms[this.myRoom];
            }

            else if (rooms[this.myRoom].tennis.entity.playerOne.id == this.id) {
                rooms[this.myRoom].tennis.entity.playerOne.id = undefined;
            }
            else if (rooms[this.myRoom].tennis.entity.playerTwo.id == this.id) {
                rooms[this.myRoom].tennis.entity.playerTwo.id = undefined;
            }

        }

    }

    var Tennis = (function () {


        function Tennis(data) {
            this.room = data;
            this.entity = {};
            this.dt = .016;
            this.keyEvents = {};
            this.init();

        }

        var Field = (function () {
            function Field(tennis) {
                this.tennis = tennis;
                //this.width = 1150;
                //this.height = 1080;
                this.width = 1920;
                this.height = 2160;

            }

            return Field;
        })();


        var Ball = (function () {
            function Ball(tennis) {
                this.tennis = tennis;
                this.speed = 500;
                this.size = 20;
                this.magicalNumber = 7;
                this.radius = this.size / 2;
                this.vector = {
                    x: this.speed,
                    y: this.speed
                };
                this.position = {
                    x: this.tennis.entity.field.width / 2,
                    y: this.tennis.entity.field.height / 2 - this.radius
                };


            }

            Ball.prototype.update = function () {

                this.position.x += this.vector.x * this.tennis.dt;
                this.position.y += this.vector.y * this.tennis.dt;

                // horizontal ball hit the wall
                if (this.position.x - this.radius < 0) {
                    this.vector.x = -this.vector.x;
                    this.position.x = this.radius;
                }

                if (this.position.x + this.radius > this.tennis.entity.field.width) {
                    this.vector.x = -this.vector.x;
                    this.position.x = this.tennis.entity.field.width - this.radius;
                }

                if (this.position.y - this.radius < 0) {
                    this.position.y = this.radius;
                    this.vector.y = -this.vector.y;
                }
                if (this.position.y + this.radius > this.tennis.entity.field.height) {
                    this.position.y = this.tennis.entity.field.height - this.radius;
                    this.vector.y = -this.vector.y;
                }

                //ball  hit the racket playerOne
                var racketHitPlayerOne = function () {

                    /* //the ball hit the left or right side of
                     if (
                     this.position.y >= this.tennis.entity.playerOne.position.y &&
                     this.position.y <= this.tennis.entity.playerOne.position.y + this.tennis.entity.playerOne.height

                     ) {

                     // the ball hit the left side of
                     if (
                     this.position.x + this.radius >= this.tennis.entity.playerOne.position.x &&
                     this.position.x <= this.tennis.entity.playerOne.position.x
                     ) {
                     this.vector.x = -this.speed;
                     this.position.x = this.tennis.entity.playerOne.position.x - this.radius;
                     //console.log('left rebro');
                     return false
                     }
                     if (
                     //the ball hit the right side of
                     this.position.x - this.radius <= this.tennis.entity.playerOne.position.x + this.tennis.entity.playerOne.width &&
                     this.position.x >= this.tennis.entity.playerOne.position.x + this.tennis.entity.playerOne.width
                     ) {
                     this.vector.x = this.speed;
                     this.position.x = this.tennis.entity.playerOne.position.x + this.tennis.entity.playerOne.width + this.radius;
                     //console.log('right rebro');
                     return false
                     }
                     }*/

                    //the lower bound of the center side
                    if (
                        this.position.y - this.radius <= this.tennis.entity.playerOne.position.y + this.tennis.entity.playerOne.height &&
                        this.position.y >= this.tennis.entity.playerOne.position.y + this.tennis.entity.playerOne.height - this.radius &&
                        this.position.x >= this.tennis.entity.playerOne.position.x + this.tennis.entity.playerOne.width / 2 - this.radius &&
                        this.position.x <= this.tennis.entity.playerOne.position.x + this.tennis.entity.playerOne.width / 2 + this.radius
                    ) {
                        this.position.y = this.tennis.entity.playerOne.position.y + this.tennis.entity.playerOne.height + this.radius;
                        this.vector.y = this.speed;
                        //console.log('center bottom');
                    }

                    // upper bound of the center side
                    else if (
                        this.position.y + this.radius >= this.tennis.entity.playerOne.position.y &&
                        this.position.y <= this.tennis.entity.playerOne.position.y + this.radius &&
                        this.position.x >= this.tennis.entity.playerOne.position.x + this.tennis.entity.playerOne.width / 2 - this.radius &&
                        this.position.x <= this.tennis.entity.playerOne.position.x + this.tennis.entity.playerOne.width / 2 + this.radius
                    ) {
                        this.position.y = this.tennis.entity.playerOne.position.y - this.radius;
                        this.vector.y = -this.speed;
                        // console.log('center top');
                    }


                    else {
                        var minAngle = 1,
                            maxAngle = 360,
                            stepAngle = 6,
                            i;

                        for (i = minAngle; i < maxAngle; i++) {

                            var angle = i * stepAngle / 180 * Math.PI;
                            var ballRadiusY = this.position.y - this.radius * Math.cos(angle);
                            var ballRadiusX = this.position.x + this.radius * Math.sin(angle);

                            // upper bound of the left or right side
                            if (
                                //++
                            ballRadiusY >= this.tennis.entity.playerOne.position.y &&
                            ballRadiusY <= this.tennis.entity.playerOne.position.y + this.radius
                            ) {
                                // upper bound of the left side
                                if (
                                    ballRadiusX >= this.tennis.entity.playerOne.position.x &&
                                    ballRadiusX <= this.tennis.entity.playerOne.position.x + this.tennis.entity.playerOne.width / 2 - this.radius
                                ) {

                                    this.vector.y = -this.speed;
                                    this.position.y = this.position.y + this.tennis.entity.playerOne.position.y - ballRadiusY;

                                    break;
                                }

                                // upper bound of the right side

                                if (
                                    ballRadiusX <= this.tennis.entity.playerOne.position.x + this.tennis.entity.playerOne.width &&
                                    ballRadiusX >= this.tennis.entity.playerOne.position.x + this.tennis.entity.playerOne.width - this.tennis.entity.playerOne.width / 2 + this.radius
                                ) {


                                    this.vector.y = -this.speed;
                                    this.position.y = this.position.y + this.tennis.entity.playerOne.position.y - ballRadiusY;

                                    break;
                                }

                            }

                            //the lower bound of the left or right side

                            if (
                                ballRadiusY <= this.tennis.entity.playerOne.position.y + this.tennis.entity.playerOne.height &&
                                ballRadiusY >= this.tennis.entity.playerOne.position.y + this.tennis.entity.playerOne.height - this.radius
                            ) {

                                //the lower bound of the left side

                                if (
                                    ballRadiusX >= this.tennis.entity.playerOne.position.x &&
                                    ballRadiusX <= this.tennis.entity.playerOne.position.x + this.tennis.entity.playerOne.width / 2 - this.radius
                                ) {
                                    this.position.y = this.position.y + this.tennis.entity.playerOne.position.y + this.tennis.entity.playerOne.height - ballRadiusY;
                                    this.vector.x = (this.position.x - (this.tennis.entity.playerOne.position.x + this.tennis.entity.playerOne.width / 2)) * this.magicalNumber;
                                    this.vector.y = this.speed;
                                    //console.log('left bottom');
                                    break;

                                }
                                //the lower bound of the right side
                                if (
                                    ballRadiusX <= this.tennis.entity.playerOne.position.x + this.tennis.entity.playerOne.width &&
                                    ballRadiusX >= this.tennis.entity.playerOne.position.x + this.tennis.entity.playerOne.width - this.tennis.entity.playerOne.width / 2 + this.radius
                                ) {
                                    this.position.y = this.position.y + this.tennis.entity.playerOne.position.y + this.tennis.entity.playerOne.height - ballRadiusY;
                                    this.vector.x = (this.position.x - (this.tennis.entity.playerOne.position.x + this.tennis.entity.playerOne.width / 2)) * this.magicalNumber;
                                    this.vector.y = this.speed;
                                    // console.log('right bottom');
                                    break;
                                }

                            }

                        }
                    }

                };

                //ball hit the racket playerTwo
                var racketHitPlayerTwo = function () {

                    /* //the ball hit the left or right side of
                     if (
                     this.position.y >= this.tennis.entity.playerTwo.position.y &&
                     this.position.y <= this.tennis.entity.playerTwo.position.y + this.tennis.entity.playerTwo.height

                     ) {

                     // the ball hit the left side of
                     if (
                     this.position.x + this.radius >= this.tennis.entity.playerTwo.position.x &&
                     this.position.x <= this.tennis.entity.playerTwo.position.x
                     ) {
                     this.vector.x = -this.speed;
                     this.position.x = this.tennis.entity.playerTwo.position.x - this.radius;
                     // console.log('left rebro');
                     return false
                     }
                     if (
                     //the ball hit the right side of
                     this.position.x - this.radius <= this.tennis.entity.playerTwo.position.x + this.tennis.entity.playerTwo.width &&
                     this.position.x >= this.tennis.entity.playerTwo.position.x + this.tennis.entity.playerTwo.width
                     ) {
                     this.vector.x = this.speed;
                     this.position.x = this.tennis.entity.playerTwo.position.x + this.tennis.entity.playerTwo.width + this.radius;
                     //console.log('right rebro');
                     return false
                     }
                     }*/

                    // upper bound of the center side
                    if (
                        this.position.y + this.radius >= this.tennis.entity.playerTwo.position.y &&
                        this.position.y <= this.tennis.entity.playerTwo.position.y + this.radius &&
                        this.position.x >= this.tennis.entity.playerTwo.position.x + this.tennis.entity.playerTwo.width / 2 - this.radius &&
                        this.position.x <= this.tennis.entity.playerTwo.position.x + this.tennis.entity.playerTwo.width / 2 + this.radius
                    ) {
                        this.position.y = this.tennis.entity.playerTwo.position.y - this.radius;
                        this.vector.y = -this.speed;
                        //console.log('center');
                    }

                    //the lower bound of the center side
                    else if (
                        this.position.y - this.radius <= this.tennis.entity.playerTwo.position.y + this.tennis.entity.playerTwo.height &&
                        this.position.y >= this.tennis.entity.playerTwo.position.y + this.tennis.entity.playerTwo.height + this.radius &&
                        this.position.x >= this.tennis.entity.playerTwo.position.x + this.tennis.entity.playerTwo.width / 2 - this.radius &&
                        this.position.x <= this.tennis.entity.playerTwo.position.x + this.tennis.entity.playerTwo.width / 2 + this.radius
                    ) {
                        this.position.y = this.tennis.entity.playerTwo.position.y + this.tennis.entity.playerTwo.height + this.radius;
                        this.vector.y = this.speed;
                        //console.log('center bottom');
                    }
                    else {
                        var minAngle = 1,
                            maxAngle = 360,
                            stepAngle = 6,
                            i;

                        for (i = minAngle; i < maxAngle; i++) {

                            var angle = i * stepAngle / 180 * Math.PI;
                            var ballRadiusY = this.position.y - this.radius * Math.cos(angle);
                            var ballRadiusX = this.position.x + this.radius * Math.sin(angle);

                            // upper bound of the  left or right side
                            if (
                                ballRadiusY >= this.tennis.entity.playerTwo.position.y &&
                                ballRadiusY <= this.tennis.entity.playerTwo.position.y + this.radius
                            ) {
                                // upper bound of the left side
                                if (
                                    ballRadiusX >= this.tennis.entity.playerTwo.position.x &&
                                    ballRadiusX <= this.tennis.entity.playerTwo.position.x + this.tennis.entity.playerTwo.width / 2 - this.radius
                                ) {
                                    this.vector.y = -this.speed;
                                    this.vector.x = (this.position.x - (this.tennis.entity.playerTwo.position.x + this.tennis.entity.playerTwo.width / 2)) * this.magicalNumber;
                                    this.position.y = this.position.y + this.tennis.entity.playerTwo.position.y - ballRadiusY;

                                    break;
                                }

                                // upper bound of the right side

                                if (
                                    ballRadiusX <= this.tennis.entity.playerTwo.position.x + this.tennis.entity.playerTwo.width &&
                                    ballRadiusX >= this.tennis.entity.playerTwo.position.x + this.tennis.entity.playerTwo.width - this.tennis.entity.playerTwo.width / 2 + this.radius
                                ) {

                                    this.vector.y = -this.speed;
                                    this.position.y = this.position.y + this.tennis.entity.playerTwo.position.y - ballRadiusY;
                                    this.vector.x = (this.position.x - (this.tennis.entity.playerTwo.position.x + this.tennis.entity.playerTwo.width / 2)) * this.magicalNumber;

                                    break;
                                }

                            }

                            //the lower bound of the left abd right side

                            if (
                                ballRadiusY <= this.tennis.entity.playerTwo.position.y + this.tennis.entity.playerTwo.height &&
                                ballRadiusY >= this.tennis.entity.playerTwo.position.y + this.tennis.entity.playerTwo.height - this.radius
                            ) {

                                //the lower bound of the left side

                                if (
                                    ballRadiusX >= this.tennis.entity.playerTwo.position.x &&
                                    ballRadiusX <= this.tennis.entity.playerTwo.position.x + this.tennis.entity.playerTwo.width / 2 - this.radius
                                ) {
                                    this.position.y = this.position.y + this.tennis.entity.playerTwo.position.y + this.tennis.entity.playerTwo.height - ballRadiusY;
                                    this.vector.y = this.speed;
                                    //console.log('left bottom');
                                    break;

                                }

                                // the lower bound of the right side

                                if (
                                    ballRadiusX <= this.tennis.entity.playerTwo.position.x + this.tennis.entity.playerTwo.width &&
                                    ballRadiusX >= this.tennis.entity.playerTwo.position.x + this.tennis.entity.playerTwo.width - this.tennis.entity.playerTwo.width / 2 + this.radius
                                ) {
                                    this.position.y = this.position.y + this.tennis.entity.playerTwo.position.y + this.tennis.entity.playerTwo.height - ballRadiusY;
                                    this.vector.y = this.speed;
                                    //console.log('right bottom');
                                    break;
                                }

                            }

                        }
                    }

                };


                if (this.position.y <= this.tennis.entity.field.height / 2) {
                    racketHitPlayerOne.call(this);
                }

                if (this.position.y >= this.tennis.entity.field.height / 2) {

                    racketHitPlayerTwo.call(this);
                }


            }
            ;

            return Ball;
        })();

        var Racket = (function () {

            function Racket(player, tennis) {
                this.tennis = tennis;
                this.id = undefined;
                this.width = 200;
                this.height = 44;
                this.speed = 10;
                this.offset = 70;

                this.position = {
                    x: 0,
                    y: 0
                };
                this.control = {
                    left: false,
                    right: false
                };
                if (player === 'playerOne') {
                    this.position.y = this.offset;
                }
                if (player === 'playerTwo') {
                    this.position.y = this.tennis.entity.field.height - this.height - this.offset;
                }
                if (player) {
                    this.position.x = this.tennis.entity.field.width / 2 - this.width / 2;
                }


            }

            Racket.prototype.update = function () {
                if (this.control.left) {
                    this.position.x -= this.speed;
                    if (this.position.x < 0) {
                        this.position.x = 0;
                        return false;
                    }
                }
                if (this.control.right) {
                    this.position.x += this.speed;
                    if (this.position.x + this.width > this.tennis.entity.field.width) {
                        this.position.x = this.tennis.entity.field.width - this.width;
                        return false;
                    }
                }
            };


            return Racket;

        })();

        Tennis.prototype.init = function () {
            this.createEntity();
            this.loop();
        };

        Tennis.prototype.createEntity = function () {
            this.entity.field = new Field(this);
            this.entity.ball = new Ball(this);
            this.entity.playerOne = new Racket('playerOne', this);
            this.entity.playerTwo = new Racket('playerTwo', this);
        };
        Tennis.prototype.update = function () {
            this.entity.ball.update();
            this.entity.playerOne.update();
            this.entity.playerTwo.update();
        };
        Tennis.prototype.emitData = function () {
            var entityPos = {
                ball: {
                    radius: this.entity.ball.radius,
                    position: this.entity.ball.position
                },
                playerOne: {
                    width: this.entity.playerOne.width,
                    height: this.entity.playerOne.height,
                    position: this.entity.playerOne.position
                },
                playerTwo: {
                    width: this.entity.playerTwo.width,
                    height: this.entity.playerTwo.height,
                    position: this.entity.playerTwo.position
                }
            };

            io.to(this.room).emit('entity', JSON.stringify(entityPos));

        };
        Tennis.prototype.loop = function (deltaTime) {

            if (deltaTime) {
                this.dt = deltaTime / 1000;
            }
            this.update();
            this.emitData();

        };


        return Tennis;
    })();

};





