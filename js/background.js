chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('index.html', {
    'outerBounds': {
      'width': 1024,
      'height': 600,
      'minWidth': 900,
      'minHeight': 300
    },
    state: "maximized"
  });
});