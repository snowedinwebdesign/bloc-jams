var setSong = function (songNumber) {
    if (currentSoundFile) {
      currentSoundFile.stop();
    }
    currentlyPlayingSongNumber = parseInt(songNumber);
    currentSongFromAlbum = currentAlbum.songs[songNumber -1];
    currentSoundFile = new buzz.sound(currentSongFromAlbum.audioUrl, {
      formats: [ 'mp3' ],
      preload: true
    });
    setVolume(currentVolume);
};
var setVolume = function (volume) {
    if (currentSoundFile) {
      currentSoundFile.setVolume(volume);
    }
};
var getSongNumberCell = function (number) {
  return $('.song-item-number[data-song-number="' + number + '"]');

};
// We declare the objects before the function because the createSongRow function uses the information stored in the album objects.
 // The createSongRow function assigns our previously static song row template to a variable named template and returns it. Instead of statically declaring the song number, name, or length, our function takes them as arguments and populates the song row template accordingly.
 var createSongRow = function(songNumber, songName, songLength) {
    var template =
      '<tr class="album-view-song-item">'
     + '  <td class="song-item-number" data-song-number="' + songNumber + '">' + songNumber + '</td>'
     + '  <td class="song-item-title">' + songName + '</td>'
     + '  <td class="song-item-duration">' + songLength + '</td>'
     +  '</tr>'
     ;

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
		         $(this).html(pauseButtonTemplate);
		         setSong(songNumber);
             currentSoundFile.play();
             updatePlayerBarSong();
	     } else if (currentlyPlayingSongNumber === songNumber) {
          if (currentSoundFile.isPaused()) {
            $(this).html(pauseButtonTemplate);
            $('.main-controls .play-pause').html(playerBarPauseButton);
            currentSoundFile.play();
          } else {
              $(this).html(playButtonTemplate);
              $('.main-controls .play-pause').html(playerBarPlayButton);
              currentSoundFile.pause();
          }
	     }
   };

    var onHover = function(event) {
       var songNumberCell =$(this).find('.song-item-number');
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
 var trackIndex = function(album, song) {
     return album.songs.indexOf(song);
 };
 var updatePlayerBarSong = function() {

    $('.currently-playing .song-name').text(currentSongFromAlbum.title);
    $('.currently-playing .artist-name').text(currentAlbum.artist);
    $('.currently-playing .artist-song-mobile').text(currentSongFromAlbum.title + " - " + currentAlbum.artist);
    $('.main-controls .play-pause').html(playerBarPauseButton);

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


    // Update the Player Bar information
    updatePlayerBarSong();

    var $nextSongNumberCell = getSongNumberCell();
    var $lastSongNumberCell = $('.song-item-number[data-song-number="' + lastSongNumber + '"]');

    $nextSongNumberCell.html(pauseButtonTemplate);
    $lastSongNumberCell.html(lastSongNumber);
};
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

    // Update the Player Bar information
    updatePlayerBarSong();

    $('.main-controls .play-pause').html(playerBarPauseButton);

    var $previousSongNumberCell = getSongNumberCell();
    var $lastSongNumberCell = $('.song-item-number[data-song-number="' + lastSongNumber + '"]');

    $previousSongNumberCell.html(pauseButtonTemplate);
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



 $(document).ready(function() {
      setCurrentAlbum(albumPicasso);
      $previousButton.click(previousSong);
      $nextButton.click(nextSong);

  });
