importScripts('../dist/webxr-worker.js')
importScripts("../polyfill/fill/gl-matrix.js")
console.log("loaded webxr-worker.js")

var openCVready = false;

// need to load up the files for tracking the face and eyes.  WASM module has hooks to pass in 
// files to be loaded by opencv

var sdObjectXML = "haarcascade_frontalface_default.xml"; //"cascade_cup.xml"// "haarcascade_frontalface_default.xml"
//var sdObjectXML = "cascade_tv.xml";

/*
self.addEventListener('message',  function(event) {
    var args = event.data.xmlName;
    console.log("args:- " + args);

});*/

var Module = {
  preRun: [function() {
    console.log("CV preRun")
    //-Module.FS_createPreloadedFile('./', 'haarcascade_eye.xml', 'haarcascade_eye.xml', true, false);
    //-Module.FS_createPreloadedFile('./', 'haarcascade_frontalface_default.xml', 'haarcascade_frontalface_default.xml', true, false);
    //-Module.FS_createPreloadedFile('./', 'haarcascade_profileface.xml', 'haarcascade_profileface.xml', true, false);
    Module.FS_createPreloadedFile('./', sdObjectXML, sdObjectXML, true, false);
  }],
  onRuntimeInitialized: function() {
        openCVready = true;
        postMessage({type: "cvReady"});
  },
  setStatus: function(msg) {
        postMessage({type: "cvStatus", msg: msg});
  }
};
console.log("set up pre-load")

importScripts('opencv.js')
console.log("loaded opencv.js:" + cv);

var sdObject_cascade;

function loadSDObjectDetectTrainingSet() {
    if (sdObject_cascade == undefined) {
        sdObject_cascade = new cv.CascadeClassifier();
        let load = sdObject_cascade.load(sdObjectXML);
        console.log('load object detection training data', load);
    }
}


function sdObjectDetect(img_gray, roiRect) {
    loadSDObjectDetectTrainingSet();

    var roi_gray = img_gray
    if (roiRect) {
        roi_gray = img_gray.roi(roiRect);
    } else {
        roiRect = new cv.Rect(0, 0, img_gray.cols, img_gray.rows);
    }

    let sdObjects = new cv.RectVector();
    let s1 = new cv.Size(15,15);
    let s2 = new cv.Size(120,120);
    sdObject_cascade.detectMultiScale(roi_gray, sdObjects, 1.3, 3, 0, s1, s2);

    let rects = [];

    for (let i = 0; i < sdObjects.size(); i += 1) {
        let sdObjectRect = sdObjects.get(i);
        rects.push({
            x: sdObjectRect.x + roiRect.x,
            y: sdObjectRect.y + roiRect.y,
            width: sdObjectRect.width,
            height: sdObjectRect.height
        });
    }

    if (roi_gray != img_gray) roi_gray.delete()
    sdObjects.delete();
    return rects;
}


// createCVMat
//
// this routine does two things (if needed) as part of copying the input buffer to a cv.Mat:
// - rotates the image so it is upright 
// - converts to greyscale 

var rotatedImage = null;
var img_gray = null;
var img_rgba = null;
var resizedImage = null;

function createCVMat2(rotation, buffer, pixelFormat) {
    var width = buffer.size.width
    var height = buffer.size.height

    if (!img_gray) img_gray = new cv.Mat();
    if (!img_rgba) img_rgba = new cv.Mat();
    if (!rotatedImage) rotatedImage = new cv.Mat();

    switch(pixelFormat) {
        case XRVideoFrame.IMAGEFORMAT_YUV420P:
            var b = new Uint8Array(buffer.buffer);
            img_gray.create(height,width,cv.CV_8U)
            img_gray.data.set(b);        
            break;
        case XRVideoFrame.IMAGEFORMAT_RGBA32:
            var b = new Uint8Array(buffer.buffer);
            img_rgba.create(height,width,cv.CV_8UC4)
            img_rgba.data.set(b);
            cv.cvtColor(img_rgba, img_gray, cv.COLOR_RGBA2GRAY, 0);
            break;
    }

    // face tracker only works if image is upright.
    // on mobile, the camera is fixed, even though the display rotates.  So, we need
    // to rotate the image so it's in the right orientation (upright, relative to how the 
    // user sees it)
    switch(rotation) {
        case -90:
            cv.rotate(img_gray, rotatedImage, cv.ROTATE_90_CLOCKWISE);
            return rotatedImage;
            break;
        case 90:
            cv.rotate(img_gray, rotatedImage, cv.ROTATE_90_COUNTERCLOCKWISE);
            return rotatedImage;
            break;
        case 180:
            cv.rotate(img_gray, rotatedImage, cv.ROTATE_180);
            return rotatedImage;
            break;
        default:
            return img_gray;            
    }
}

///////////
var endTime = 0;

/// 3d pos

var camDistortion = null;
var dictionary = null;
var parameter = null;
var markerIds = null;
var markerCorners = null;
var rotMat = null;
var rVec = null;
var antiRotation = mat4.create();
//3d pos

self.addEventListener('message',  function(event){
    // send back some timing messages, letting the main thread know the message is 
    // received and CV processing has started
    postMessage({type: "cvStart", time: ( performance || Date ).now()});

    // create a videoFrame object frome the message.  Eventually, this may
    // be passed in by the browser, if we create something like a "vision worker"
    var videoFrame = XRVideoFrame.createFromMessage(event);

    // did we find any?
    var faceRects = []
    var sdObjectRects = []
    var markers = []

    // don't do anything until opencv.js and WASM and support files are loaded
    if (openCVready) {

        //3d pos
        if (dictionary == null) {
            dictionary = new cv.Dictionary(cv.DICT_6X6_250);
            markerIds = new cv.Mat();
            markerCorners  = new cv.MatVector();
            rvecs = new cv.Mat();
            tvecs = new cv.Mat();
            rvec = new cv.Mat(3, 1, cv.CV_64F);

            camIntrinsics = new cv.Mat();
            rotMat = new cv.Mat();
            resizeMat = new cv.Mat();
            flipMat = new cv.Mat();

            parameter = new cv.DetectorParameters();
            parameter.adaptiveThreshWinSizeMin = 3,
                //parameter.adaptiveThreshWinSizeMin = 23;
                // parameter.adaptiveThreshWinSizeMax = 23,
                parameter.adaptiveThreshWinSizeMax = 23;
            parameter.adaptiveThreshWinSizeStep = 10,
                parameter.adaptiveThreshConstant = 7;
            // parameter.minMarkerPerimeterRate = 0.03;
            parameter.minMarkerPerimeterRate = 0.1;
            parameter.maxMarkerPerimeterRate = 3.5;
            parameter.polygonalApproxAccuracyRate = 0.05;
            parameter.minCornerDistanceRate = 0.05;
            parameter.minDistanceToBorder = 3;
            parameter.minMarkerDistanceRate = 0.05;
            parameter.cornerRefinementMethod = cv.CORNER_REFINE_SUBPIX; // cv.CORNER_REFINE_NONE;
            parameter.cornerRefinementWinSize = 5;
            parameter.cornerRefinementMaxIterations = 50;
            parameter.cornerRefinementMinAccuracy = 0.01;
            parameter.markerBorderBits = 1;
            parameter.perspectiveRemovePixelPerCell = 4;
            //parameter.perspectiveRemovePixelPerCell = 2;
            parameter.perspectiveRemoveIgnoredMarginPerCell = 0.13;
            parameter.maxErroneousBitsInBorderRate = 0.35;
            parameter.minOtsuStdDev = 5.0;
            parameter.errorCorrectionRate = 0.6;
        }

        //3d pos

        // deal with the video formats we know about

        var scale = 1;
        var buffer = videoFrame.buffer(0);
        var width = buffer.size.width;
        var height = buffer.size.height;

        // 3d pos
        if (camDistortion == null) {
            // we assume we're getting no distortion for now, since our cameras appear rectaliner
            // we probably want to add distortion coefficients to the camera definition since I assume some
            // cameras will have it
            camDistortion = cv.matFromArray(5, 1, cv.CV_64F, [0, 0, 0, 0, 0]);
        }
        //videoFrame.camera.cameraIntrinsics[8] = 1.0  // was broken in the app, should be fixed now
        camIntrinsics.create(3, 3, cv.CV_64F)
        camIntrinsics.data64F.set(videoFrame.camera.cameraIntrinsics);

        // put image into a cv.Mat and converts to 8bit grey scale if necessary
        var rotation = videoFrame.camera.cameraOrientation;
        var image = createCVMat2(rotation, videoFrame.buffer(0), videoFrame.pixelFormat)
        postMessage({type: "cvAfterMat", time: ( performance || Date ).now()});

        var imageToUse = image;
        // did we decide to scale?
        if (scale != 1) {
            cv.resize(image, resizeMat, new cv.Size(), scale, scale);
            for (var i = 0; i < 8; i++) {
                camIntrinsics.data64F[i] = camIntrinsics.data64F[i] * scale;
            }
            imageToUse = resizeMat;
        }

        cv.detectMarkers(imageToUse, dictionary, markerCorners, markerIds, parameter);
        postMessage({type: "cvAfterDetect", time: ( performance || Date ).now()});
        console.log('merkers id row:' + markerIds.rows)

        if (markerIds.rows > 0) {
            // Need to adjust the corners to be around 0,0 at the center.
            // Weirdly, the aruco detector returns the values in image coordinates,
            // even though pose estimation expects them relative to the center of the
            // screen.
            for(let i=0; i < markerIds.rows; ++i) {
                let cornervec = markerCorners.get(i).data32F
                cornervec[0] -= width/2;
                cornervec[0] *= -1
                cornervec[1] -= height/2;
                // cornervec[1] *= -1
                cornervec[2] -= width/2;
                cornervec[2] *= -1
                cornervec[3] -= height/2;
                // cornervec[3] *= -1
                cornervec[4] -= width/2;
                cornervec[4] *= -1
                cornervec[5] -= height/2;
                // cornervec[5] *= -1
                cornervec[6] -= width/2;
                cornervec[6] *= -1
                cornervec[7] -= height/2;
                // cornervec[7] *= -1
            }

            // estimate the poses of the found markers
            cv.estimatePoseSingleMarkers(markerCorners, 0.053, camIntrinsics, camDistortion, rvecs, tvecs);

            for(let i=0; i < markerIds.rows; ++i) {
                let id = markerIds.data32S[i]
                let cornervec = markerCorners.get(i).data32F
                rvec.data64F.set([rvecs.doublePtr(0, i)[0], rvecs.doublePtr(0, i)[1], rvecs.doublePtr(0, i)[2]]);

                // Convert rotation vector into matrix
                cv.Rodrigues(rvec, rotMat);
                var tm;
                if (rotMat.depth() == 4) {
                    tm = Array.from(rotMat.data32F)
                } else {
                    tm = Array.from(rotMat.data64F)
                }

                // construct a pose matrix from rotation and position
                var returnMat = [tm[0], tm[1], tm[2], 0, tm[3], tm[4], tm[5], 0, tm[6], tm[7], tm[8], 0,0,0,0, 1]
                mat4.translate(returnMat, returnMat, [tvecs.doublePtr(0, i)[0], tvecs.doublePtr(0, i)[1], tvecs.doublePtr(0, i)[2]]);

                // invert it so it's marker relative to camera, not the usual camera relative to marker
                mat4.invert(returnMat,returnMat)

                // account for camera rotation relative to screen, which happens in video mixed handhelds
                mat4.fromZRotation(antiRotation, rotation * Math.PI/180);
                mat4.multiply(returnMat, antiRotation, returnMat)



                // save the marker info!
                markers.push({
                    id: id,
                    corners: [{x: cornervec[0], y: cornervec[1]}, {x: cornervec[2], y: cornervec[3]}, {x: cornervec[4], y: cornervec[5]}, {x: cornervec[6], y: cornervec[7]}],
                    pose: returnMat
                })
            }
        }

            //3d pos

            // let's pick a size such that the video is below 256 in size in both dimensions
            // since face detection is really expensive on large images
        /*    while (width > 256 || height > 256) {
                width = width / 2
                height = height / 2
                scale = scale / 2;
            }
        


            // did we decide to scale?
            if (scale != 1) {
                if (!resizedImage) resizedImage = new cv.Mat();

                cv.resize(image, resizedImage, new cv.Size(), scale, scale);
                postMessage({type: "cvAfterResize", time: ( performance || Date ).now()});
        
                // now find faces / objects
                //-faceRects = faceDetect(resizedImage);
                sdObjectRects = sdObjectDetect(resizedImage);
                for (let i = 0; i < sdObjectRects.length; i++) {
                    let rect = sdObjectRects[i];
                    rect.x = rect.x / scale
                    rect.y = rect.y / scale
                    rect.width = rect.width / scale
                    rect.height = rect.height / scale
                }


            } else {
                // no resize?  Just use the original image
                postMessage({type: "cvAfterResize", time: ( performance || Date ).now()});
                //-faceRects = faceDetect(image);
                //sdObjectRects = sdObjectRects(image);
                sdObjectRects = sdObjectDetect(image);
            }
        } */
    }
    endTime = ( performance || Date ).now()
    //-videoFrame.postReplyMessage({type: "cvFrame", faceRects: faceRects, time: endTime})
    videoFrame.postReplyMessage({type: "cvFrame", sdObjectRects: sdObjectRects, time: endTime})
    
    videoFrame.release();
});
