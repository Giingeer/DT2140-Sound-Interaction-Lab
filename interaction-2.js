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
let masterGain = null;

// Change here to ("tuono") depending on your wasm file name
const dspName = "bells";
const instance = new FaustWasm2ScriptProcessor(dspName);

// output to window or npm package module
if (typeof module === "undefined") {
    window[dspName] = instance;
} else {
    const exp = {};
    exp[dspName] = instance;
    module.exports = exp;
}



bells.createDSP(audioContext, 1024)
    .then(node => {
        dspNode = node;
        masterGain = audioContext.createGain();
        masterGain.gain.value = 0.5;
        dspNode.connect(masterGain);
        masterGain.connect(audioContext.destination);

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

let maxShakeForce = 0;

function accelerationChange(accx, accy, accz) {
    const totalForce = Math.sqrt(accx * accx + accy * accy + accz * accz);
    if (totalForce > maxShakeForce) {
        maxShakeForce = totalForce;
    }
}

function rotationChange(rotx, roty, rotz) {
}

function mousePressed() {
    playAudio(15);
    // Use this for debugging from the desktop!
}

function deviceMoved() {
    movetimer = millis();
    statusLabels[2].style("color", "pink");
}

function deviceTurned() {
    threshVals[1] = turnAxis;
}

function deviceShaken() {
    shaketimer = millis();
    statusLabels[0].style("color", "pink");
    playAudio(maxShakeForce);
    maxShakeForce = 0;
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


function playAudio(shakeForce = 5) {
    if (!dspNode || !masterGain) {
        return;
    }
    if (audioContext.state === 'suspended') {
        return;
    }

    // Calibrated for p5.js delta acceleration (1 = gentle shake, 12 = hard shake)
    const volume = constrain(map(shakeForce, 1, 12, 0.05, 1.5), 0.05, 1.5);
    console.log("Shake force:", shakeForce.toFixed(2), "-> Volume:", volume.toFixed(2));

    // Apply volume directly to the Web Audio GainNode
    masterGain.gain.setValueAtTime(volume, audioContext.currentTime);

    // Also try setting gain/sharpness on the bell DSP if supported
    dspNode.setParamValue("/englishBell/gain", constrain(volume, 0.05, 1.0));

    // Trigger the bell
    dspNode.setParamValue("/englishBell/gate", 1);
    setTimeout(() => { dspNode.setParamValue("/englishBell/gate", 0) }, 100);
}

//==========================================================================================
// END
//==========================================================================================