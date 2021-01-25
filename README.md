# Development and Evaluation of XR app using W3C, WebXR API and Object detection library


All the XR apps are implemented on the top of webxr-polyfill framework. NodeJS is used as the server-side framework.

Apps are hosted on https://shaon-webxr.herokuapp.com

## WARNING
The game is developed on unstable version of webxr-polyfill. for more information please go through webxr-polyfill Framework from https://github.com/mozilla/webxr-polyfill


## Building and Running the examples

	npm install   # downloads webpack and an http server
	npm start     # builds the polyfill in dist/webxr-polyfill.js and start the http server in the current directory

Using one of the supported browsers listed below, go to http://YOUR_HOST_NAME:8080/

Demo Videos playlist: https://www.youtube.com/watch?v=5aqUpPg2XOE&list=PLxchafb_QYe7kxxKm8bc1vkpz3yBo5i6g


##Appstore listed all the XR apps developed for this experiments

## TV / monitor Detection:

Using this app you can detect the TV, on tap a virtual remote will be appeared. you can control your TV using this virtual remote.

Or if it is an computer you will be able to click on any place just by tapping on the display of the mobile.

To test this app, you also will need to run another server to control tv or computer

To control TV (Works with Samsung Smart TV), 
------------------------------------------
Go inside the folder TVServer,
Edit the IP Address of the TV in config.json

    "tv": "192.168.1.4"

Then,
	
	npm install
	npm start
	
Now in console, the ipaddress and its port will be printed after successfully run the server.

Edit the IP address on appstore\tvdetection\index.html

    var remoteURLPort = 'http://192.168.1.11:3000'; 

Now you are ready to test the app.

Run XR viewer,  browse http://YOUR_HOST_NAME:8080/

And select "Detect TV/Monitor & Control"

Demo video can be found at 

https://www.youtube.com/watch?v=FD9GUE2YVmQ (Recording from different camera)

https://www.youtube.com/watch?v=U0gaCOzle7g (Mobile Screen Recording)

To control computer
-------------------

Go inside the Mouse-Control-Server

	npm install
	npm start

Now in console, the ipaddress and its port will be printed after successfully run the server.

Edit the IP address on appstore\tvdetection\index.html

    var remoteURLPort = 'http://192.168.1.11:3000'; 

Now you are ready to test the app.

Run XR viewer and browse http://YOUR_HOST_NAME:8080/	

And select "Detect TV/Monitor & Control"

Demo Video: https://www.youtube.com/watch?v=-gqAqwxphfs



## Ecommerce site

At first it displays a basic e commerce site with several eye glasses. You can give a trial with any glass, just click on try it.

Browse http://YOUR_HOST_NAME:8080/	and select "Ecommerce Store"

Demo Video: https://www.youtube.com/watch?v=YJbrtFB9Nms


## Mulitple objects detection 

This app can detect mulitple objects from a single frame. After detection of an object, you can tap on the object name to know details about it.

Best result in Safari browser on iOS

Browse http://YOUR_HOST_NAME:8080/	and select "Multiple Object Detection in WebXR"

Video Demo: https://www.youtube.com/watch?v=r8OyJbNJEdk

## Education through 3D model visualization

We do not need to develop different app for different 3D model for education. They are just a link away.
Click on any item that you want to know about.

Tap on the screen to see the 3D model.

Tap on any part of the body to know about it.

Best works on WebXR Viewer in iOS

Browse http://YOUR_HOST_NAME:8080/	and select "Education: 3D Model"

Video Demo: https://www.youtube.com/watch?v=5aqUpPg2XOE


## Board Game

Look around to find the board and start playing by tapping on the Blue Gems.

The source code of this game is removed for confidentiality

Browse http://YOUR_HOST_NAME:8080/	and select "Board Game"

Demo of this game can be found at https://www.youtube.com/watch?v=sFAYd8YHsTQ


## Game Controlled by Object Detection

You can move game element by detecting your palm over through camera or by touching on the screen

Video Demo: https://www.youtube.com/watch?v=NVFJ-QBp2y8


## Supported Devices and browsers

### iOS users
Install XR Browser from Apple Store(iOS 11.0 or later)
https://itunes.apple.com/us/app/webxr-viewer/id1295998056?mt=8 


### Android Users:
Step1: Install Tango Core (https://github.com/google-ar/arcore-android-sdk/releases/download/sdk-preview/arcore-preview.apk) (also can be found in google play store)

Step2: Install Browser: WebARonARCore (https://github.com/google-ar/WebARonARCore/raw/webarcore_57.0.2987.5/apk/WebARonARCore.apk)

### Supported device list
Supported devices list can be found at https://developers.google.com/ar/discover/supported-devices 
