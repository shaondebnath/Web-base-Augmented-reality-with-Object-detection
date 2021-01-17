importScripts('../../dist/webxr-worker.js')
console.log("loaded webxr-worker.js")

///////////
var endTime = 0;

self.addEventListener('message',  function(event){
    console.log("in worker")

    //postMessage({type: "cvStart", time: ( performance || Date ).now()});

    var videoFrame = XRVideoFrame.createFromMessage(event);

    //try
    var ubuf = new Uint8Array(videoFrame.buffer(0).buffer);
    var binary = '';
    var len = ubuf.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode( ubuf[ i ] );
    }
    //try end

    endTime = ( performance || Date ).now()
    videoFrame.postReplyMessage({type: "cvFrame", image:binary, time: endTime})
    
    videoFrame.release();
});
