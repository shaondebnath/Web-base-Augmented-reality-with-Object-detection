import * as tf from '@tensorflow/tfjs'
import * as cocoSsd from '@tensorflow-models/coco-ssd';
//import "babel-polyfill";

var modelTensor;
var isModelLoaded = false
if(document.getElementById('output'))
    document.getElementById('output').innerText = "Wait . . . Tensorflow Models LOADING . . .";
cocoSsd.load().then(models => {
    console.log('load model 1');
    if(document.getElementById('output'))
        document.getElementById('output').innerText = "Tensorflow Model Loaded. Play the video!";
    modelTensor = models
    isModelLoaded=true;
});

function xrTensor (){
    document.getElementById('output').innerText = "in Predict"
    console.log("in predict")
    const model = tf.sequential();
    model.add(tf.layers.dense({units: 1, inputShape: [1]}));

    model.compile({loss: "meanSquaredError", optimizer: 'sgd'});

    const xs = tf.tensor2d([-1, 0, 1, 2, 3, 4], [6, 1]);

    const ys = tf.tensor2d([-3, -1, 1, 3, 5, 7], [6, 1]);

    model.fit(xs, ys, {epochs: 500}).then(() => {
        var result = model.predict(tf.tensor2d([5], [1, 1]))


        document.getElementById('output').innerText = result;

    });
}

function xrTensorDetection(img, callback) {
    console.log("in detection")
    //document.getElementById('output').innerText = "in Detection"
     //const model = await cocoSsd.load();
    var predctionsTensor;
    if (isModelLoaded) {
        modelTensor.detect(img).then(predictions =>{
            console.log('Predictions: ');
           // console.log(predictions);
            callback(predictions);
        } );
    }
}

function xrTensorDetectionConsole(img, callback) {
    console.log("in detection:")

    //console.log(img)
    //document.getElementById('output').innerText = "in Detection"
    //const model = await cocoSsd.load();
    //var predctionsTensor = "Found: ";

    if (isModelLoaded) {
        modelTensor.detect(img).then(predictions =>{

           /* predictions.forEach(prediction => {
                //predctionsTensor = predctionsTensor + " | "+ prediction.class
                console.log('Pname: '+ prediction.class);
            });
            console.log('Predictions:- ');
             console.log(predictions);*/
            //document.getElementById('output').innerText = predctionsTensor

            callback(predictions,isModelLoaded);
        } );
    }
    callback(null,isModelLoaded);
}

module.exports = {
    xrTensor: xrTensor,
    xrTensorDetectionConsole: xrTensorDetectionConsole,
    xrTensorDetection: xrTensorDetection
}
