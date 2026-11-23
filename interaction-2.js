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
        dspNode.disconnect();
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
    playAudio(mouseX / windowWidth);
    // Use this for debugging from the desktop!
}

function deviceMoved() {
    // movetimer = millis();
    statusLabels[2].style("color", "pink");
}

function deviceTurned() {
    threshVals[1] = turnAxis;
}

function deviceShaken() {
    shaketimer = millis();
    statusLabels[0].style("color", "pink");

    // Calculate shake delta directly from p5.js built-in acceleration variables
    const dx = Math.abs(accelerationX - pAccelerationX);
    const dy = Math.abs(accelerationY - pAccelerationY);
    const dz = Math.abs(accelerationZ - pAccelerationZ);
    const shakeForce = Math.sqrt(dx * dx + dy * dy + dz * dz);

    console.log("shakeforce ", shakeForce)

    playAudio(shakeForce);
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

function playAudio(shakeForce = 15) {
    if (!dspNode || !masterGain) {
        return;
    }
    if (audioContext.state === 'suspended') {
        return;
    }

    // p5.js shake threshold defaults to 30 (sum of deltas), so shakeForce typically ranges from ~15 (light) to ~60+ (hard)
    const volume = constrain(map(shakeForce, 15, 60, 0.02, 2.0), 0.02, 2.0);

    // Show the live force & volume in the status label on your phone screen!
    if (statusLabels && statusLabels[0]) {
        statusLabels[0].html("Shake force: " + Math.round(shakeForce) + " | Vol: " + volume.toFixed(2));
    }

    // Apply volume directly to the Web Audio GainNode
    masterGain.gain.setValueAtTime(volume, audioContext.currentTime);

    // Trigger the bell
    dspNode.setParamValue("/englishBell/gate", 1);
    setTimeout(() => { dspNode.setParamValue("/englishBell/gate", 0) }, 100);
}
//==========================================================================================
// END
//==========================================================================================
