#Mouse-Control-Server
Modified version of Remote Control Server.

Remote Control server is developed by jeremija \cite{RemoteControlServer} on the top of RobotJS API \ref{RobotJS}. This application allows user to control computer from any web browser on any other computer or mobile in the same network. It supports mouse movements, clicking, scrolling and keyboard input.\\

In this app we have modified this open source project according to our requirements, so that our webXR app can communicate with computer and mobile screen can be used as touch screen of the monitor. This application should be running on the computer, which we want to control. Once this application will be running, we will receive a host address, which should be configure in our webXR app, so that it can send the request to the computer using this web address.


[![Build Status](https://travis-ci.org/jeremija/remote-control-server.svg?branch=master)](https://travis-ci.org/jeremija/remote-control-server)

Supports mouse movements, scrolling, clicking and keyboard input.


```bash
npm install
npm start
```

On your other machine or mobile device open the url:

```bash
http://192.168.0.10:3000
```

Replace `192.168.0.10` with the LAN IP address of your server. 
```bash
Please configure this IP address in the appstore/tvdetection/index.html

press(method, param){
...
...
var url = '192.168.0.10:3000/' + method;
...
...  
}
```

# Note

This package requires [robotjs](https://www.npmjs.com/package/robotjs) so make
sure you have the required prerequisites installed for compiling that package.

# license

MIT
