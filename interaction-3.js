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

// Change here to ("tuono") depending on your wasm file name
const dspName = "fire";
const instance = new FaustWasm2ScriptProcessor(dspName);

// output to window or npm package module
if (typeof module === "undefined") {
    window[dspName] = instance;
} else {
    const exp = {};
    exp[dspName] = instance;
    module.exports = exp;
}

// The name should be the same as the WASM file, so change tuono with brass if you use brass.wasm
fire.createDSP(audioContext, 1024)
    .then(node => {
        dspNode = node;
        dspNode.connect(audioContext.destination);
        console.log('params: ', dspNode.getParams());
        const jsonString = dspNode.getJSON();
        jsonParams = JSON.parse(jsonString)["ui"][0]["items"];
        dspNodeParams = jsonParams
        // const exampleMinMaxParam = findByAddress(dspNodeParams, "/thunder/rumble");
        // // ALWAYS PAY ATTENTION TO MIN AND MAX, ELSE YOU MAY GET REALLY HIGH VOLUMES FROM YOUR SPEAKERS
        // const [exampleMinValue, exampleMaxValue] = getParamMinMax(exampleMinMaxParam);
        // console.log('Min value:', exampleMinValue, 'Max value:', exampleMaxValue);
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
const minTimeBetween = 1000;
let previousTime = 0;
let wetTimeout = null;

function accelerationChange(accx, accy, accz) {
}

function rotationChange(rotx, roty, rotz) {
    let now = millis();
    const margin = (typeof sliders !== "undefined" && sliders[2]) ? sliders[2].value() : 15;
    const totalXY = Math.abs(rotx) + Math.abs(roty);

    // Trigger when tilted BEYOND margin (>), not while sitting flat (<)
    if (totalXY > margin) {
        if (now - previousTime >= minTimeBetween) {
            previousTime = now;
            playAudio(1);
            statusLabels[2].style("color", "pink");
        }
    } else {
        statusLabels[2].style("color", "black");
    }
}

function mousePressed() {
    playAudio(1);
    // Use this for debugging from the desktop!
}

function deviceMoved() {
    movetimer = millis();
}

function deviceTurned() {
    threshVals[1] = turnAxis;
}

function deviceShaken() {
    shaketimer = millis();
    statusLabels[0].style("color", "pink");
    playAudio(1);
}

function getMinMaxParam(address) {
    const exampleMinMaxParam = findByAddress(dspNodeParams, address);
    const [exampleMinValue, exampleMaxValue] = getParamMinMax(exampleMinMaxParam);
    console.log('Min value:', exampleMinValue, 'Max value:', exampleMaxValue);
    return [exampleMinValue, exampleMaxValue];
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

function playAudio(isWet = 1) {
    if (!dspNode) {
        return;
    }
    if (audioContext.state === 'suspended') {
        return;
    }

    // Replace these strings with the exact 3 parameter paths from params: Array(3)
    // Always verify min/max with getMinMaxParam("/your/address") first!
    dspNode.setParamValue("/fire/gain", 0.8);
    dspNode.setParamValue("/fire/wet", isWet);

    if (wetTimeout) {
        clearTimeout(wetTimeout);
    }

    wetTimeout = setTimeout(() => {
        dspNode.setParamValue("/fire/wet", 0);
    }, 1500);
}
//==========================================================================================
// END
//==========================================================================================
