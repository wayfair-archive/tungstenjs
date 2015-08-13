'use strict';

/* global jasmine */
require('jasmine-node');

// Environment pulls in window and document references from jsdom
require('./environment');

jasmine.executeSpecsInFolder({
	specFolders: [
		__dirname + '/specs'
	]
});