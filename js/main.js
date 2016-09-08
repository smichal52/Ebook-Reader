$(prepare);
var Book;

//parse url for info and setup some things
function prepare() {
  restoreTheme();
  loadLibrary();
  getThemes();
  setEvents();
  //restoring book for chrome app only
  if (restoreLastBook()) return;
  var bookname = location.href.split("#")[1];
  if (!bookname) {init();return;}
  bookname = Base64.decode(bookname);
  var page = location.href.split("#")[2];
  if (!page) page = 1;
  //show information of last book beeing read if not chrome app
  $('#prompt').html("Opened book was <br><span>"+bookname+"</span><br><span>on page "+page+"</span>");
  window.rememberedPage = page;
  window.rememberedBook = bookname;
}


//sets various events
function setEvents() {
  $('#prompt').rclick(openFileSelect); 
  $('#fstoggle').click(toggleFullScreen);
  $('#dropzone').rclick(openFileSelect).change(handleFileSelect);
  $('#prevPage').click(prevPage);
  $('#nextPage').click(nextPage);
  $('#menuicon').click(toggleMenu);
  $('#libraryicon').click(toggleLibrary);
  $('#library').click(function(){$(this).fadeOut(300);});
  //font handling
  $('#fontcontrol img').eq(0).click(function(){handleFontsizeChange(-5);});
  $('#fontcontrol img').eq(1).click(function(){handleFontsizeChange(5);});
  $('#fontcontrol span').click(function(){handleFontsizeChange("reset");});
  $(document).bind('keyup',window.resizeFontKey);
  $(document).bind('mousewheel',window.resizeFontWheel);
  //hide pager for a little while with middle click
  $('#prevPage,#nextPage').mousedown(function(e){
    if (e.which == 1) $('#prevPage,#nextPage').show();
    if (e.which != 2) return; var $el = $(this);
    $el.hide();setTimeout(function(){$el.show();},5000);
  });
}





//loads, renders and sets up book
function init() {
  if (!window.filename) return;
  $('#area').css('opacity',0);
  setTimeout(function(){$('#area').css('opacity',1);},500);
  //initialize book
  var opts = {bookPath: window.loadBookData};
  $('#prompt').hide();
  window.Book = ePub(opts);
  Book.forceSingle();
  Book.renderTo("innerArea");
  Book.on('book:ready', callback);
  //handle content when it's ready
  function callback() {
    //start from remembered page, if opening same book as last time
    if (window.filename == window.rememberedBook) 
      window.startFromPage = window.rememberedPage;
    if (window.startFromPage) window.currentPage = window.startFromPage;
    else                      window.currentPage = 1;
    //check if saved in library page
    var page = getLibraryPage();
    if (page) window.currentPage = page;
    Book.displayChapter(window.currentPage-1);
    setTimeout(integrateReader,200);
    setTimeout(showPageInfo,200);
  }
}



//show info on page top and setup current url accordingly
function showPageInfo() {
  if (!Book.spine) return;
  //get book and chapter info
  var title = Book.metadata.bookTitle;
  var index = Book.spinePos;
  var len   = Book.spine.length;
  var spine = Book.spine[index];
  var toc   = {};
  var desc  = spine.id.split(".")[0];
  for (var i in Book.toc) {
    if (Book.toc[i].spinePos == index) {
      toc  = Book.toc[i];
      desc = toc.label;
      break;
    }
  }
  //render the info and save current page index
  $('#info').html('<span class="s1">'+title+'</span><span class="s2">'+desc+'</span><span class="s3">page '
          +(index+1)+' of '+len+'</span><span class="s4">jump to</span><input type="text" maxlength="4" placeholder="page">');
  $('#info input').keydown(function(e){if (e.keyCode == 13) jumpToPage(this.value);});
  $('title').text(title);
  saveCurrentPage();
  //al the information is here to save book to library
  addToLibrary(title,window.lastBook);
  if (isChromeApp()) return;
  //modify current url if not in chrome app
  title      = Base64.encode(window.filename);
  var newloc = location.href.split("#")[0]+"#"+title+"#"+(index+1);
  if (newloc == location.href) return;
  window.history.pushState("", "page", newloc);
}

//jumps to specific page in book
function jumpToPage(page) {
  page = parseInt(page);
  if (isNaN(page)) return;
  if (page > Book.spine.length) return;
  if (page < 1) return;
  window.currentPage = page-1;
  nextPage();
  setTimeout(function(){$('#info input').focus();},250);
}


//loads nextPage of book
function nextPage() {
  if (window.changingPage) return;
  window.changingPage = true;
  setTimeout(function(){window.changingPage = false;},500);
  $('#area').css('opacity',0);
  setTimeout(function(){$('#area').css('opacity',1).scrollTop(0);},300);
  var nextPage = parseInt(window.currentPage)+1;
  if (nextPage > Book.spine.length) return;
  window.currentPage++;
  Book.displayChapter(nextPage-1);
  integrateReader();
  $('#area').scrollTop(0);
  setTimeout(showPageInfo,200);
  setTimeout(function(){skipPageIfError("next");},300);
}


//loads prev page of book
function prevPage() {
  if (window.changingPage) return;
  window.changingPage = true;
  setTimeout(function(){window.changingPage = false;},500);
  $('#area').css('opacity',0);
  setTimeout(function(){$('#area').css('opacity',1).scrollTop(0);},300);
  var nextPage = parseInt(window.currentPage)-1;
  if (nextPage < 1) return;
  window.currentPage--;
  Book.displayChapter(nextPage-1);
  integrateReader();
  $('#area').scrollTop(0);
  setTimeout(showPageInfo,200);
  setTimeout(function(){skipPageIfError("prev");},300);
}


//skips to next or prev page if a missing image error happens (book crashes)
function skipPageIfError(which) {
  if (!window.epubJsError1) return;
  window.epubJsError1 = false;
  if (which == "next") var index = window.currentPage+1;
  else                 var index = window.currentPage-1;
  loadBook(window.filename,index+1);
}


//prepare book load after file selection
function loadBook(book, page) {
  if (!page) page = 1;
  if (window.Book) Book.destroy();
  var newfile = book.split("\\").pop().split("/").pop();
  window.filename = newfile;
  window.startFromPage = page;
  init();
}


//opens default file selection dialog
function openFileSelect(e) {
  if (e && e.shiftKey) return;
  if (window.preventReopenDialog) return;
  window.preventReopenDialog = true;
  setTimeout(function(){window.preventReopenDialog = false},200);
  //alternative file selection when in chrome app
  if (openFileSelectApp()) return;
  //default selection
  var input = $(document.createElement('input'));
  input.attr("type", "file");
  input.attr("accept", ".epub");
  input.trigger('click'); // opening dialog
  $(input).change(function(e){
    handleFileSelect(e);
  });
}


//handle file selection when in web page
function handleFileSelect(evt) {
    var file = evt.target.files[0];
    var type = file.name.split(".").pop().toLowerCase();
    if (type != "epub") {
      cAlert("<b>."+type+"</b> files are not compatible!",3000,true);
      return;
    }
    if (window.FileReader) {
        var reader = new FileReader();
        reader.onload = function (e) {
            window.loadBookData = e.target.result;
            loadBook(file.name);
        }.bind(this);
        reader.readAsArrayBuffer(file);
    }
}


//integrates reader fixes
function integrateReader() {
  setTimeout(function(){
    modifyContent();
    resizeIFrame();
    $(window.frames[0].document).find('body').rclick(openFileSelect);
  },100);
}



//modify content of current ebook page
function modifyContent() {
  var fdoc = $(window.frames[0].document);
  //set current theme 
  setTheme(window.savedTheme);
  //references popups
  fdoc.find('body a').each(function(i, el) {
    try {
      var href = $(el).attr('href');
      $(el).removeAttr('href');
      if (!href) return;
      var desc = fdoc.find(href).text();
      if (desc) {
        $(el).attr('desc',desc).css('cursor','pointer');
        $(el).click(function(){
          cAlert($(this).attr('desc'),0,true);
        });
      }
    }catch(e){}
  });
  //add saved font-size
  $('.feedbackmsg-wrapper').css('font-size',window.savedFontSize+"%");
  fdoc.find('html').css('font-size',window.savedFontSize+"%");
  //add ctrl + wheel handling
  fdoc.bind('mousewheel',window.resizeFontWheel);
  fdoc.bind('keyup',window.resizeFontKey);
  //scroll to saved point
  if (window.scrollPoint) setTimeout(function(point){
    $('#area').scrollTop(point);
  },500,window.scrollPoint);
  window.scrollPoint = false;
}


//parses an html string to create special markup for what it is assumed 
//to be character dialog or names, specials titles, etc... 
//(called inside modified epub library)
function rebuildDialogHTML(html) {
  console.time("dialog parser");
  var opener1 = '<span class="type1">';
  var opener2 = '<span class="type2">';
  var opener3 = '<span class="type3">';
  var closer  = '</span>';
  //split html by < and >
  var total = [];
  var temp  = html.split('<');
  for (var i in temp) {
    var temp2 = temp[i].split('>');
    total = total.concat(temp2);
  }
  //mofify text only
  var count = 0;
  var newHTML = [];
  for (var i in total) {
    //html
    if (i%2 == 1) {newHTML.push("<"+total[i]+">");continue;}
    //text
    var text = total[i].split('"');
    for (var j=1;j<text.length;j=j+2) text[j] = opener1+'"'+text[j]+'"'+closer;
    newHTML.push(text.join(''));
  }
  //extra replaces
  newHTML = newHTML.join("");
  newHTML = newHTML.replace(/«/g,opener1+"«").replace(/“/g,opener1+"“").replace(/\[/g,opener1+"[")
          .replace(/&lt;&lt;/g,opener2+"&lt;&lt;").replace(/『/g,opener2+"『").replace(/\(/g,opener3+"(");
  newHTML = newHTML.replace(/»/g,"»"+closer).replace(/”/g,"”"+closer).replace(/\]/g,"]"+closer)
          .replace(/&gt;&gt;/g,"&gt;&gt;"+closer).replace(/』/g,"』"+closer).replace(/\)/g,")"+closer);
  console.timeEnd("dialog parser");
  return newHTML;
}


//file drag n drop handling
$(document).on('dragenter', function(){
  $('#dropzone').show();
});
$('#dropzone').on('drop', function(e){
  $('#dropzone').hide();
});
window.onresize = function(){
  $('#area').css('opacity',0);
  resizeIFrame();
  setTimeout(function(){$('#area').css('opacity',1);},300);
};



function toggleMenu() {
  $('#mainmenu').toggle();
  $('#mainmenu').addClass('active');
  if (window.window.mneuActivating) clearTimeout(window.mneuActivating);
  window.mneuActivating = setTimeout(function(){
    $('#mainmenu').removeClass('active');
  },3000);
}