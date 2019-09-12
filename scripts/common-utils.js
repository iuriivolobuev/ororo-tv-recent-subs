var GLOBAL_LOGGING_TURNED_ON = false;
function setupLogging(turnedOn) {
    GLOBAL_LOGGING_TURNED_ON = turnedOn;
}
function log(message) {
    if (GLOBAL_LOGGING_TURNED_ON) {
        console.log(new Date().toLocaleTimeString() + '   ' + message);
    }
}

function convertTimeStringToMs(value) {
    var parts = value.split(':');
    var ms = 0;
    if (parts.length === 2)
        ms = Number(parts[0]) * 60 + Number(parts[1]);
    else if (parts.length === 3)
        ms = (Number(parts[0]) * 60 + Number(parts[1])) * 60 + Number(parts[2]);
    return ms * 1000;
}
