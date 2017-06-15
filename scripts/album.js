// Example Album 1
var albumPicasso = {
  title: 'The Colors',
  artist: 'Pablo Picasso',
  label: 'Cubism',
  year: '1881',
  albumArtUrl: 'assets/images/album_covers/01.png',
  songs: [
      { title: 'Blue', duration: '4:26' },
      { title: 'Green', duration: '3:14' },
      { title: 'Red', duration: '5:01' },
      { title: 'Pink', duration: '3:21' },
      { title: 'Magenta', duration: '2:15' },
  ]
};
// Example Album 2
 var albumMarconi = {
     title: 'The Telephone',
     artist: 'Guglielmo Marconi',
     label: 'EM',
     year: '1909',
     albumArtUrl: 'assets/images/album_covers/20.png',
     songs: [
         { title: 'Hello, Operator?', duration: '1:01' },
         { title: 'Ring, ring, ring', duration: '5:01' },
         { title: 'Fits in your pocket', duration: '3:21'},
         { title: 'Can you hear me now?', duration: '3:14' },
         { title: 'Wrong phone number', duration: '2:15'}
     ]
 };
 // Example Album 3
   var albumJackson = {
       title: 'The Five',
       artist: 'King of Pop',
       label: 'EM',
       year: '1980',
       albumArtUrl: 'assets/images/album_covers/20.png',
       songs: [
           { title: 'Mirror Man', duration: '2:56' },
           { title: 'Zombie Dance', duration: '3:01' },
           { title: 'Change', duration: '4:45'},
           { title: 'Moon Cruise', duration: '2:34' },
           { title: 'Brown or Yellow', duration: '2:15'}
       ]
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

    return $(template);
 };
 var setCurrentAlbum = function(album) {

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
 //  that keeps traversing the DOM upward until a parent with a specified class name is found.
 var findParentByClassName = function(element, targetClass) {
    if (element) {
        var currentParent = element.parentElement;
        while (currentParent.className !== targetClass && currentParent.className !== null) {
            currentParent = currentParent.parentElement;
        }
        return currentParent;
    }
};
//findParentByClassName function enables us to write a larger function that will always return the song item. This method, which we'll call getSongItem, should take an element and, based on that element's class name(s), use a switch statement that returns the element with the .song-item-number class.
var getSongItem = function(element) {
    switch (element.className) {
        case 'album-song-button':
        case 'ion-play':
        case 'ion-pause':
            return findParentByClassName(element, 'song-item-number');
        case 'album-view-song-item':
            return element.querySelector('.song-item-number');
        case 'song-item-title':
        case 'song-item-duration':
            return findParentByClassName(element, 'album-view-song-item').querySelector('.song-item-number');
        case 'song-item-number':
            return element;
        default:
            return;
    }
};
var clickHandler = function(targetElement) {
  var songItem = getSongItem(targetElement);

  if (currentlyPlayingSong === null) {
      songItem.innerHTML = pauseButtonTemplate;
      currentlyPlayingSong = songItem.getAttribute('data-song-number');
  } else if (currentlyPlayingSong === songItem.getAttribute('data-song-number')) {
      songItem.innerHTML = playButtonTemplate;
      currentlyPlayingSong = null;
  } else if (currentlyPlayingSong !== songItem.getAttribute('data-song-number')) {
      var currentlyPlayingSongElement = document.querySelector('[data-song-number="' + currentlyPlayingSong + '""]');
      currentlyPlayingSongElement.innerHTML = currentlyPlayingSongElement.getAttribute('data-song-number');
      songItem.innerHTML = pauseButtonTemplate;
      currentlyPlayingSong = songItem.getAttribute('data-song-number');
  }
};
 // Elements we'll be adding listeners to
 var songListContainer = document.getElementsByClassName('album-view-song-list')[0];
 var songRows = document.getElementsByClassName('album-view-song-item');
 // Album button templates
 var playButtonTemplate = '<a class="album-song-button"><span class="ion-play"></span></a>';
 var pauseButtonTemplate = '<a class="album-song-button"><span class="ion-pause"></span></a>';
 // brought albumImage var into global scope. and made array of albums.
 var albumImage = document.getElementsByClassName('album-cover-art')[0];
 var albumList = [albumPicasso, albumMarconi, albumJackson];
 // stores state of playing songs
 var currentlyPlayingSong = null;


 window.onload = function() {
      setCurrentAlbum(albumPicasso);

      // Change the content from the number to the play button's HTML
      // The target property on the event object at #1 stores the DOM element where the event occurred.
      // Only target individual song rows during event delegation
      songListContainer.addEventListener('mouseover', function(event) {
        if (event.target.parentElement.className === 'album-view-song-item') {
            var songItem = getSongItem(event.target);

            if (songItem.getAttribute('data-song-number') !== currentlyPlayingSong) {
                songItem.innerHTML = playButtonTemplate;
            }
    }

      });

      for (var i = 0; i < songRows.length; i++) {
        songRows[i].addEventListener('mouseleave', function(event) {
          // Reverts content back to number
          //#1 we've cached the song item that we're leaving in a variable. Referencing  getSongItem() repeatedly causes multiple queries that can hinder performance. We've done the same with the song number.
          var songItem = getSongItem(event.target);
          var songItemNumber = songItem.getAttribute('data-song-number');
          //#2 we've added the conditional that checks that the item the mouse is leaving is not the current song, and we only change the content if it isn't.
          if (songItemNumber !== currentlyPlayingSong) {
            songItem.innerHTML = songItemNumber;

          }
        });
        songRows[i].addEventListener('click', function(event) {
            clickHandler(event.target);
        });
      }

      var index = 1;
     albumImage.addEventListener('click', function (event) {
       setCurrentAlbum(albumList[index]);
       index ++;
       if (index === albumList.length) {
           index = 0;
       }



     });



  }
