

//handles font size changing
function handleFontsizeChange(diff) {
  //get prev size
  try {
    var frame = $(window.frames[0].document).find('html');
    var fsize = frame.get(0).style.fontSize;
    if (!fsize) fsize = 100; else fsize = parseInt(fsize);
  } catch(e) {
    fsize = window.savedFontSize;
    if (!fsize) fsize = 100;
  }
  //handle increase/decrease
  if  (diff == "reset") fsize = 100;
  else                  fsize = fsize + diff;
  if      (fsize > 200) fsize = 200; 
  else if (fsize < 50)  fsize = 50;
  //set new font and resize
  if (frame) frame.css('font-size',fsize+"%");
  $('#fontcontrol span').text(fsize+"%");
  $('.feedbackmsg-wrapper').css('font-size',fsize+"%");
  saveFontSize(fsize);
  resizeIFrame();
  reAdjustScroll();
}


//readjusts scroll top based on how much the document's height based
//due to font adjustment
function reAdjustScroll() {
  if (window.adjustingScroll) clearTimeout(window.adjustingScroll);
  var prevHeight = $('iframe').height();
  var prevScroll = $('#area').scrollTop();
  window.adjustingScroll = setTimeout(function(){
    var diff   = $('iframe').height()/prevHeight;
    var scroll = prevScroll*diff;
    $('#area').scrollTop(scroll);
  },500);
}


//ctrl + mouse wheel 
function resizeFontWheel(e){
  if (!e.ctrlKey) return; e.preventDefault();e.stopPropagation();
  if(e.originalEvent.wheelDelta > 0) $('#fontcontrol img').eq(1).click();
  else                               $('#fontcontrol img').eq(0).click();
}

//ctrl + keyboard
function resizeFontKey(e){
  if (!e.ctrlKey) return; var key = e.keyCode; 
  if      (key == 107) $('#fontcontrol img').eq(1).click();
  else if (key == 109) $('#fontcontrol img').eq(0).click();
  else if (key == 48 || key == 96) $('#fontcontrol span').click();
}


//chrome app only
function saveFontSize(fsize) {
  window.savedFontSize = fsize;
  if (!isChromeApp()) return;
  chrome.storage.local.set({'fontSize': fsize});
}

//chrome app only
function restoreFontSize(fsize) {
  if (!isChromeApp()) return;
  if (!fsize) return;
  window.savedFontSize = fsize;
  $('#fontcontrol span').text(fsize+"%");
}