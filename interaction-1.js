//==========================================================================================
// AUDIO SETUP
//------------------------------------------------------------------------------------------
//
//------------------------------------------------------------------------------------------
// Edit just where you're asked to!
//------------------------------------------------------------------------------------------
//
//==========================================================================================
let dspNode = null;
let dspNodeParams = null;
let jsonParams = null;

// -1 vänster och 1 höger, 0 i mitten
let prevTilt = 0;
let prevTime = 0;
const minTimeBetween = 500;
const tiltTrig = 20;

// Change here to ("windchimes") depending on your wasm file name
const dspName = "windchimes";
const instance = new FaustWasm2ScriptProcessor(dspName);

// output to window or npm package module
if (typeof module === "undefined") {
    window[dspName] = instance;
} else {
    const exp = {};
    exp[dspName] = instance;
    module.exports = exp;
}

// The name should be the same as the WASM file, so change windchimes with brass if you use brass.wasm
windchimes.createDSP(audioContext, 1024)
    .then(node => {
        dspNode = node;
        dspNode.connect(audioContext.destination);
        console.log('params: ', dspNode.getParams());
        const jsonString = dspNode.getJSON();
        jsonParams = JSON.parse(jsonString)["ui"][0]["items"];
        dspNodeParams = jsonParams;
    });


//==========================================================================================
// INTERACTIONS
//------------------------------------------------------------------------------------------
//
//------------------------------------------------------------------------------------------
// Edit the next functions to create interactions
// Decide which parameters you're using and then use playAudio to play the Audio
//------------------------------------------------------------------------------------------
//
//==========================================================================================

function accelerationChange(accx, accy, accz) {
    // playAudio()
}

function rotationChange(rotx, roty, rotz) {
    const now = millis();
    let currentTilt = 0;
    if (roty > tiltTrig) {
        currentTilt = 1;
        statusLabels[1].style("color", "red");
    }
    else if (roty < -tiltTrig) {
        currentTilt = -1;
        statusLabels[1].style("color", "pink");
    }
    else {
        statusLabels[1].style("color", "black");
    }
    if (currentTilt !== 0 && currentTilt !== prevTilt && now - prevTime > minTimeBetween) {
        prevTime = now;
        turntimer = now;
    }
    playAudio(currentTilt);
    prevTilt = currentTilt;
}


function mousePressed() {
    playAudio()
    // Use this for debugging from the desktop!
}

function deviceMoved() {
    // statusLabels[2].style("color", "pink");
}

function deviceTurned() {
    // threshVals[1] = turnAxis;
}

function deviceShaken() {
    shaketimer = millis();
    statusLabels[0].style("color", "pink");
    // playAudio();
}

function getMinMaxParam(address) {
    const exampleMinMaxParam = findByAddress(dspNodeParams, address);
    // ALWAYS PAY ATTENTION TO MIN AND MAX, ELSE YOU MAY GET REALLY HIGH VOLUMES FROM YOUR SPEAKERS
    const [exampleMinValue, exampleMaxValue] = getParamMinMax(exampleMinMaxParam);
    console.log('Min value:', exampleMinValue, 'Max value:', exampleMaxValue);
    return [exampleMinValue, exampleMaxValue]
}

//==========================================================================================
// AUDIO INTERACTION
//------------------------------------------------------------------------------------------
//
//------------------------------------------------------------------------------------------
// Edit here to define your audio controls 
//------------------------------------------------------------------------------------------
//
//==========================================================================================

function playAudio(tiltState = 0) {
    if (!dspNode || audioContext.state === "suspended") {
        return;
    }
    if (tiltState === -1) {
        dspNode.setParamValue("/windchimes/wind_chimes/wind", 0.35);
        dspNode.setParamValue("/windchimes/volume", 0.5);
        dspNode.setParamValue("/windchimes/Freeverb/Wet", 0.05);
    } else if (tiltState === 1) {
        dspNode.setParamValue("/windchimes/wind_chimes/wind", 2.0);
        dspNode.setParamValue("/windchimes/volume", 0.9);
        dspNode.setParamValue("/windchimes/Freeverb/Wet", 0.9);
    } else {
        dspNode.setParamValue("/windchimes/wind_chimes/wind", 0);
        dspNode.setParamValue("/windchimes/volume", 0);
    }
}

//==========================================================================================
// END
//==========================================================================================
