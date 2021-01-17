#!/usr/bin/env node
'use strict';
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');
const robot = require('robotjs');
const os = require('os');

const handleSocket = require('./server/socket.js');

app.set('view engine', 'jade');
app.set('views', path.join(__dirname, 'views'));

app.use('/res', express.static(path.join(__dirname, 'res')));

if (path.basename(__dirname) === 'dist') {
  app.use('/js', express.static(path.join(__dirname, 'js')));
  app.use('/less', express.static(path.join(__dirname, 'less')));
} else {
  const browserify = require('browserify-middleware');
  const less = require('less-middleware');
  browserify.settings({
    transform: ['babelify']
  });

  const tempDir = path.join(os.tmpDir(), 'node-mpv-css-cache');
  app.use('/js', browserify(path.join(__dirname, './js')));
  app.use('/less', less(path.join(__dirname, './less'), { dest: tempDir}));
  app.use('/less', express.static(tempDir));
  app.use('/less/fonts', express.static(
    path.join(__dirname, './less/fonts')));
}
app.all('/*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});

app.get('/', (req, res) => res.render('index'));

let srcWidth = robot.getScreenSize().width;
let srcHeight = robot.getScreenSize().height;

app.get('/tapPos/:button/:tapX/:tapY/:mousePadWidth/:mousePadHeight', function (req, res) {
    console.log('tapPos');
    console.log(req.params.button+', ---, tapX,Y: '+req.params.tapX + ', '+req.params.tapY + ' pad res '+req.params.mousePadWidth + ', '+req.params.mousePadHeight)
    let mouse = robot.getMousePos();
    console.log('GetMousePos: '+ mouse.x +', '+mouse.y);
    let tapAsPerResX = req.params.tapX / req.params.mousePadWidth*srcWidth;
    let tapAsPerResY = req.params.tapY / req.params.mousePadHeight*srcHeight;
    console.log('screenRes : '+ srcWidth +', '+srcHeight);
    console.log('TapRatio: '+ tapAsPerResX +', '+tapAsPerResY);

   /* let x = tapAsPerResX - mouse.x;
    let y = tapAsPerResY - mouse.y;
    console.log('move: '+ x +', '+y);
    let newPosX = mouse.x+x;
    let newPosY = mouse.y+y;
    robot.moveMouse(x, y);*/
    robot.moveMouse(tapAsPerResX, tapAsPerResY);
    let newMouse = robot.getMousePos()
    //console.log('NewMousePos: '+ newMouse.x +', '+newMouse.y +' set: '+ newPosX +', '+newPosY);
    console.log('NewMousePos: '+ newMouse.x +', '+newMouse.y);
    robot.mouseClick(req.params.button,false)
    console.log('=============================');

    res.sendStatus(200);
});

app.get('/hello', function (req, res) { //for testing
    console.log('hello');
    let mouse = robot.getMousePos();
    console.log('GetMousePos: '+ mouse.x +', '+mouse.y);
    res.sendStatus(200);
});

io.on('connection', socket => handleSocket(socket, robot));

let port = process.env.PORT || 3003;
let ifaces = os.networkInterfaces();
http.listen(port, function() {
  Object.keys(ifaces).forEach(ifname =>
    ifaces[ifname].forEach(iface =>
      console.log('listening on', iface.address, 'and port', port)));
});
/*
app.listen(3000, function () {
    console.log('listening on port 3000!');
});*/
