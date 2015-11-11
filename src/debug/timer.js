var now = window && window.performance && typeof window.performance.now === 'function' ? window.performance.now.bind(performance) : Date.now.bind(Date);

var Timer = function(name) {
  this.name = name;
  this.startTime = now();
  this.lastTime = this.startTime;
  this.logs = [];
  this.adjust = 0;
};

Timer.prototype.now = function() {
  return this.adjust + now() - this.startTime;
};

Timer.prototype.offset = function() {
  return this.adjust + now() - this.lastTime;
};

Timer.prototype.check = function(label) {
  this.logs.push(label + ' ' + this.now());
  stats(this.name + '.' + label, this.offset());
  this.lastTime = now();
};

Timer.prototype.pause = function() {
  this.adjust = now() - this.startTime;
};

Timer.prototype.start = function() {
  this.startTime = now();
  this.lastTime = this.startTime;
};

var statsTracker = {};
var statsTimer;
function stats(stat, value) {
  if (!statsTracker[stat]) {
    statsTracker[stat] = [];
  }
  statsTracker[stat].push(value);
  clearTimeout(statsTimer);
  statsTimer = setTimeout(printStats, 50);
}

function printStats() {
  for (var stat in statsTracker) {
    var vals = statsTracker[stat];
    var total = vals.reduce(function(memo, num) {
      return memo + num;
    }, 0);
    var avg = total / vals.length;
    console.log(stat + ': ' + avg + ' (' + vals.length + ')');
  }
  statsTracker = {};
}

module.exports = Timer;
