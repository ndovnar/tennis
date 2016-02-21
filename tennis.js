var io, serverSocket;
var timer = require('animitter');


// this.id **session id
// io.sockets.adapter.rooms  **rooms list


exports.initGame = function (serverIo, socket) {

    io = serverIo;
    serverSocket = socket;


    serverSocket.emit('connected');
    serverSocket.on('createRoom', createRoom);
    serverSocket.on('joinRoom',joinRoom);
    serverSocket.on('keyEvents', function (data) {
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


    });

    serverSocket.on('disconnect', function () {

        if (this.myRoom !== undefined) {
            if (rooms[this.myRoom].tennis.entity.playerOne.id == this.id) {
                rooms[this.myRoom].tennis.entity.playerOne.id = undefined;
            }
            else if (rooms[this.myRoom].tennis.entity.playerTwo.id == this.id) {
                rooms[this.myRoom].tennis.entity.playerTwo.id = undefined;
            }
        }
    });


};

var rooms = [];

timer(function (deltaTime, elapsedTime, frameCount) {

    //rooms[data].tennis.loop(deltaTime);

}).start();

function createRoom(data) {


    // if room does not exist - create room from id data
    if (rooms[data] === undefined) {
        rooms[data] = {};
        rooms[data].tennis = new Tennis(data);
        this.myRoom = data;


        rooms[data].tennis.entity.playerOne.id = this.id;


        serverSocket.join(data);

    }

    else {

        //************ test
/*
        this.join(data);
        this.myRoom = data;
        if (rooms[data].tennis.entity.playerOne.id == undefined) {
            rooms[data].tennis.entity.playerOne.id = this.id;
        }
        else if (rooms[data].tennis.entity.playerTwo.id == undefined) {
            rooms[data].tennis.entity.playerTwo.id = this.id;
        }*/

        //************* /test

        //console.log(data + ' уже существует введите другое имя');

    }
}

function joinRoom(data, self) {
    // all rooms list
    var roomsIo = io.sockets.adapter.rooms;

    //if data id from in rooms list there join room
    if (roomsIo[data] !== undefined && roomsIo[data].length < 2) {

        this.join(data);
        if (rooms[data].tennis.entity.playerOne.id == undefined) {
            rooms[data].tennis.entity.playerOne.id = this.id;
        }
        else if (rooms[data].tennis.entity.playerTwo.id == undefined) {
            rooms[data].tennis.entity.playerTwo.id = this.id;
        }
    }

    else {
        console.log(data + ' такой комнаты не существует');
    }


}

var Tennis = (function () {
    var dt = 0.016,
        lastTime,
        entity,
        keyEvents;

    entity = {};
    keyEvents = {};

    function Tennis(data) {
        this.room = data;
        this.entity = {};
        this.keyEvents = {};
        this.init();

    }

    var Field = (function () {
        function Field() {
            this.width = 1150;
            this.height = 1080;
        }

        return Field;
    })();


    var Ball = (function () {
        function Ball() {
            this.speed = 500;
            this.size = 20;
            this.magicalNumber = 10;
            this.radius = this.size / 2;
            this.vector = {
                x: this.speed,
                y: this.speed
            };
            this.position = {
                x: entity.field.width / 2,
                y: entity.field.height / 2 - this.radius
            };


        }

        Ball.prototype.update = function () {

            this.position.x += this.vector.x * dt;
            this.position.y += this.vector.y * dt;

            // horizontal ball hit the wall
            if (this.position.x - this.radius < 0) {
                this.vector.x = -this.vector.x;
                this.position.x = this.radius;
            }

            if (this.position.x + this.radius > entity.field.width) {
                this.vector.x = -this.vector.x;
                this.position.x = entity.field.width - this.radius;
            }

            if (this.position.y - this.radius < 0) {
                this.position.y = this.radius;
                this.vector.y = -this.vector.y;
            }
            if (this.position.y + this.radius > entity.field.height) {
                this.position.y = entity.field.height - this.radius;
                this.vector.y = -this.vector.y;
            }

            //ball  hit the racket playerOne
            var racketHitPlayerOne = function () {

                //the ball hit the left or right side of
                if (
                    this.position.y >= entity.playerOne.position.y &&
                    this.position.y <= entity.playerOne.position.y + entity.playerOne.height

                ) {

                    // the ball hit the left side of
                    if (
                        this.position.x + this.radius >= entity.playerOne.position.x &&
                        this.position.x <= entity.playerOne.position.x
                    ) {
                        this.vector.x = -this.speed;
                        this.position.x = entity.playerOne.position.x - this.radius;
                        //console.log('left rebro');
                        return false
                    }
                    if (
                        //the ball hit the right side of
                    this.position.x - this.radius <= entity.playerOne.position.x + entity.playerOne.width &&
                    this.position.x >= entity.playerOne.position.x + entity.playerOne.width
                    ) {
                        this.vector.x = this.speed;
                        this.position.x = entity.playerOne.position.x + entity.playerOne.width + this.radius;
                        //console.log('right rebro');
                        return false
                    }
                }

                //the lower bound of the center side
                if (
                    this.position.y - this.radius <= entity.playerOne.position.y + entity.playerOne.height &&
                    this.position.y >= entity.playerOne.position.y + entity.playerOne.height - this.radius &&
                    this.position.x >= entity.playerOne.position.x + entity.playerOne.width / 2 - this.radius &&
                    this.position.x <= entity.playerOne.position.x + entity.playerOne.width / 2 + this.radius
                ) {
                    this.position.y = entity.playerOne.position.y + entity.playerOne.height + this.radius;
                    this.vector.y = this.speed;
                    //console.log('center bottom');
                }

                // upper bound of the center side
                else if (
                    this.position.y + this.radius >= entity.playerOne.position.y &&
                    this.position.y <= entity.playerOne.position.y + this.radius &&
                    this.position.x >= entity.playerOne.position.x + entity.playerOne.width / 2 - this.radius &&
                    this.position.x <= entity.playerOne.position.x + entity.playerOne.width / 2 + this.radius
                ) {
                    this.position.y = entity.playerOne.position.y - this.radius;
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
                        ballRadiusY >= entity.playerOne.position.y &&
                        ballRadiusY <= entity.playerOne.position.y + this.radius
                        ) {
                            // upper bound of the left side
                            if (
                                ballRadiusX >= entity.playerOne.position.x &&
                                ballRadiusX <= entity.playerOne.position.x + entity.playerOne.width / 2 - this.radius
                            ) {

                                this.vector.y = -this.speed;
                                this.position.y = this.position.y + entity.playerOne.position.y - ballRadiusY;

                                break;
                            }

                            // upper bound of the right side

                            if (
                                ballRadiusX <= entity.playerOne.position.x + entity.playerOne.width &&
                                ballRadiusX >= entity.playerOne.position.x + entity.playerOne.width - entity.playerOne.width / 2 + this.radius
                            ) {


                                this.vector.y = -this.speed;
                                this.position.y = this.position.y + entity.playerOne.position.y - ballRadiusY;

                                break;
                            }

                        }

                        //the lower bound of the left or right side

                        if (
                            ballRadiusY <= entity.playerOne.position.y + entity.playerOne.height &&
                            ballRadiusY >= entity.playerOne.position.y + entity.playerOne.height - this.radius
                        ) {

                            //the lower bound of the left side

                            if (
                                ballRadiusX >= entity.playerOne.position.x &&
                                ballRadiusX <= entity.playerOne.position.x + entity.playerOne.width / 2 - this.radius
                            ) {
                                this.position.y = this.position.y + entity.playerOne.position.y + entity.playerOne.height - ballRadiusY;
                                this.vector.x = (this.position.x - (entity.playerOne.position.x + entity.playerOne.width / 2)) * this.magicalNumber;
                                this.vector.y = this.speed;
                                //console.log('left bottom');
                                break;

                            }
                            //the lower bound of the right side
                            if (
                                ballRadiusX <= entity.playerOne.position.x + entity.playerOne.width &&
                                ballRadiusX >= entity.playerOne.position.x + entity.playerOne.width - entity.playerOne.width / 2 + this.radius
                            ) {
                                this.position.y = this.position.y + entity.playerOne.position.y + entity.playerOne.height - ballRadiusY;
                                this.vector.x = (this.position.x - (entity.playerOne.position.x + entity.playerOne.width / 2)) * this.magicalNumber;
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

                //the ball hit the left or right side of
                if (
                    this.position.y >= entity.playerTwo.position.y &&
                    this.position.y <= entity.playerTwo.position.y + entity.playerTwo.height

                ) {

                    // the ball hit the left side of
                    if (
                        this.position.x + this.radius >= entity.playerTwo.position.x &&
                        this.position.x <= entity.playerTwo.position.x
                    ) {
                        this.vector.x = -this.speed;
                        this.position.x = entity.playerTwo.position.x - this.radius;
                        // console.log('left rebro');
                        return false
                    }
                    if (
                        //the ball hit the right side of
                    this.position.x - this.radius <= entity.playerTwo.position.x + entity.playerTwo.width &&
                    this.position.x >= entity.playerTwo.position.x + entity.playerTwo.width
                    ) {
                        this.vector.x = this.speed;
                        this.position.x = entity.playerTwo.position.x + entity.playerTwo.width + this.radius;
                        //console.log('right rebro');
                        return false
                    }
                }

                // upper bound of the center side
                if (
                    this.position.y + this.radius >= entity.playerTwo.position.y &&
                    this.position.y <= entity.playerTwo.position.y + this.radius &&
                    this.position.x >= entity.playerTwo.position.x + entity.playerTwo.width / 2 - this.radius &&
                    this.position.x <= entity.playerTwo.position.x + entity.playerTwo.width / 2 + this.radius
                ) {
                    this.position.y = entity.playerTwo.position.y - this.radius;
                    this.vector.y = -this.speed;
                    //console.log('center');
                }

                //the lower bound of the center side
                else if (
                    this.position.y - this.radius <= entity.playerTwo.position.y + entity.playerTwo.height &&
                    this.position.y >= entity.playerTwo.position.y + entity.playerTwo.height + this.radius &&
                    this.position.x >= entity.playerTwo.position.x + entity.playerTwo.width / 2 - this.radius &&
                    this.position.x <= entity.playerTwo.position.x + entity.playerTwo.width / 2 + this.radius
                ) {
                    this.position.y = entity.playerTwo.position.y + entity.playerTwo.height + this.radius;
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
                            ballRadiusY >= entity.playerTwo.position.y &&
                            ballRadiusY <= entity.playerTwo.position.y + this.radius
                        ) {
                            // upper bound of the left side
                            if (
                                ballRadiusX >= entity.playerTwo.position.x &&
                                ballRadiusX <= entity.playerTwo.position.x + entity.playerTwo.width / 2 - this.radius
                            ) {
                                this.vector.y = -this.speed;
                                this.vector.x = (this.position.x - (entity.playerTwo.position.x + entity.playerTwo.width / 2))*this.magicalNumber;
                                this.position.y = this.position.y + entity.playerTwo.position.y - ballRadiusY;

                                break;
                            }

                            // upper bound of the right side

                            if (
                                ballRadiusX <= entity.playerTwo.position.x + entity.playerTwo.width &&
                                ballRadiusX >= entity.playerTwo.position.x + entity.playerTwo.width - entity.playerTwo.width / 2 + this.radius
                            ) {

                                this.vector.y = -this.speed;
                                this.position.y = this.position.y + entity.playerTwo.position.y - ballRadiusY;
                                this.vector.x = (this.position.x - (entity.playerTwo.position.x + entity.playerTwo.width / 2))*this.magicalNumber;

                                break;
                            }

                        }

                        //the lower bound of the left abd right side

                        if (
                            ballRadiusY <= entity.playerTwo.position.y + entity.playerTwo.height &&
                            ballRadiusY >= entity.playerTwo.position.y + entity.playerTwo.height - this.radius
                        ) {

                            //the lower bound of the left side

                            if (
                                ballRadiusX >= entity.playerTwo.position.x &&
                                ballRadiusX <= entity.playerTwo.position.x + entity.playerTwo.width / 2 - this.radius
                            ) {
                                this.position.y = this.position.y + entity.playerTwo.position.y + entity.playerTwo.height - ballRadiusY;
                                this.vector.y = this.speed;
                                //console.log('left bottom');
                                break;

                            }

                            // the lower bound of the right side

                            if (
                                ballRadiusX <= entity.playerTwo.position.x + entity.playerTwo.width &&
                                ballRadiusX >= entity.playerTwo.position.x + entity.playerTwo.width - entity.playerTwo.width / 2 + this.radius
                            ) {
                                this.position.y = this.position.y + entity.playerTwo.position.y + entity.playerTwo.height - ballRadiusY;
                                this.vector.y = this.speed;
                                //console.log('right bottom');
                                break;
                            }

                        }

                    }
                }

            };


            if (this.position.y <= entity.field.height / 2) {
                racketHitPlayerOne.call(this);
            }

            if (this.position.y >= entity.field.height / 2) {

                racketHitPlayerTwo.call(this);
            }


        }
        ;

        return Ball;
    })();

    var Racket = (function () {

        function Racket(player) {
            this.id = undefined;
            this.width = 150;
            this.height = 28;
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
                this.position.y = entity.field.height - this.height - this.offset;
            }
            if (player) {
                this.position.x = entity.field.width / 2 - this.width / 2;
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
                if (this.position.x + this.width > entity.field.width) {
                    this.position.x = entity.field.width - this.width;
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
        entity.field = new Field();
        entity.ball = new Ball();
        entity.playerOne = new Racket('playerOne');
        entity.playerTwo = new Racket('playerTwo');
    };
    Tennis.prototype.update = function () {
        entity.ball.update();
        entity.playerOne.update();
        entity.playerTwo.update();
    };
    Tennis.prototype.emitData = function () {
        io.to(this.room).emit('entity', entity);
    };
    Tennis.prototype.loop = function (deltaTime) {

        if (deltaTime) {
            dt = deltaTime / 1000;
        }
        this.update();
        this.entity = entity;

        this.emitData();
        var self = this;

        var timer = setTimeout(function () {
         self.loop();
         }, 1000 / 60);


        //timer();
    };


    return Tennis;
})();







































/*
var Tennis = (function () {
    var dt = 0.016,
        lastTime,
        entity,
        keyEvents;

    entity = {};
    keyEvents = {};

    function Tennis(data) {
        this.room = data;
        this.entity = {};
        this.keyEvents = {};
        this.init();

    }

    var Field = (function () {
        function Field() {
            this.width = 1150;
            this.height = 1080;
        }

        return Field;
    })();


    var Ball = (function () {
        function Ball() {
            this.speed = 500;
            this.size = 20;
            this.magicalNumber = 10;
            this.radius = this.size / 2;
            this.vector = {
                x: this.speed,
                y: this.speed
            };
            this.position = {
                x: entity.field.width / 2,
                y: entity.field.height / 2 - this.radius
            };


        }

        Ball.prototype.update = function () {

            this.position.x += this.vector.x * dt;
            this.position.y += this.vector.y * dt;

            // horizontal ball hit the wall
            if (this.position.x - this.radius < 0) {
                this.vector.x = -this.vector.x;
                this.position.x = this.radius;
            }

            if (this.position.x + this.radius > entity.field.width) {
                this.vector.x = -this.vector.x;
                this.position.x = entity.field.width - this.radius;
            }

            if (this.position.y - this.radius < 0) {
                this.position.y = this.radius;
                this.vector.y = -this.vector.y;
            }
            if (this.position.y + this.radius > entity.field.height) {
                this.position.y = entity.field.height - this.radius;
                this.vector.y = -this.vector.y;
            }

            //ball  hit the racket playerOne
            var racketHitPlayerOne = function () {

                //the ball hit the left or right side of
                if (
                    this.position.y >= entity.playerOne.position.y &&
                    this.position.y <= entity.playerOne.position.y + entity.playerOne.height

                ) {

                    // the ball hit the left side of
                    if (
                        this.position.x + this.radius >= entity.playerOne.position.x &&
                        this.position.x <= entity.playerOne.position.x
                    ) {
                        this.vector.x = -this.speed;
                        this.position.x = entity.playerOne.position.x - this.radius;
                        //console.log('left rebro');
                        return false
                    }
                    if (
                        //the ball hit the right side of
                    this.position.x - this.radius <= entity.playerOne.position.x + entity.playerOne.width &&
                    this.position.x >= entity.playerOne.position.x + entity.playerOne.width
                    ) {
                        this.vector.x = this.speed;
                        this.position.x = entity.playerOne.position.x + entity.playerOne.width + this.radius;
                        //console.log('right rebro');
                        return false
                    }
                }

                //the lower bound of the center side
                if (
                    this.position.y - this.radius <= entity.playerOne.position.y + entity.playerOne.height &&
                    this.position.y >= entity.playerOne.position.y + entity.playerOne.height - this.radius &&
                    this.position.x >= entity.playerOne.position.x + entity.playerOne.width / 2 - this.radius &&
                    this.position.x <= entity.playerOne.position.x + entity.playerOne.width / 2 + this.radius
                ) {
                    this.position.y = entity.playerOne.position.y + entity.playerOne.height + this.radius;
                    this.vector.y = this.speed;
                    //console.log('center bottom');
                }

                // upper bound of the center side
                else if (
                    this.position.y + this.radius >= entity.playerOne.position.y &&
                    this.position.y <= entity.playerOne.position.y + this.radius &&
                    this.position.x >= entity.playerOne.position.x + entity.playerOne.width / 2 - this.radius &&
                    this.position.x <= entity.playerOne.position.x + entity.playerOne.width / 2 + this.radius
                ) {
                    this.position.y = entity.playerOne.position.y - this.radius;
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
                        ballRadiusY >= entity.playerOne.position.y &&
                        ballRadiusY <= entity.playerOne.position.y + this.radius
                        ) {
                            // upper bound of the left side
                            if (
                                ballRadiusX >= entity.playerOne.position.x &&
                                ballRadiusX <= entity.playerOne.position.x + entity.playerOne.width / 2 - this.radius
                            ) {

                                this.vector.y = -this.speed;
                                this.position.y = this.position.y + entity.playerOne.position.y - ballRadiusY;

                                break;
                            }

                            // upper bound of the right side

                            if (
                                ballRadiusX <= entity.playerOne.position.x + entity.playerOne.width &&
                                ballRadiusX >= entity.playerOne.position.x + entity.playerOne.width - entity.playerOne.width / 2 + this.radius
                            ) {


                                this.vector.y = -this.speed;
                                this.position.y = this.position.y + entity.playerOne.position.y - ballRadiusY;

                                break;
                            }

                        }

                        //the lower bound of the left or right side

                        if (
                            ballRadiusY <= entity.playerOne.position.y + entity.playerOne.height &&
                            ballRadiusY >= entity.playerOne.position.y + entity.playerOne.height - this.radius
                        ) {

                            //the lower bound of the left side

                            if (
                                ballRadiusX >= entity.playerOne.position.x &&
                                ballRadiusX <= entity.playerOne.position.x + entity.playerOne.width / 2 - this.radius
                            ) {
                                this.position.y = this.position.y + entity.playerOne.position.y + entity.playerOne.height - ballRadiusY;
                                this.vector.x = (this.position.x - (entity.playerOne.position.x + entity.playerOne.width / 2)) * this.magicalNumber;
                                this.vector.y = this.speed;
                                //console.log('left bottom');
                                break;

                            }
                            //the lower bound of the right side
                            if (
                                ballRadiusX <= entity.playerOne.position.x + entity.playerOne.width &&
                                ballRadiusX >= entity.playerOne.position.x + entity.playerOne.width - entity.playerOne.width / 2 + this.radius
                            ) {
                                this.position.y = this.position.y + entity.playerOne.position.y + entity.playerOne.height - ballRadiusY;
                                this.vector.x = (this.position.x - (entity.playerOne.position.x + entity.playerOne.width / 2)) * this.magicalNumber;
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

                //the ball hit the left or right side of
                if (
                    this.position.y >= entity.playerTwo.position.y &&
                    this.position.y <= entity.playerTwo.position.y + entity.playerTwo.height

                ) {

                    // the ball hit the left side of
                    if (
                        this.position.x + this.radius >= entity.playerTwo.position.x &&
                        this.position.x <= entity.playerTwo.position.x
                    ) {
                        this.vector.x = -this.speed;
                        this.position.x = entity.playerTwo.position.x - this.radius;
                        // console.log('left rebro');
                        return false
                    }
                    if (
                        //the ball hit the right side of
                    this.position.x - this.radius <= entity.playerTwo.position.x + entity.playerTwo.width &&
                    this.position.x >= entity.playerTwo.position.x + entity.playerTwo.width
                    ) {
                        this.vector.x = this.speed;
                        this.position.x = entity.playerTwo.position.x + entity.playerTwo.width + this.radius;
                        //console.log('right rebro');
                        return false
                    }
                }

                // upper bound of the center side
                if (
                    this.position.y + this.radius >= entity.playerTwo.position.y &&
                    this.position.y <= entity.playerTwo.position.y + this.radius &&
                    this.position.x >= entity.playerTwo.position.x + entity.playerTwo.width / 2 - this.radius &&
                    this.position.x <= entity.playerTwo.position.x + entity.playerTwo.width / 2 + this.radius
                ) {
                    this.position.y = entity.playerTwo.position.y - this.radius;
                    this.vector.y = -this.speed;
                    //console.log('center');
                }

                //the lower bound of the center side
                else if (
                    this.position.y - this.radius <= entity.playerTwo.position.y + entity.playerTwo.height &&
                    this.position.y >= entity.playerTwo.position.y + entity.playerTwo.height + this.radius &&
                    this.position.x >= entity.playerTwo.position.x + entity.playerTwo.width / 2 - this.radius &&
                    this.position.x <= entity.playerTwo.position.x + entity.playerTwo.width / 2 + this.radius
                ) {
                    this.position.y = entity.playerTwo.position.y + entity.playerTwo.height + this.radius;
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
                            ballRadiusY >= entity.playerTwo.position.y &&
                            ballRadiusY <= entity.playerTwo.position.y + this.radius
                        ) {
                            // upper bound of the left side
                            if (
                                ballRadiusX >= entity.playerTwo.position.x &&
                                ballRadiusX <= entity.playerTwo.position.x + entity.playerTwo.width / 2 - this.radius
                            ) {
                                this.vector.y = -this.speed;
                                this.vector.x = (this.position.x - (entity.playerTwo.position.x + entity.playerTwo.width / 2))*this.magicalNumber;
                                this.position.y = this.position.y + entity.playerTwo.position.y - ballRadiusY;

                                break;
                            }

                            // upper bound of the right side

                            if (
                                ballRadiusX <= entity.playerTwo.position.x + entity.playerTwo.width &&
                                ballRadiusX >= entity.playerTwo.position.x + entity.playerTwo.width - entity.playerTwo.width / 2 + this.radius
                            ) {

                                this.vector.y = -this.speed;
                                this.position.y = this.position.y + entity.playerTwo.position.y - ballRadiusY;
                                this.vector.x = (this.position.x - (entity.playerTwo.position.x + entity.playerTwo.width / 2))*this.magicalNumber;

                                break;
                            }

                        }

                        //the lower bound of the left abd right side

                        if (
                            ballRadiusY <= entity.playerTwo.position.y + entity.playerTwo.height &&
                            ballRadiusY >= entity.playerTwo.position.y + entity.playerTwo.height - this.radius
                        ) {

                            //the lower bound of the left side

                            if (
                                ballRadiusX >= entity.playerTwo.position.x &&
                                ballRadiusX <= entity.playerTwo.position.x + entity.playerTwo.width / 2 - this.radius
                            ) {
                                this.position.y = this.position.y + entity.playerTwo.position.y + entity.playerTwo.height - ballRadiusY;
                                this.vector.y = this.speed;
                                //console.log('left bottom');
                                break;

                            }

                            // the lower bound of the right side

                            if (
                                ballRadiusX <= entity.playerTwo.position.x + entity.playerTwo.width &&
                                ballRadiusX >= entity.playerTwo.position.x + entity.playerTwo.width - entity.playerTwo.width / 2 + this.radius
                            ) {
                                this.position.y = this.position.y + entity.playerTwo.position.y + entity.playerTwo.height - ballRadiusY;
                                this.vector.y = this.speed;
                                //console.log('right bottom');
                                break;
                            }

                        }

                    }
                }

            };


            if (this.position.y <= entity.field.height / 2) {
                racketHitPlayerOne.call(this);
            }

            if (this.position.y >= entity.field.height / 2) {

                racketHitPlayerTwo.call(this);
            }


        }
        ;

        return Ball;
    })();

    var Racket = (function () {

        function Racket(player) {
            this.id = undefined;
            this.width = 150;
            this.height = 28;
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
                this.position.y = entity.field.height - this.height - this.offset;
            }
            if (player) {
                this.position.x = entity.field.width / 2 - this.width / 2;
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
                if (this.position.x + this.width > entity.field.width) {
                    this.position.x = entity.field.width - this.width;
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
        entity.field = new Field();
        entity.ball = new Ball();
        entity.playerOne = new Racket('playerOne');
        entity.playerTwo = new Racket('playerTwo');
    };
    Tennis.prototype.update = function () {
        entity.ball.update();
        entity.playerOne.update();
        entity.playerTwo.update();
    };
    Tennis.prototype.emitData = function () {
        io.to(this.room).emit('entity', entity);
    };
    Tennis.prototype.loop = function (deltaTime) {

        if (deltaTime) {
            dt = deltaTime / 1000;
        }
        this.update();
        this.entity = entity;

        this.emitData();
        var self = this;

        var timer = setTimeout(function () {
            self.loop();
        }, 1000 / 60);


        //timer();
    };


    return Tennis;
})();*/



