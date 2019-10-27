var GLOBAL_DATA_ID = null;
var GLOBAL_SUBS = null;

function setupDataId(dataId) {
    GLOBAL_DATA_ID = dataId;
}
function isNeededToLoadSubs(dataId) {
    return GLOBAL_SUBS == null || GLOBAL_DATA_ID != dataId;
}
function loadSubs(subsUrl, callback) {
    var request = new XMLHttpRequest();
    request.open("GET", subsUrl);
    request.send();
    request.onreadystatechange = (e) => {
        if (request.readyState == 4/*DONE*/) {
            GLOBAL_SUBS = Subtitle.parse(request.responseText);
            callback();
        }
    }
}
function getRecentSubs() {
    var timeDisplayText = $('div.vjs-current-time-display').text();
    var timeString = timeDisplayText.substr(timeDisplayText.lastIndexOf(' ') + 1).trim();
    var currentTime = convertTimeStringToMs(timeString);
    var subs = GLOBAL_SUBS.filter(function (el) {
        var proportion = (currentTime - el.start) / (el.end - el.start);
        return proportion >= 0;
    });
    subs.reverse();
    return subs;
}

function showExtSubs() {
    var subs = getRecentSubs();
    if (subs[0]) {
        clearExtSubs();
        hideNativeSubs();
        var subsSpan = prepareExtSubSpan();
        for (var subIndex = 4; subIndex >= 0; subIndex--) {
            if (subIndex < 4) {
                subsSpan.appendChild(br());
                subsSpan.appendChild(br());
            }
            addSubToSpan(subs[subIndex], subsSpan);
        }
    }
}
function clearExtSubs() {
    $('.ext-subs').remove();
}
function showNativeSubs() {
    $('div.vjs-subtitles.vjs-text-track').show();
}
function hideNativeSubs() {
    $('div.vjs-subtitles.vjs-text-track').hide();
}

function addSubToSpan(sub, subsSpan) {
    if (sub) {
        var lines = sub.text.split('\n');
        for (var lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            if (lineIndex > 0) {
                subsSpan.appendChild(br());
            }
            var cleanTagsPattern   = /<(?!br\s*\/?)[^>]+>/g;
            var addSpanTagsPattern = /([a-zA-Z'-]+)/g;
            var formatted = lines[lineIndex].replace(cleanTagsPattern, '')
                .replace(new RegExp('<br/>', 'g'), ' ')
                .replace(addSpanTagsPattern, '<span><span class=\'word\'>$1</span></span>');
            $(subsSpan).append(formatted);
        }
    }
}
function prepareExtSubSpan() {
    var subsDiv = createDiv('vjs-subtitles vjs-text-track ext-subs');
    subsDiv.style = 'font-size: 1em;';
    var div = createDiv('vjs-tt-cue');
    var span = createSpan('vjs-subs');
    div.appendChild(span);
    subsDiv.appendChild(div);
    $('div.vjs-text-track-display').first().prepend(subsDiv);
    return span;
}

function createDiv(className) {
    var div = document.createElement('div');
    div.className = className;
    return div;
}
function createSpan(className) {
    var span = document.createElement('span');
    span.className = className;
    return span;
}
function br() {
    return document.createElement('br');
}
