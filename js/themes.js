//sets current theme for main page and reader iframe
function setTheme(theme) {
  if (!theme) theme = "Dark1";
  $('body').removeClass().addClass(theme);
  try {
    var fdoc = $(window.frames[0].document);
    fdoc.find('body').removeClass().addClass(theme);
  } catch(e) {}
  saveTheme(theme);
}


//chrome app only
function saveTheme(theme) {
  window.savedTheme = theme;
  if (!isChromeApp()) return;
  chrome.storage.local.set({'savedTheme': theme});
}


//chrome app only
function restoreTheme() {
  if (!isChromeApp()) {setTheme();return;}
  chrome.storage.local.get(function(data){
    window.savedTheme = data.savedTheme;
    console.log(window.savedTheme);
    setTheme(window.savedTheme);
  });
}

//gets themes by analyzing themes.scss file
function getThemes() {
  if (!isChromeApp()) {//static definitions for non-chrome app
    addThemes([
      {label:"Dark1",  color:"#353030"},
      {label:"Dark2",  color:"#343c47"},
      {label:"Light1", color:"#f4f4f4"}
    ]);
    return;
  }
  $.ajax({url:"scss/themes.scss"}).done(function(resp){
    var temp   = resp.split("body.");
    var themes = [];
    for (var i in temp) {
      if (i==0) continue;
      var theme = temp[i].split("{");
      var label = theme[0].trim();
      var color = theme[1].split("$bgcol1:")[1].split(";")[0];
      themes.push({label:label,color:color});
    }
    addThemes(themes);
  });
}

//add discovered themes to UI selector
function addThemes(themes) {
  var els = [];
  for (var i in themes) {
    var t = themes[i];
    els.push('<div style="background:'+t.color+'" label="'+t.label+'" title="'+t.label+' theme"></div>');
  }
  $('#themecontrol').html(els.join(""));
  $('#themecontrol div').click(function(){
    setTheme($(this).attr('label'));
  });
}