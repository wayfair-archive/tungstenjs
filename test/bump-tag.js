var packageInfo = require('../package.json');
var inquirer = require('inquirer');
var semver = require('semver');
var async = require('async');
var fs = require('fs');
var exec = require('child_process').exec;
var chalk = require('chalk');
var logger = require('../src/utils/logger');

// list of git commands for simple checks
var getLastTag = 'git describe --abbrev=0';
var getHashForTag = 'git rev-list -n 1 ';
var getLastCommitHash = 'git rev-parse HEAD';
var getRepoStatus = 'git status --porcelain';
var getCurrentBranch = 'git rev-parse --abbrev-ref HEAD';

var newLine = /\n/g;
var packagePath = 'package.json';

// logs pretty messages
var prettyLog = {
  error: function(value) {
    logger.error('🚨 ' + chalk.bold.red(value + '!'));
  },
  success: function(value) {
    logger.info('👍 ' + chalk.bold.green(value + '!'));
  },
  warning: function(value) {
    logger.warn('🤖 ' + chalk.bold.yellow(value + '!'));
  }
};

// configuration for Inquirer
var questions = [{
  type: 'confirm',
  name: 'toAddNewTag',
  message: 'You have commits without new tag, do you want to set one and update package.json =>',
  default: true
}, {
  type: 'confirm',
  name: 'toUseBump',
  message: 'Do you want to use bump words =>',
  default: true,
  when: function(answers) {
    return answers.toAddNewTag;
  }
}, {
  type: 'list',
  name: 'bumpWord',
  message: 'Select bump type =>',
  choices: ['Patch', 'Minor', 'Major', 'Premajor', 'Preminor', 'Prepatch', 'Prerelease'],
  when: function(answers) {
    return answers.toUseBump;
  },
  filter: function(value) {
    return value.toLowerCase();
  }
}, {
  type: 'input',
  name: 'rawBump',
  message: 'Enter new version =>',
  when: function(answers) {
    return answers.toAddNewTag && !answers.toUseBump;
  },
  filter: function(value) {
    return 'v' + value;
  },
  // checks if entered version is valid and greater then version in package.json
  validate: function(value) {
    var oldVersion = packageInfo.version || '0.0.0';
    if (!semver.valid(value)) {
      return 'Invalid version format, please reference http://semver.org/';
    }
    if (semver.lte(value, oldVersion)) {
      return 'Entered version is less or equal to version in package.json';
    }
    return true;
  }
}, {
  type: 'input',
  name: 'tagMessage',
  message: 'Enter tag message =>',
  when: function(answers) {
    return answers.toAddNewTag && (answers.bumpWord || answers.rawBump);
  }
}];

// if match === false - we have commited changes without new tag
function final(error, match) {
  if (error) {
    prettyLog.error(error);
    process.exit(1);
  }
  if (!match) {
    // repo is clean but tag is missing, setting one
    inquirer.prompt(questions, function(answers) {
      var tagVersion = answers.bumpWord || answers.rawBump;
      var command = 'npm version ' + tagVersion + ' -m "' + answers.tagMessage + '"';
      if (answers.toAddNewTag && tagVersion && answers.tagMessage) {
        async.waterfall([
          function bump(callback) {
            exec(command, function(error, stdout, stderr) {
              if (stderr) {
                callback(stderr);
              } else {
                prettyLog.success('Successfully tagged and updated package.json to ' + stdout.replace(newLine, ''));
                callback(null);
              }
            });
          },
          function readJson(callback) {
            fs.readFile(packagePath, 'utf8', function (error, data) {
              if (error) {
                callback(error);
              } else {
                callback(null, JSON.parse(data));
              }
            });
          },
          function writeJson(package, callback) {
            package.files = ['dist'];
            fs.writeFile(packagePath, JSON.stringify(package, null, 2), function(error) {
              if (error) {
                callback(error);
              } else {
                prettyLog.success('Successfully added [files] attribute to package.json');
              }
            });
          }
        ], function(error) {
          if (error) {
            prettyLog.error(error);
            process.exit(1);
          }
        });
      }
    });
  } else {
    prettyLog.success('You already have one tag associated with the latest commit');
  }
}

// simple validations to make sure we can safely tag
async.waterfall([
  // checks if is on Master
  function getBranch(callback) {
    exec(getCurrentBranch, function(error, branch, stderr) {
      if (stderr) {
        callback(stderr);
      } else {
        callback(null, branch.replace(newLine, '') === 'master');
      }
    });
  },
  // gets repo status, if otput is not an emty string - abort, it's dirty
  function getStatus(isMaster, callback) {
    if (!isMaster) {
      callback('Not a master branch');
    } else {
      exec(getRepoStatus, function (error, dirty, stderr) {
        if (!dirty) {
          callback(null);  // pass through
        } else if (stderr) {
          callback(stderr);
        } else {
          callback('You have uncommited changes');
        }
      });
    }
  },
  // gets latest Tag name, e.g. v.1.12.3
  function getTag(callback) {
    exec(getLastTag, function(error, tagName, stderr) {
      if (!stderr) {
        callback(null, tagName);
      } else if (stderr.replace(newLine, '') === 'fatal: No names found, cannot describe anything.') {
        final(null, false);
      } else {
        callback(stderr);
      }
    });
  },
  // gets hash for that Tag name
  function getTagsHash(tagName, callback) {
    exec(getHashForTag + tagName, function(error, tagHash, stderr) {
      if (stderr) {
        callback(stderr);
      } else {
        callback(null, tagHash);
      }
    });
  },
  // compares last commit hash and tags hash
  function compareWithLastHash(tagHash, callback, stderr) {
    exec(getLastCommitHash, function(error, commitHash) {
      if (stderr) {
        callback(stderr);
      } else {
        callback(null, tagHash === commitHash);
      }
    });
  }
], final);
