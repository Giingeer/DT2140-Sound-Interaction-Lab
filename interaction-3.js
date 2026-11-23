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
const flipThreshold = 135;
let wasFlipped = false;

function accelerationChange(accx, accy, accz) {
}

function rotationChange(rotx, roty, rotz) {
    const isFlipped = Math.abs(rotx) > flipThreshold || Math.abs(roty) > flipThreshold;

    // Ignite fire when flipped face-down
    if (isFlipped && !wasFlipped) {
        wasFlipped = true;
        playAudio(true);
        statusLabels[2].style("color", "pink");
    } 
    // Stop fire immediately when flipped back face-up
    else if (!isFlipped && wasFlipped) {
        wasFlipped = false;
        playAudio(false);
        statusLabels[2].style("color", "black");
    }
}

function mousePressed() {
    // Toggle fire on/off when clicking on desktop for debugging
    wasFlipped = !wasFlipped;
    playAudio(wasFlipped);
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

function playAudio(active) {
    if (!dspNode) {
        return;
    }
    if (audioContext.state === 'suspended') {
        return;
    }

    dspNode.setParamValue("/fire/gate", active ? 1 : 0);
    dspNode.setParamValue("/fire/volume", active ? 0.8 : 0);
    dspNode.setParamValue("/fire/wet", active ? 1 : 0);
}
//==========================================================================================
// END
//==========================================================================================