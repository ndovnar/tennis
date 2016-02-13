var io, serverSocket;

// this.id **session id
// io.sockets.adapter.rooms  **rooms list


exports.initGame = function (serverIo, socket) {

    io = serverIo;
    serverSocket = socket;


    serverSocket.emit('connected');
    serverSocket.on('getId', getId);

    serverSocket.on('createRoom', createRoom);

    //serverSocket.on('joinRoom', joinRoom);
    //serverSocket.on('getRooms', getRooms);
    //serverSocket.on('leaveRoom', leaveRoom);

    serverSocket.on('getPos', getPos);
};

var rooms = [];


var ball = {
    pos: [300, 0]
};

var speed = 10;

var ss = false;
setInterval(function () {
    if (ball.pos[0] > 1300 - 15) {
        speed = -speed;
    }
    else if (ball.pos[0] < 0) {
        speed = -speed;
    }

    ball.pos[0] += speed;
    if (ss == true) {
        serverSocket.emit('pos', ball.pos);
    }
}, 1000 / 60);


function getPos() {
    ss = true;
}


function getId() {
    serverSocket.emit('giveId', this.id);
}

function createRoom(data) {
    // if room does not exist - create room from id data
    if (rooms.indexOf(data) === -1) {
        rooms.push(data);
        serverSocket.join(data);
    }

    else {
        console.log(data + ' уже существует введите другое имя');
    }

}

function joinRoom(data) {

    // all rooms list
    var rooms = io.sockets.adapter.rooms;

    //if data id from in rooms list there join room
    if (rooms[data] !== undefined) {
        this.join(data);
    }
    else {
        console.log(data + ' такой комнаты не существует');
    }

}


function getRooms() {
    serverSocket.emit('some');
}