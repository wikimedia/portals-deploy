'use strict';

const fs = require( 'fs' );
const path = require( 'path' );
const logPath = process.env.LOG_DIR || './log';

function relPath( foo ) {
	return path.resolve( __dirname, '../..', foo );
}

exports.config = {
	/*
	services: [ 'sauce' ],
	user: process.env.SAUCE_USERNAME,
	key: process.env.SAUCE_ACCESS_KEY,
	*/
	specs: [
		relPath( './tests/selenium/specs/**/*.spec.js' )
	],
	// Patterns to exclude.
	exclude: [
	// 'path/to/excluded/files'
	],
	//
	// ============
	// Capabilities
	// ============
	// Define your capabilities here. WebdriverIO can run multiple capabilities at the same
	// time. Depending on the number of capabilities, WebdriverIO launches several test
	// sessions. Within your capabilities you can overwrite the spec and exclude options in
	// order to group specific specs to a specific capability.
	//
	// First, you can define how many instances should be started at the same time. Let's
	// say you have 3 different capabilities (Chrome, Firefox, and Safari) and you have
	// set maxInstances to 1; wdio will spawn 3 processes. Therefore, if you have 10 spec
	// files and you set maxInstances to 10, all spec files will get tested at the same time
	// and 30 processes will get spawned. The property handles how many capabilities
	// from the same test should run tests.
	//
	maxInstances: 1,
	//
	// If you have trouble getting all important capabilities together, check out the
	// Sauce Labs platform configurator - a great tool to configure your capabilities:
	// https://docs.saucelabs.com/reference/platforms-configurator
	//
	// For Chrome/Chromium https://sites.google.com/a/chromium.org/chromedriver/capabilities
	capabilities: [ {
		// maxInstances can get overwritten per capability. So if you have an in-house Selenium
		// grid with only 5 firefox instances available you can make sure that not more than
		// 5 instances get started at a time.
		maxInstances: 1,
		//
		browserName: 'chrome',
		'goog:chromeOptions': {
			args: [
				'--enable-automation',
				...( process.env.DISPLAY ? [] : [ '--headless' ] ),
				...( fs.existsSync( '/.dockerenv' ) ? [ '--no-sandbox' ] : [] )
			]
		}
	} ],
	//
	// ===================
	// Test Configurations
	// ===================
	// Define all options that are relevant for the WebdriverIO instance here
	//
	// By default WebdriverIO commands are executed in a synchronous way using
	// the wdio-sync package. If you still want to run your tests in an async way
	// e.g. using promises you can set the sync option to false.
	sync: true,
	//
	// Level of logging verbosity: silent | verbose | command | data | result | error
	logLevel: 'error',
	//
	// Enables colors for log output.
	coloredLogs: true,
	//
	// Saves a screenshot to a given path if a command fails.
	screenshotPath: logPath,
	//
	// Set a base URL in order to shorten url command calls. If your url parameter starts
	// with "/", then the base url gets prepended.
	baseUrl: (
		process.env.MW_SERVER === undefined ?
			'http://127.0.0.1:8080' :
			process.env.MW_SERVER
	) + (
		process.env.MW_SCRIPT_PATH === undefined ?
			'/w' :
			process.env.MW_SCRIPT_PATH
	),
	//
	// Default timeout for all waitFor* commands.
	waitforTimeout: 20000,
	//
	// Default timeout in milliseconds for request
	// if Selenium Grid doesn't send response
	connectionRetryTimeout: 90000,
	//
	// Default request retries count
	connectionRetryCount: 3,
	//
	// Initialize the browser instance with a WebdriverIO plugin. The object should have the
	// plugin name as key and the desired plugin options as properties. Make sure you have
	// the plugin installed before running any tests. The following plugins are currently
	// available:
	// WebdriverCSS: https://github.com/webdriverio/webdrivercss
	// WebdriverRTC: https://github.com/webdriverio/webdriverrtc
	// Browserevent: https://github.com/webdriverio/browserevent
	// plugins: {
	//     webdrivercss: {
	//         screenshotRoot: 'my-shots',
	//         failedComparisonsRoot: 'diffs',
	//         misMatchTolerance: 0.05,
	//         screenWidth: [320,480,640,1024]
	//     },
	//     webdriverrtc: {},
	//     browserevent: {}
	// },
	//
	// Test runner services
	// Services take over a specific job you don't want to take care of. They enhance
	// your test setup with almost no effort. Unlike plugins, they don't add new
	// commands. Instead, they hook themselves up into the test process.
	// services: [],//
	// Framework you want to run your specs with.
	// The following are supported: Mocha, Jasmine, and Cucumber
	// see also: http://webdriver.io/guide/testrunner/frameworks.html
	//
	// Make sure you have the wdio adapter package for the specific framework installed
	// before running any tests.
	framework: 'mocha',

	// Test reporter for stdout.
	// The only one supported by default is 'dot'
	// see also: http://webdriver.io/guide/testrunner/reporters.html
	reporters: [ 'spec' ],
	//
	// Options to be passed to Mocha.
	// See the full list at http://mochajs.org/
	mochaOpts: {
		ui: 'bdd',
		timeout: 20000
	},
	//
	// =====
	// Hooks
	// =====
	// WebdriverIO provides several hooks you can use to interfere with the test process in order
	// to enhance it and to build services around it. You can either apply a single function or
	// an array of methods to it. If one of them returns with a promise, WebdriverIO will wait
	// until that promise got resolved to continue.
	//
	// Gets executed once before all workers get launched.
	onPrepare: function () {
		const StaticServer = require( 'static-server' ),
			server = new StaticServer( {
				rootPath: '.', // required, the root of the server file tree
				name: 'portal-deploy-test-server', // optional, will set "X-Powered-by" HTTP header
				port: 8080, // optional, defaults to a random port
				host: '127.0.0.1', // optional, defaults to any interface
				cors: '*', // optional, defaults to undefined
				followSymlink: true, // optional, defaults to a 404 error
				templates: {
					index: 'index.html', // optional, defaults to 'index.html'
					notFound: '404.html' // optional, defaults to undefined
				}
			} );
		return server.start( function () {
			console.log( 'Server listening to', server.port );
		} );
	},
	//
	// Gets executed before test execution begins. At this point you can access all global
	// variables, such as `browser`. It is the perfect place to define custom commands.
	// before: function (capabilities, specs) {
	// },
	//
	// Hook that gets executed before the suite starts
	// beforeSuite: function (suite) {
	// },
	//
	// Hook that gets executed _before_ a hook within the suite starts (e.g. runs before calling
	// beforeEach in Mocha)
	// beforeHook: function () {
	// },
	//
	// Hook that gets executed _after_ a hook within the suite starts (e.g. runs after calling
	// afterEach in Mocha)
	//
	// Function to be executed before a test (in Mocha/Jasmine) or a step (in Cucumber) starts.
	// beforeTest: function (test) {
	// },
	//
	// Runs before a WebdriverIO command gets executed.
	// beforeCommand: function (commandName, args) {
	// },
	//
	// Runs after a WebdriverIO command gets executed
	// afterCommand: function (commandName, args, result, error) {
	// },
	//
	// Function to be executed after a test (in Mocha/Jasmine) or a step (in Cucumber) starts.
	// from https://github.com/webdriverio/webdriverio/issues/269#issuecomment-306342170
	afterTest: function ( test ) {
		// if test passed, ignore, else take and save screenshot
		if ( test.passed ) {
			return;
		}
		// get current test title and clean it, to use it as file name
		const filename = encodeURIComponent( test.title.replace( /\s+/g, '-' ) );
		// build file path
		const filePath = path.join( this.screenshotPath, filename + '.png' );
		// save screenshot
		browser.saveScreenshot( filePath );
		console.log( '\n\tScreenshot location:', filePath, '\n' );
	}
	//
	// Hook that gets executed after the suite has ended
	// afterSuite: function (suite) {
	// },
	//
	// Gets executed after all tests are done. You still have access to all global variables from
	// the test.
	// after: function (result, capabilities, specs) {
	// },
	//
	// Gets executed after all workers got shut down and the process is about to exit. It is not
	// possible to defer the end of the process using a promise.
	// onComplete: function(exitCode) {
	// }
};
