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
	//snippet.push('//var unitTest = require("waktest-module");');
	//snippet.push('//unitTest.init();');
	//snippet.push('');
	snippet.push('describe("My implementation", function () {');
	snippet.push('');
	snippet.push('/* In case you want to slow down the execution...');
	snippet.push('beforeEach(function(done){');
	snippet.push('setTimeout(done, 250);  // Delay between each test case in millisecond');
	snippet.push('});');
	snippet.push('*/');
	snippet.push('');
	snippet.push('// Put your test cases here...');
	snippet.push('');
	snippet.push('});');
	//snippet.push('');
	//snippet.push('//unitTest.run();');
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

var getProjects = function getProjects() {
		var projects = [];
		var solutionFile = studio.currentSolution.getSolutionFile();
		var solutionXml = studio.loadText(solutionFile.path);
		var myRe = /<project\s+path="([^"]+)"\s?\/>/gim;
		var project;
		while((project = myRe.exec(solutionXml)) !== null) {
			var settingsFile = studio.File(solutionFile.parent.parent.path + project[1].replace('../', ''));
			projects.push({
				'projectPath': settingsFile.path,
				'basePath': settingsFile.parent.path
			});
		}
		return projects;
}

var getProjectOfFile = function getProjectOfFile(filePath) {
		var project = null;
		var projects = getProjects();
		projects.forEach(function (item) {
			if (filePath.indexOf(item.basePath) !== -1) {
				project = item;
			}
		});
		return project;
}

var getProjectAddress = function getProjectAddress(projectPath, projectBasePath) {
	var projectXml = studio.loadText(projectPath);
	var myRe = /path="([^"]+)">[^<]+<tag\s+name="settings"/gim;
	var settingsPath = projectBasePath + myRe.exec(projectXml)[1].replace('./', '');
	var serverAddress = studio.getRemoteServerInfo().split(':');
	var serverPort = /\sport="(\d+)"/i.exec(studio.loadText(settingsPath))[1];
	return serverAddress[0] + ':' + serverAddress[1] + ':' + serverPort;
}

/*
 * waktest_runssjs
 *
 */
actions.waktest_runssjs = function waktest_runssjs(message) {
	"use strict";
	if (typeof env === 'undefined') {
		env = getEnv();
	}
	if (message.event === "onStudioStart") {
		// Automatic
	} else {
		// Manual
		if (studio.getRemoteServerInfo()  === null) {
			studio.alert('Please Start your Solution first.');
		} else {
			var now = new Date();
			var currentFileName = studio.currentEditor.getEditingFile().name;
			var currentFilePath = studio.currentEditor.getEditingFile().path;
			var currentProject = getProjectOfFile(currentFilePath);
			var testURL = getProjectAddress(currentProject.projectPath, currentProject.basePath) + '/waktest-ssjs?path=' + currentFilePath;
			studio.openFile(testURL + '&rnd=' + now.getTime(), 0, '[Server-Side Test] ' + currentFileName);
		}
	}
	return true;
};

/*
 * waktest_runwaf
 *
 */
actions.waktest_runwaf = function waktest_runwaf(message) {
	"use strict";
	if (typeof env === 'undefined') {
		env = getEnv();
	}
	if (message.event === "onStudioStart") {
		// Automatic
	} else {
		// Manual
		if (studio.getRemoteServerInfo()  === null) {
			studio.alert('Please Start your Solution first.');
		} else {
			var now = new Date();
			var currentFileName = studio.currentEditor.getEditingFile().name;
			var currentFilePath = studio.currentEditor.getEditingFile().path;
			var currentProject = getProjectOfFile(currentFilePath);
			var testURL = getProjectAddress(currentProject.projectPath, currentProject.basePath) + '/?waktest-path=' + currentFilePath;
			studio.openFile(testURL + '&rnd=' + now.getTime(), 0, '[Client-Side Test] ' + currentFileName);
		}
	}
	return true;
};

/*
 * waktest_runstudio
 *
 */
actions.waktest_runstudio = function waktest_runstudio(message) {
	"use strict";
	if (typeof env === 'undefined') {
		env = getEnv();
	}
	if (message.event === "onStudioStart") {
		// Automatic
	} else {
		// Manual
		if (studio.getRemoteServerInfo()  === null) {
			studio.alert('Please Start your Solution first.');
		} else {
			var currentFileName = studio.currentEditor.getEditingFile().name;
			var currentFilePath = studio.currentEditor.getEditingFile().path;
			var currentProject = getProjectOfFile(currentFilePath);
			var testURL = getProjectAddress(currentProject.projectPath, currentProject.basePath);
			studio.extension.showModalDialog("runstudio.html", { 'waktest-path': currentFilePath, 'waktest-url': testURL }, {
				title: '[Studio-Side Test] ' + currentFileName,
				dialogwidth: 800,
				dialogheight: 500,
				resizable: false
			});
		}
	}
	return true;
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
