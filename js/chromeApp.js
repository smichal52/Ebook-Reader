
function openFileSelectApp() {
  if (!isChromeApp()) return false;
  chrome.fileSystem.chooseEntry({
    type:'openFile',
    accepts:[
      {extensions:["epub"]}
    ]
  }, handleFileSelectApp);
  return true;
}


//handles file selection when in chrome app
function handleFileSelectApp(fileEntry, lastPage) {
  if (!fileEntry) return;
  var lastBook = chrome.fileSystem.retainEntry(fileEntry);
  chrome.storage.local.set({'lastBook': lastBook});
  window.lastBook = lastBook;
  //read file from fileentry
  fileEntry.file(callback);
  function callback(file) {
    var reader = new FileReader();
    reader.onload = function (e) {
        window.loadBookData = e.target.result;
        loadBook(file.name, lastPage);
    }.bind(this);
    reader.readAsArrayBuffer(file);
  }
}


//restores last opened book when in chrome app
function restoreLastBook() {
  if (!isChromeApp()) return false;
  chrome.storage.local.get(callback);
  function callback(data) {
    if (!data.lastBook) return;
    restoreFontSize(data.fontSize);
    chrome.fileSystem.restoreEntry(data.lastBook, function(fileEntry){
      if (!fileEntry) return;
      handleFileSelectApp(fileEntry, data.lastPage);
      window.scrollPoint = data.scrollPoint;
    });
  }
  return true;
}

//saves current page for next app launch
function saveCurrentPage() {
  if (!isChromeApp()) return;
  chrome.storage.local.set({'lastPage': window.currentPage});
  //save page to library
  saveLibraryPage();
}

//returns if running inside chrome app
function isChromeApp() {
  return (window.chrome && chrome.app && chrome.app.runtime);
}

//save scroll point
$("#area").scroll(function(e) {
  if (!isChromeApp()) return;
  if (window.autoSavingScroll) clearTimeout(window.autoSavingScroll);
  window.autoSavingScroll = setTimeout(function(){
    chrome.storage.local.set({scrollPoint: $("#area").scrollTop()});
  });
});