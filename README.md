# Smichal's Ebook Reader

An ebook reader chrome packaged app that suits my specific needs.


## How to install
Open chrome extensions page, enable developer mode, press "Load unpacked extension", and select the entire project folder.
Then you can pack it yourself as a chrome App by selecting "Pack extension"



##### I made it for 2 reasons:

1) I have customized the theme to my specific needs (colors,font-sizes,line-heights,etc...)

2) It parses special text (i.e text between double quotes, brackets, etc) and displays it with different style

sample image: https://raw.githubusercontent.com/smichal52/Ebook-Reader/master/sample.png



### What it has:

1) .epub file only support

2) a few themes (you can define more in scss/themes)

3) a simple local file chooser (no url support atm)

4) a simple library that automatically stores what books you've opened and what page you left them at.

5) basic font handling (increase/decrease/reset size)

6) automatically saves the scroll height you are at

7) clickable references tha open as popups (so you dont need to scroll to them and back)




### keyboard shortcuts:

ctrl + mouse wheel: changes font size

ctrl + (+) or (-): changes font size

ctrl + (0): resets font-size





### Notes:

1) The reader is based on my modified version of EPUB.js library, since it normally won't work in chrome apps.
It can be buggy at times, but it works well with 99% of what I've tried.

2) The paging can be a bit fuzzy at times, what I mean is some books might be shown as only having 4 giant pages or similar,
but since scroll height is automatically saved I don't mind it much.
