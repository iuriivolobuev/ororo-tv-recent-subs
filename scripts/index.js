$(document).bind('DOMNodeInserted', function(e) {
    var element = $(e.target);
    if (element.is('.vjs-control-text')) {
        var parentElement = $(element.get(0).parentElement);
        if      (parentElement.is('.vjs-paused' )) RecentSubsExt.Controller.onPause();
        else if (parentElement.is('.vjs-playing')) RecentSubsExt.Controller.onPlay();
    }
});
$(document).ready(function(e) {
    $(document).on('keydown', function(e) {
        if (e.shiftKey && e.which == 83/*Shift+S*/) RecentSubsExt.View.toggleExtSubs();
    })
})

var RecentSubsExt = {
    Model: {
        currentSubs  : null,
        currentDataId: null,

        isLoaded: function(dataId) {return this.currentSubs != null && this.currentDataId == dataId;},
        load    : function(dataId, url, callback) {
            var request = new XMLHttpRequest();
            request.open("GET", url);
            request.send();
            request.onreadystatechange = (e) => {
                if (request.readyState == 4/*DONE*/) {
                    this.currentSubs = Subtitle.parse(request.responseText);
                    this.currentDataId = dataId;
                    callback();
                }
            }
        },
        getRecentSubs: function(currentTimeInMs, n) {
            var result = [];
            var all = this.currentSubs.filter(function(s) {
                var timeProportion = (currentTimeInMs - s.start) / (s.end - s.start);
                return timeProportion >= 0;/*adjust it if needed*/
            });
            for (var i = 0; i < n; i++) {
                var index = all.length - i - 1;
                if (index >= 0) result.push(all[index]);
            }
            return result.reverse();
        }
    },

    View: {
        showNativeSubs: function() {
            $('div.vjs-subtitles.vjs-text-track').show();
        },
        hideNativeSubs: function() {
            $('div.vjs-subtitles.vjs-text-track').hide();
        },

        toggleExtSubs: function() {
            $('div.vjs-subtitles.vjs-text-track.ext-subs').toggle();
        },
        clearExtSubs: function() {
            $('div.vjs-subtitles.vjs-text-track.ext-subs').remove();
        },
        showExtSubs: function(recentSubs) {
            RecentSubsExt.View.clearExtSubs();
            if (recentSubs.length > 0) {
                RecentSubsExt.View.hideNativeSubs();
                var subsSpan = RecentSubsExt.View.prepareSubsSpan();
                for (var i = 0; i < recentSubs.length; i++) {
                    if (i > 0) {
                        subsSpan.appendChild(RecentSubsExt.View.createBr());
                        subsSpan.appendChild(RecentSubsExt.View.createBr());
                    }
                    RecentSubsExt.View.addSubToSpan(recentSubs[i], subsSpan);
                }
            }
        },

        prepareSubsSpan: function() {
            var extSubsDiv = RecentSubsExt.View.createDiv('vjs-subtitles vjs-text-track ext-subs');
            extSubsDiv.style = 'font-size: 1em;';
            var subsDiv  = RecentSubsExt.View.createDiv('vjs-tt-cue');
            var subsSpan = RecentSubsExt.View.createSpan('vjs-subs');
            subsDiv.appendChild(subsSpan);
            extSubsDiv.appendChild(subsDiv);
            $('.vjs-text-track-display').first().prepend(extSubsDiv);
            return subsSpan;
        },
        addSubToSpan: function(sub, subsSpan) {
            var lines = sub.text.replace(new RegExp('\n', 'g'), '<br/>').split('<br/>');
            for (var i = 0; i < lines.length; i++) {
                if (i > 0) subsSpan.appendChild(RecentSubsExt.View.createBr());
                var tagPattern  = /<(?!br\s*\/?)[^>]+>/g;
                var wordPattern = /([a-zA-Z'-]+)/g;
                var formatted = lines[i].replace(tagPattern, '')
                    .replace(wordPattern, '<span><span class=\'word\'>$1</span></span>');
                $(subsSpan).append(formatted);
            }
        },

        createDiv: function(className) {
            var div = document.createElement('div');
            div.className = className;
            return div;
        },
        createSpan: function(className) {
            var span = document.createElement('span');
            span.className = className;
            return span;
        },
        createBr: function() {
            return document.createElement('br');
        }
    },

    Controller: {
        onPause: function() {
            var elementWithDataId = $('.js-menu-episode.current').get(0);//won't be null if not the single movie (instead there're several episodes)
            if (elementWithDataId == null) elementWithDataId = $('.video-js').get(0);
            var dataId = elementWithDataId.getAttribute('data-id');
            if (RecentSubsExt.Model.isLoaded(dataId)) RecentSubsExt.Controller.showRecentSubs();
            else {
                var parentElement = $(document);
                var episode = $('.js-media-wrapper').filter(function() {return $(this).attr('data-id') == dataId}).get(0);
                if (episode) parentElement = $(episode);
                var subsUrl = $(parentElement).find('i.active-sub.en.flag').get(0).parentElement.href;
                RecentSubsExt.Model.load(dataId, subsUrl, RecentSubsExt.Controller.showRecentSubs);
            }
        },
        onPlay: function() {
            RecentSubsExt.View.clearExtSubs();
            RecentSubsExt.View.showNativeSubs();
        },
        showRecentSubs: function() {
            var timeDisplayText = $('.vjs-current-time-display').text();
            var timeString = timeDisplayText.substr(timeDisplayText.lastIndexOf(' ') + 1).trim();
            var currentTimeInMs = RecentSubsExt.Controller.convertTimeStringToMs(timeString);
            var recentSubs = RecentSubsExt.Model.getRecentSubs(currentTimeInMs, 5);
            RecentSubsExt.View.showExtSubs(recentSubs);
        },
        convertTimeStringToMs: function(timeString) {
            var parts = timeString.split(':');
            var ms = 0;
            if      (parts.length == 2) ms =  Number(parts[0]) * 60 + Number(parts[1]);
            else if (parts.length == 3) ms = (Number(parts[0]) * 60 + Number(parts[1])) * 60 + Number(parts[2]);
            return ms * 1000;
        }
    }
}
