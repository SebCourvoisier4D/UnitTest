var actions = {};
var env;

var getEnv = function getEnv() {
	var envVars = {};
	if (os.isMac || os.isLinux) {
		var results = studio.SystemWorker.exec('/usr/bin/printenv');
	} else {
		var results = studio.SystemWorker.exec('cmd /C set');
	}
	var resultLines = results.output.toString().split('\n');
	for (var i = 0, j = resultLines.length; i < j; i++) {
		var envVar = resultLines[i].split('=');
		if (envVar.length === 2) {
			envVar[0] = new String(envVar[0]).replace(/^\s+/g, '').replace(/\s+$/g, '');
			envVar[1] = new String(envVar[1]).replace(/^\s+/g, '').replace(/\s+$/g, '');
			if (envVar[0] != '') {
				envVars[envVar[0]] = envVar[1];
			}
		}
	}
	return envVars;
};

var indent = function indent(snippet, offset) {
	if (typeof offset === 'undefined') offset = 0;
	var level = offset,
		code = [];
	snippet.forEach(function(line) {
		if (/^\}/.test(line)) level--;
		for (var i = 0; i < level; i++) line = '\t' + line;
		code.push(line);
		if (/\{$/.test(line)) level++;
	});
	return code.join('\n') + '\n';
}

/*
 * waktest_newsuitebdd
 *
 */
actions.waktest_newsuitebdd = function waktest_newsuitebdd(message) {
	var snippet = [];
	snippet.push('//var unitTest = require("waktest-module");');
	snippet.push('//unitTest.init();');
	snippet.push('');
	snippet.push('describe("My implementation", function () {');
	snippet.push('');
	snippet.push('/* In case you want to slow down the execution...');
	snippet.push('beforeEach(function(done){');
	snippet.push('setTimeout(done, 500);  // Delay between each test case in millisecond');
	snippet.push('});');
	snippet.push('*/');
	snippet.push('');
	snippet.push('// Put your test cases here...');
	snippet.push('');
	snippet.push('});');
	snippet.push('');
	snippet.push('//unitTest.run();');
	studio.currentEditor.insertText(indent(snippet));
};

/*
 * waktest_newcasebddexpect
 *
 */
actions.waktest_newcasebddexpect = function waktest_newcasebddexpect(message) {
	var snippet = [];
	snippet.push('it("is expected to do something", function () {');
	snippet.push('var foo = "bar";');
	snippet.push('expect(foo).to.be.a("string");');
	snippet.push('expect(foo).to.equal("bar");');
	snippet.push('expect(foo).to.have.length(3);');
	snippet.push('// Cf. http://chaijs.com/api/bdd/ for the full BDD API');
	snippet.push('});');
	studio.currentEditor.insertText(indent(snippet, 1));
};

/*
 * waktest_newcasebddshould
 *
 */
actions.waktest_newcasebddshould = function waktest_newcasebddshould(message) {
	var snippet = [];
	snippet.push('it("should do something", function () {');
	snippet.push('var foo = "bar";');
	snippet.push('foo.should.be.a("string");');
	snippet.push('foo.should.equal("bar");');
	snippet.push('foo.should.have.length(3);');
	snippet.push('// Cf. http://chaijs.com/api/bdd/ for the full BDD API');
	snippet.push('});');
	studio.currentEditor.insertText(indent(snippet, 1));
};

/*
 * waktest_newcasebddasync
 *
 */
actions.waktest_newcasebddasync = function waktest_newcasebddasync(message) {
	var snippet = [];
	snippet.push('it("eventually does something asynchronously", function (done) {');
	snippet.push('myAsyncFunction({');
	snippet.push('onSuccess: function (myResult) {');
	snippet.push('eventually(done, function () {');
	snippet.push('// Put your assertions here...');
	snippet.push('// Cf. http://chaijs.com/api/bdd/ for the full BDD API');
	snippet.push('});');
	snippet.push('},');
	snippet.push('onError: function (myError) {');
	snippet.push('done(myError); // Force the test case to fail');
	snippet.push('}');
	snippet.push('});');
	snippet.push('});');
	studio.currentEditor.insertText(indent(snippet, 1));
};

/*
 * wakbot_run
 *
 */
actions.wakbot_run = function wakbot_run(message) {
	"use strict";
	if (typeof env === 'undefined') {
		env = getEnv();
	}
	if (message.event === "onStudioStart") {
		// Automatic
	} else {
		// Manual
		var myTestFile = studio.fileSelectDialog("js");
		env.wakbot_extension_test_path = myTestFile.path;
		studio.extension.showModalDialog("main.html", env, {
			title: "WakBot Test Runner",
			dialogwidth: 800,
			dialogheight: 500,
			resizable: false
		});
	}
	return true;
};

exports.handleMessage = function handleMessage(message) {
	"use strict";
	var actionName;
	actionName = message.action;
	if (!actions.hasOwnProperty(actionName)) {
		return false;
	}
	actions[actionName](message);
};
