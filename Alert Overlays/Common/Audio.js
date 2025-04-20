// Registers audio by creating a new audio element.
function registerAudio(id, filepath, filetype) {
    var sound = document.createElement('audio');
    sound.id = id;
    sound.controls = 'controls';
    sound.src = filepath;
    sound.type = 'audio/'+filetype;
    document.getElementById('Hidden').appendChild(sound);
}

// Attempts to play an audio clip by ID.
// Stacking clones the node to allow the audio to stack. May get excessive...
// Also allows a function to be called upon the audio ending
function playaudio(name, volume, stacking = false, onfinishedcallback = null) {

    var elem = document.getElementById(name);
    if (elem == null) {
        console.error("ERROR PLAYING SOUND: " + name);
        return;
    }

    var e = elem;
    if (stacking)
        e = elem.cloneNode();
    if (volume)
        e.volume = volume;

    e.currentTime = 0;
    e.play();
    e.loop = false;
    if (stacking) {
        setTimeout(function () {
            e.remove();
            if (onfinishcallback != null) {
                onfinishcallback();
            }
        }, elem.duration * 1000);
    }
}