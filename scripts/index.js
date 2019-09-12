setupLogging(false);

$(document).bind('DOMNodeInserted', function(e) {
    var element = $(e.target);
    if (element.is('span.vjs-control-text')) {
        var parentElement = $(element.get(0).parentElement);
        if (parentElement.is('div.vjs-play-control.vjs-control.vjs-button.vjs-paused')) {
            handlePause();
        } else if (parentElement.is('div.vjs-play-control.vjs-control.vjs-button.vjs-playing')) {
            handlePlay();
        }
    }
});

function handlePause() {
    var dataId = $('video.vjs-tech').get(0).getAttribute('data-id');
    if (isNeededToLoadSubs(dataId)) {
        loadSubs(getSubsUrl(dataId), showExtSubs);
        setupDataId(dataId);
    } else {
        showExtSubs();
    }
}
function handlePlay() {
    clearExtSubs();
    showNativeSubs();
}

function getSubsUrl(dataId) {
    var parentElement = $(document);
    var episode = $('li.js-media-wrapper').filter(function(){return $(this).attr('data-id') == dataId}).get(0);
    if (episode) {
        parentElement = $(episode);
    }
    return $(parentElement).find('i.active-sub.en.flag').get(0).parentElement.href;
}
