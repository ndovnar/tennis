var express = require('express'),
    tennis = require('./tennis'),
    http = require('http'),
    path = require('path'),
    app = express();


app.use(express.static(path.join(__dirname, 'public')));

var server = require('http').createServer(app).listen(process.env.PORT || 8080),
    io = require('socket.io').listen(server);


io.sockets.on('connection', function (socket) {
    tennis.initGame(io, socket);
});