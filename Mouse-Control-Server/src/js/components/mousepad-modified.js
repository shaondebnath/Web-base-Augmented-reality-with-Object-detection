const React = require('react');
const socket = require('../socket.js');
const _ = require('underscore');
let clickNo = 0;

const buttons = {
  0: 'left',
  1: 'middle',
  2: 'right'
};

var srcWidth, srcHeight, mouseClickX, mouseClickY;

/*
function onClick(event) {
  let button = buttons[event.button] || 'left';
  console.log("onClick= "+event.clientX +', '+event.clientY)
  socket.emit('click', { button: button, double: false });//false
}
*/

function onDoubleClick(event) {
  let button = buttons[event.button] || 'left';
    console.log("doubleClick")
  socket.emit('click', { button: button, double: true });
}

function mousepad({throttle}) {
  let lastX, lastY;
  let lastMouseX, lastMouseY, getNewMouseX, getNewMouseY;
/*
  function onClick({clientX, clientY}) {
      //console.log("mouseClick= "+event.clientX +', '+event.clientY)
      //console.log("div width = "+document.getElementById("mousepad").offsetWidth)
      console.log("====== #click: "+clickNo);
      clickNo++;
      var srcWidth, srcHeight, mouseClickX, mouseClickY;
      console.log("onmouseEnter: "+clientX +", "+clientY)
      //mouseClickX = event.clientX;
      //mouseClickY = event.clientY;
      mouseClickX = clientX;
      mouseClickY = clientY;
      socket.emit('screenSize',{});
      socket.on('resolution', function (data) {
          srcWidth = data.srcWidth;
          srcHeight = data.srcHeight;
          console.log("resolution: "+srcWidth +', '+srcHeight);
          console.log("mouseClick= "+mouseClickX +', '+mouseClickY)
          moveMouseToPos(mouseClickX, mouseClickY);


        });

     //handleMouse(event.clientX, event.clientY);
  }*/
  function onClick({clientX, clientY}) {
        console.log("====== #click: "+clickNo);
        clickNo++;
        console.log("onmouseEnter: "+clientX +", "+clientY)
      clickAction(clientX, clientY);
  }
  function clickAction(clientX,clientY){
      mouseClickX = clientX;
      mouseClickY = clientY;
      console.log("onClick= "+mouseClickX +', '+mouseClickY)
      if (srcWidth == null || srcHeight == null){
          socket.emit('screenSize');
      }
      else{
          moveMouseToPos(mouseClickX, mouseClickY);
          // socket.emit('reqMousePos',{});
      }
  }
    // server resolution defined
    socket.on('resolution', function (data) {

        srcWidth = data.srcWidth;
        srcHeight = data.srcHeight;
        console.log("resolution: "+srcWidth +', '+srcHeight);
        console.log("mouseClick= "+mouseClickX +', '+mouseClickY)
        //moveMouseToPos(mouseClickX, mouseClickY);

    });


  function onMouseEnter({clientX, clientY}) {
    lastX = clientX;
    lastY = clientY;
  }

  function handleMouse(posX, posY, scroll) {
    let x = posX - lastX;
    let y = posY - lastY;

    if (scroll && Math.abs(y) < 5) return;

    lastX = posX;
    lastY = posY;
      console.log("X,y= "+x+', '+y)

    socket.emit('mousemove', {x, y}, scroll);
  }

  function onMouseMove({clientX, clientY}) {
    //--handleMouse(clientX, clientY);
  }

  // mouse position move
  function moveMouseToPos(posX, posY, scroll){
      console.log("MoveToMousePos");
      socket.emit('reqMousePos',{});
  }
    socket.on('getMousePos', function (data) {
        getNewMouseX = data.getMousePosX;
        getNewMouseY = data.getMousePosY;
        console.log("mouseOldPos: "+lastMouseX +', '+lastMouseY);
        console.log("getMouseOldPos: "+getNewMouseX +', '+getNewMouseY);
        console.log("newPos: "+mouseClickX +', '+mouseClickY);
        lastMouseX = mouseClickX;
        lastMouseY = mouseClickX;

        let x = mouseClickX - getNewMouseX;
        let y = mouseClickY - getNewMouseY;
        //if(getNewMouseY<0) y = mouseClickY;

        if (scroll && Math.abs(y) < 5) return;


        console.log("X,y= "+mouseClickX+"-"+getNewMouseX+"="+x+', '+mouseClickY+"-"+getNewMouseY+"="+y)

        //socket.emit('mousemove', {x, y}, scroll);
        socket.emit('mousemove', {x, y});
        //socket.emit('mousemove', {posX, posY}, scroll);
        console.log("click done")
        let button = buttons[event.button] || 'left';
        socket.emit('click', { button: button, double: false });//false
        console.log("===================");

    });



  // mouse position move

  let timeout;

  function onTouchStart(event) {
    event.persist();
    let touch = event.touches[0];
    lastX = touch.clientX;
    lastY = touch.clientY;

    console.log("touch start X,y= "+lastX+', '+lastY)
      clickAction(lastX,lastX)

    clearTimeout(timeout);
    timeout = setTimeout(() => event.preventDefault(), 50);
  }

  function onTouchEnd() {
    clearTimeout(timeout);
  }

  function _onTouchMove(event) {
    event.preventDefault();
    let touch = event.touches[0];
    let scroll = event.touches.length > 1;
    handleMouse(touch.clientX, touch.clientY, scroll);
  }

  const onTouchMove = _.throttle(_onTouchMove, 5);

  return (
    <div className="mousepad" style={{backgroundColor:"lightblue", width:"1366px", height:"768px"}}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onMouseEnter={onMouseEnter}
      onMouseMove={onMouseMove}
      onTouchEnd={onTouchEnd}
      onTouchMove={onTouchMove}
      onTouchStart={onTouchStart}
    >
      <span className="icon icon-mouse" />
    </div>
  );

}

module.exports = mousepad;
