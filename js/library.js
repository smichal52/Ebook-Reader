

function addToLibrary(title, key) {
  if (!isChromeApp()) return;
  if (!window.savedLibrary) window.savedLibrary = [];
  if (!window.libraryIndex) window.libraryIndex = [];
  //quick indexed check if book is saved;
  if (window.libraryIndex[title]) return;
  window.libraryIndex[title] = true;
  
  //normal slow look
  for (var i in window.savedLibrary) 
    if (window.savedLibrary[i].title == title) return;
  getBookCover(callback);
  function callback(img) {
    window.savedLibrary.push({
      title: title,
      key:   key,
      img:   img
    });
    chrome.storage.local.set({
      'library': window.savedLibrary
    });
  }
}


function loadLibrary() {
  if (!isChromeApp()) return;
  chrome.storage.local.get(callback);
  function callback(data) {
    window.savedLibrary = data.library;
    console.log(data.library);
  }
}

//gets bookcover to use as thumbnail
function getBookCover(callback) {
  try     {var trueUrl = Book.zip.getUrl(Book.cover)._result;}
  catch(e){
    //try to get first available image
    var files = Book.zip.urlCache;
    for (var i in files) {
      if (i.endsWith(".jpg") || i.endsWith(".jpeg") || i.endsWith(".png")) {
        getDataUri(files[i], callback);return;
      }
    }
    //no cover
    var trueUrl = "assets/nocover.png";
  }
  getDataUri(trueUrl, callback);
}


function getDataUri(url, callback) {
    var image = new Image();
    image.onload = function () {
        var canvas = document.createElement('canvas');
        canvas.width = 200; // or 'width' if you want a special/scaled size
        canvas.height = 280; // or 'height' if you want a special/scaled size
        canvas.getContext('2d').drawImage(this, 0, 0, 200, 280);
        callback(canvas.toDataURL('image/png'));//get as data URI
    };
    image.src = url;
}

function toggleLibrary() {
  if (!isChromeApp()) {cAlert("Library is available only on the Chrome App version",3000);return;}
  if (window.savedLibrary && window.savedLibrary.length) renderLibrary();
  if ($('#library').is(":hidden")) $('#library').fadeIn(300);
  else                             $('#library').fadeOut(300);
} 

function renderLibrary() {
  var html = [];
  function compare(a,b) {
    if (a.title < b.title) return -1;
    if (a.title > b.title) return  1;
    return 0;
  }
  window.savedLibrary.sort(compare);
  for (var i in window.savedLibrary) {
    var b = window.savedLibrary[i];
    var p = b.lastPage?"page='"+b.lastPage+"'":"";
    var l = b.lastPage?" (page "+b.lastPage+")":"";
    var f = b.lastPage?"<br><span>page "+b.lastPage+"</span>":"";
    html.push('<li><label>'+b.title+f+'</label><br/><img height="280" src="'+b.img+
              '" title="Open this E-book'+l+'\n(Right click to remove)" key="'+b.key+'" '+p+'></li>');
  }
  if (html.length == 0) return;
  $('#library > ul').html(html.join(""));
  $('#library > ul > li > img').click(function(){
    $('#library').fadeOut(300);
    selectFromLibrary($(this).attr('key'),$(this).attr('page'));
  });
  $('#library > ul > li > img').on('contextmenu', function(e) {
    e.preventDefault();e.stopPropagation();
    removeFromLibrary(this);
  });
}

function selectFromLibrary(bookID, page) {
  if (!isChromeApp()) return;
  chrome.fileSystem.restoreEntry(bookID, function(fileEntry){
    if (!fileEntry) return;
    handleFileSelectApp(fileEntry, page);
  });
}

function removeFromLibrary(book) {
  if (!isChromeApp()) return;
  var key = $(book).attr('key');
  for (var i in window.savedLibrary) {
    var b = window.savedLibrary[i];
    if (b.key == key) {
      window.savedLibrary.splice(i,1);
      chrome.storage.local.set({'library': window.savedLibrary});
      break;
    }
  }
  $(book).closest('li').remove();
}

function saveLibraryPage() {
  var l = window.savedLibrary;
  for (var i in l) {
    var b = l[i];
    if (b.title == Book.metadata.bookTitle) {
      b.lastPage = window.currentPage;
      chrome.storage.local.set({
        'library': window.savedLibrary
      });
      return;
    }
  }
}

function getLibraryPage() {
  var l = window.savedLibrary;
  for (var i in l) {
    var b = l[i];
    if (b.title == Book.metadata.bookTitle) {
      return b.lastPage;
    }
  }
  return false;
}