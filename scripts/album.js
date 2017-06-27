var setCurrentTimeInPlayerBar = function(currentTime) {
  $('.player-bar .current-time').text(currentTime);
};
var setTotalTimeInPlayerBar = function(totalTime) {
  $('.player-bar .total-time').text(totalTime);
};
var filterTimeCode = function(timeInSeconds) {
  var min = Math.floor(parseFloat(timeInSeconds) / 60);
  var sec = Math.floor(parseFloat(timeInSeconds) % 60);
  return min + ':' + sec;

};
var setSong = function(songNumber) {
    if (currentSoundFile) {
        currentSoundFile.stop();
    }
    currentlyPlayingSongNumber = parseInt(songNumber);
    currentSongFromAlbum = currentAlbum.songs[songNumber - 1];
    currentSoundFile = new buzz.sound(currentSongFromAlbum.audioUrl, {
        formats: ['mp3'],
        preload: true
    });
    setVolume(currentVolume);
};
var seek = function(time) {
    if (currentSoundFile) {
        currentSoundFile.setTime(time);
    }
};
var setVolume = function(volume) {
    if (currentSoundFile) {
        currentSoundFile.setVolume(volume);
    }
};
var getSongNumberCell = function(number) {
    return $('.song-item-number[data-song-number="' + number + '"]');
};
// We declare the objects before the function because the createSongRow function uses the information stored in the album objects.
// The createSongRow function assigns our previously static song row template to a variable named template and returns it. Instead of statically declaring the song number, name, or length, our function takes them as arguments and populates the song row template accordingly.
var createSongRow = function(songNumber, songName, songLength) {
    var template =
        '<tr class="album-view-song-item">' +
        '  <td class="song-item-number" data-song-number="' + songNumber + '">' + songNumber + '</td>' +
        '  <td class="song-item-title">' + songName + '</td>' +
        '  <td class="song-item-duration">' + filterTimeCode(songLength) + '</td>' +
        '</tr>';

    var $row = $(template);
    var clickHandler = function() {

        var songNumber = parseInt($(this).attr('data-song-number'));

        if (currentlyPlayingSongNumber !== null) {
            // Revert to song number for currently playing song because user started playing new song.
            var currentlyPlayingCell = getSongNumberCell();
            currentlyPlayingCell.html(currentlyPlayingSongNumber);
        }
        if (currentlyPlayingSongNumber !== songNumber) {
            // Switch from Play -> Pause button to indicate new song is playing.
            setSong(songNumber);
            currentSoundFile.play();
            updateSeekBarWhileSongPlays();
            currentSongFromAlbum = currentAlbum.songs[songNumber - 1];
            $(this).html(pauseButtonTemplate);
            updatePlayerBarSong();


            var $volumeFill = $('.volume .fill');
            var $volumeThumb = $('.volume .thumb');
            $volumeFill.width(currentVolume + '%');
            $volumeThumb.css({
                left: currentVolume + '%'
            });

        } else if (currentlyPlayingSongNumber === songNumber) {
            if (currentSoundFile.isPaused()) {
                $(this).html(pauseButtonTemplate);
                $('.main-controls .play-pause').html(playerBarPauseButton);
                currentSoundFile.play();
                updateSeekBarWhileSongPlays();
            } else {
                $(this).html(playButtonTemplate);
                $('.main-controls .play-pause').html(playerBarPlayButton);
                currentSoundFile.pause();
            }
        }
    };
    var onHover = function(event) {

        var songNumberCell = $(this).find('.song-item-number');
        var songNumber = parseInt(songNumberCell.attr('data-song-number'));

        if (songNumber !== currentlyPlayingSongNumber) {
            songNumberCell.html(playButtonTemplate);
        }
    };

    var offHover = function(event) {
        var songNumberCell = $(this).find('.song-item-number');
        var songNumber = parseInt(songNumberCell.attr('data-song-number'));

        if (songNumber !== currentlyPlayingSongNumber) {
            songNumberCell.html(songNumber);
        }
        console.log("songNumber type is " + typeof songNumber + "\n and currentlyPlayingSongNumber type is " + typeof currentlyPlayingSongNumber);
    };
    // #1 The jQuery find() method at #1 is similar to querySelector(). We call it here to find the element with the .song-item-number class that's contained in whichever row is clicked. jQuery's click event listener executes the callback we pass to it when the target element is clicked. Notice that clickHandler() no longer takes any arguments, which we'll address in our clickHandler() refactor.
    $row.find('.song-item-number').click(clickHandler);
    // #2 The hover() event listener at #2 combines the mouseover and mouseleave functions we relied on previously. The first argument is a callback that executes when the user mouses over the $row element and the second is a callback executed when the mouse leaves $row.
    $row.hover(onHover, offHover);
    // #3 we return $row, which is created with the event listeners attached.
    return $row;
};
var setCurrentAlbum = function(album) {
    currentAlbum = album;
    var $albumTitle = $('.album-view-title');
    var $albumArtist = $('.album-view-artist');
    var $albumReleaseInfo = $('.album-view-release-info');
    var $albumImage = $('.album-cover-art');
    var $albumSongList = $('.album-view-song-list');

    $albumTitle.text(album.title);
    $albumArtist.text(album.artist);
    $albumReleaseInfo.text(album.year + ' ' + album.label);
    $albumImage.attr('src', album.albumArtUrl);

    $albumSongList.empty();
    for (var i = 0; i < album.songs.length; i++) {
        var $newRow = createSongRow(i + 1, album.songs[i].title, album.songs[i].duration);
        $albumSongList.append($newRow);
    }
};
var updateSeekBarWhileSongPlays = function() {
    if (currentSoundFile) {
        // #11 we bind() the timeupdate event to currentSoundFile. timeupdate is a custom Buzz event that fires repeatedly while time elapses during song playback.
        currentSoundFile.bind('timeupdate', function(event) {
            // #12  we use a new method for calculating the seekBarFillRatio. We use Buzz's  getTime() method to get the current time of the song and the getDuration() method for getting the total length of the song. Both values return time in seconds.
            var seekBarFillRatio = this.getTime() / this.getDuration();
            var $seekBar = $('.seek-control .seek-bar');

            updateSeekPercentage($seekBar, seekBarFillRatio);
            setCurrentTimeInPlayerBar(filterTimeCode(this.getTime()));
        });
    }
};
var updateSeekPercentage = function($seekBar, seekBarFillRatio) {
    var offsetXPercent = seekBarFillRatio * 100;
    // #1 At #1, we use the built-in JavaScript Math.max() function to make sure our percentage isn't less than zero and the Math.min() function to make sure it doesn't exceed 100.
    offsetXPercent = Math.max(0, offsetXPercent);
    offsetXPercent = Math.min(100, offsetXPercent);

    // #2 At #2, we convert our percentage to a string and add the % character. When we set the width of the .fill class and the left value of the .thumb class, the CSS interprets the value as a percent instead of a unit-less number between 0 and 100.
    var percentageString = offsetXPercent + '%';
    $seekBar.find('.fill').width(percentageString);
    $seekBar.find('.thumb').css({
        left: percentageString
    });
};
var setupSeekBars = function() {
    // #6  At #6, we are using jQuery to find all elements in the DOM with a class of "seek-bar" that are contained within the element with a class of "player-bar". This will return a jQuery wrapped array containing both the song seek control and the volume c
    var $seekBars = $('.player-bar .seek-bar');
    $seekBars.click(function(event) {

        var offsetX = event.pageX - $(this).offset().left;
        var barWidth = $(this).width();
        var seekBarFillRatio = offsetX / barWidth;

        if ($(this).parent().attr('class') == 'seek-control') {
            seek(seekBarFillRatio * currentSoundFile.getDuration());
        } else {
            setVolume(seekBarFillRatio * 100);
        }

        updateSeekPercentage($(this), seekBarFillRatio);
    });
    $seekBars.find('.thumb').mousedown(function(event) {
        var $seekBar = $(this).parent();

        $(document).bind('mousemove.thumb', function(event) {
            var offsetX = event.pageX - $seekBar.offset().left;
            var barWidth = $seekBar.width();
            var seekBarFillRatio = offsetX / barWidth;

            if ($seekBar.parent().attr('class') == 'seek-control') {
                seek(seekBarFillRatio * currentSoundFile.getDuration());
            } else {
                setVolume(seekBarFillRatio);
            }

            updateSeekPercentage($seekBar, seekBarFillRatio);
        });
        // #3 At #3, we see a new property on the event object called pageX. This is a jQuery-specific event value, which holds the X (or horizontal) coordinate at which the event occurred (think of the X-Y coordinate plane that you hated in Algebra class).
        // #4 At #4, we divide offsetX by the width of the entire bar to calculate  seekBarFillRatio.
        // #5 Finally, at #5, we pass $(this) as the $seekBar argument and seekBarFillRatio for its eponymous argument to updateSeekBarPercentage().
        // #7 At #7, we find elements with a class of .thumb inside our $seekBars and add an event listener for the mousedown event. A click event fires when a mouse is pressed and released quickly, but the mousedown event will fire as soon as the mouse button is pressed down. In contrast to this, the mouseup event is the opposite: it fires when the mouse button is released. jQuery allows us access to a shorthand method of attaching the mousedown event by calling mousedown on a jQuery collection.
        // #8 At #8, we are taking the context of the event and wrapping it in jQuery. In this scenario, this will be equal to the .thumb node that was clicked. Because we are attaching an event to both the song seek and volume control, this is an important way for us to determine which of these nodes dispatched the event. We can then use the  parent method, which will select the immediate parent of the node. This will be whichever seek bar this .thumb belongs to.
        // #9 #9 introduces a new way to track events, jQuery's bind() event. bind() behaves similarly to addEventListener() in that it takes a string of an event instead of wrapping the event in a method like we've seen with all other jQuery events thus far. We use bind() because it allows us to namespace event listeners (we'll discuss namespacing, shortly). The event handler inside the bind() call is identical to the  click behavior.
        // #10 Finally, at #10, we bind the mouseup event with a .thumb namespace. The event handler uses the unbind() event method, which removes the previous event listeners that we just added. If we fail to unbind() them, the thumb and fill would continue to move even after the user released the mouse. Comment out this block to demonstrate the unintended behavior.
        $(document).bind('mouseup.thumb', function() {
            $(document).unbind('mousemove.thumb');
            $(document).unbind('mouseup.thumb');
        });
    });
};
var trackIndex = function(album, song) {
    return album.songs.indexOf(song);
};
var updatePlayerBarSong = function() {

    $('.currently-playing .song-name').text(currentSongFromAlbum.title);
    $('.currently-playing .artist-name').text(currentAlbum.artist);
    $('.currently-playing .artist-song-mobile').text(currentSongFromAlbum.title + " - " + currentAlbum.artist);
    $('.main-controls .play-pause').html(playerBarPauseButton);
    setTotalTimeInPlayerBar(filterTimeCode(currentSongFromAlbum.duration));
};
var nextSong = function() {
    var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
    // Note that we're _incrementing_ the song here
    currentSongIndex++;

    if (currentSongIndex >= currentAlbum.songs.length) {
        currentSongIndex = 0;
    }

    // Save the last song number before changing it
    var lastSongNumber = currentlyPlayingSongNumber;

    // Set a new current song
    setSong(currentSongIndex + 1);
    currentSoundFile.play();
    updateSeekBarWhileSongPlays();
    // Update the Player Bar information
    updatePlayerBarSong();

    var $nextSongNumberCell = getSongNumberCell();
    var $lastSongNumberCell = $('.song-item-number[data-song-number="' + lastSongNumber + '"]');

    $nextSongNumberCell.html(pauseButtonTemplate);
    $lastSongNumberCell.html(lastSongNumber);
};

// Album button templates
var playButtonTemplate = '<a class="album-song-button"><span class="ion-play"></span></a>';
var pauseButtonTemplate = '<a class="album-song-button"><span class="ion-pause"></span></a>';
var playerBarPlayButton = '<span class="ion-play"></span>';
var playerBarPauseButton = '<span class="ion-pause"></span>';
// brought albumImage var into global scope. and made array of albums.
var albumImage = document.getElementsByClassName('album-cover-art')[0];
var albumList = [albumPicasso, albumMarconi];
// stores state of playing songs
// We now have a set of variables in the global scope that hold current song and album information
var currentAlbum = null;
var currentlyPlayingSongNumber = null;
var currentSongFromAlbum = null;
var currentSoundFile = null;
var currentVolume = 80;

var $previousButton = $('.main-controls .previous');
var $nextButton = $('.main-controls .next');

var previousSong = function() {
    var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
    // Note that we're _decrementing_ the index here
    currentSongIndex--;

    if (currentSongIndex < 0) {
        currentSongIndex = currentAlbum.songs.length - 1;
    }
    // Save the last song number before changing it
    var lastSongNumber = currentlyPlayingSongNumber;
    // Set a new current song
    setSong(currentSongIndex + 1);
    currentSoundFile.play();
    updateSeekBarWhileSongPlays();
    // Update the Player Bar information
    updatePlayerBarSong();
    $('.main-controls .play-pause').html(playerBarPauseButton);

    var $previousSongNumberCell = getSongNumberCell();
    var $lastSongNumberCell = $('.song-item-number[data-song-number="' + lastSongNumber + '"]');

    $previousSongNumberCell.html(pauseButtonTemplate);
    $lastSongNumberCell.html(lastSongNumber);
};

$(document).ready(function() {
    setCurrentAlbum(albumPicasso);
    setupSeekBars();
    $previousButton.click(previousSong);
    $nextButton.click(nextSong);
})
