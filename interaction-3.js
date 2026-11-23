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
const minTimeBetween = 1000;
let previousTime = 0;
let wetTimeout = null;

function accelerationChange(accx, accy, accz) {
}

function rotationChange(rotx, roty, rotz) {
    let now = millis();
    // Flip threshold: > 135 degrees means the screen is facing downward
    const flipThreshold = 135;
    const isFlipped = Math.abs(rotx) > flipThreshold || Math.abs(roty) > flipThreshold;

    if (isFlipped) {
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

    // Ignite the fire, set volume (0 to 1), and turn on wet-wood crackling
    dspNode.setParamValue("/fire/gate", 1);
    dspNode.setParamValue("/fire/volume", 0.8);
    dspNode.setParamValue("/fire/wet", isWet);

    // Cancel any previous timer so rapid shakes/tilts don't cut the sound short
    if (wetTimeout) {
        clearTimeout(wetTimeout);
    }

    // Turn off wet crackling and close the fire gate after 1.5 seconds (1500 ms)
    wetTimeout = setTimeout(() => {
        dspNode.setParamValue("/fire/wet", 0);
        dspNode.setParamValue("/fire/gate", 0);
    }, 1500);
}
//==========================================================================================
// END
//==========================================================================================