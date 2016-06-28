(function() {
  /* eslint-env browser */
  var toggle = document.getElementById('menu-toggle');
  if (!document.addEventListener) {
    // if we're not at least in IE8, just hide the toggle
    toggle.style.display = 'none';
    return;
  }
  var layout = document.getElementById('layout');

  toggle.addEventListener('click', function toggleMenu(e) {
    // Checking the left position of the click rather than listening on a specific element due to styling on the element
    var minX, maxX;
    if (layout.classList.contains('active')) {
      // collapsed
      minX = 0;
      maxX = 25;
    } else {
      minX = 175;
      maxX = 225;
    }
    if (e.clientX >= minX && e.clientX <= maxX) {
      e.preventDefault();
      layout.classList.toggle('active');
    }
  });
})();
