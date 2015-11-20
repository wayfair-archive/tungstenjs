'use strict';

var films = [
  {'title': 'Gladiator', 'year': '2000'},
  {'title': 'A Beautiful Mind', 'year': '2001'},
  {'title': 'Chicago', 'year': '2002'},
  {'title': 'The Lord of the Rings: The Return of the King', 'year': '2003'},
  {'title': 'Million Dollar Baby', 'year': '2004'},
  {'title': 'Crash', 'year': '2005'},
  {'title': 'The Departed', 'year': '2006'},
  {'title': 'No Country for Old Men', 'year': '2007'},
  {'title': 'Slumdog Millionaire', 'year': '2008'},
  {'title': 'The Hurt Locker', 'year': '2009'},
  {'title': 'The King\'s Speech', 'year': '2010'},
  {'title': 'The Artist', 'year': '2011'},
  {'title': 'Argo', 'year': '2012'},
  {'title': '12 Years a Slave', 'year': '2013'},
  {'title': 'Birdman or (The Unexpected Virtue of Ignorance)', 'year': '2014'}
];

// http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffle (array) {
  var currentIndex = array.length;
  var temporaryValue;
  var randomIndex;

  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

module.exports = shuffle(films);
