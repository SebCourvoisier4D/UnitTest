var actions = {}, 
	env, 
	monitor;

function getEnv() {
	if (typeof env === 'undefined') {
		if (typeof process !== 'undefined' && typeof process.env !== 'undefined') {
			env = process.env;
		} else {
			env = {};
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
						env[envVar[0]] = envVar[1];
					}
				}
			}
		}
	}
	return env;
};

function indent(snippet, offset) {
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
};

/*
 * waktest_newsuitebdd
 *
 */
actions.waktest_newsuitebdd = function waktest_newsuitebdd(message) {
	var snippet = [];
	snippet.push('describe("My implementation", function () {');
	snippet.push('');
	snippet.push('/* In case you want your whole test suite to fail if one test case fails:');
	snippet.push('this.bail(true);');
	snippet.push('*/');
	snippet.push('');
	snippet.push('/* In case you want to slow down the execution:');
	snippet.push('beforeEach(function(done){');
	snippet.push('setTimeout(done, 250);  // Delay between each test case in millisecond');
	snippet.push('});');
	snippet.push('*/');
	snippet.push('');
	snippet.push('// Put your test cases here...');
	snippet.push('');
	snippet.push('});');
	studio.currentEditor.insertText(indent(snippet));
	return true;
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
	return true;
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
	return true;
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
	return true;
};

function getProjects() {
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
};

function getProjectOfFile(filePath) {
	var project = null;
	var projects = getProjects();
	projects.forEach(function (item) {
		if (filePath.indexOf(item.basePath) !== -1) {
			project = item;
		}
	});
	return project;
};

function getProjectAddress(projectPath, projectBasePath) {
	var projectXml = studio.loadText(projectPath);
	var myRe = /path="([^"]+)">[^<]+<tag\s+name="settings"/gim;
	var settingsPath = projectBasePath + myRe.exec(projectXml)[1].replace('./', '');
	var serverAddress = studio.getRemoteServerInfo().split(':');
	var serverPort = /\sport="(\d+)"/i.exec(studio.loadText(settingsPath))[1];
	return serverAddress[0] + ':' + serverAddress[1] + ':' + serverPort;
}

function isCurrentProjectReady(projectPath, projectBasePath) {
	var projectXml = studio.loadText(projectPath);
	var myRe = /path="([^"]+)">[^<]+<tag\s+name="settings"/gim;
	var settingsPath = projectBasePath + myRe.exec(projectXml)[1].replace('./', '');
	var settingsXml = studio.loadText(settingsPath);
	myRe = /<service\s+name="?'?unitTest"?'?/;
	return myRe.test(settingsXml);
};

function enableService(projectPath, projectBasePath) {
	var projectXml = studio.loadText(projectPath);
	var myRe = /path="([^"]+)">[^<]+<tag\s+name="settings"/gim;
	var settingsPath = projectBasePath + myRe.exec(projectXml)[1].replace('./', '');
	var settingsXml = studio.loadText(settingsPath);
	settingsXml = settingsXml.replace('<virtualFolder', '<service name="unitTest" modulePath="services/unitTest" enabled="true" autoStart="true"/>\n\t<virtualFolder');
	studio.saveText(settingsXml, settingsPath);
	return true;
};

/*
 * waktest_runssjs
 *
 */
actions.waktest_runssjs = function waktest_runssjs(message) {
	"use strict";
	getEnv();
	if (message.event !== "onStudioStart") {
		studio.sendCommand('Save');
		if (studio.getRemoteServerInfo()  === null) {
			studio.alert('Please Start your Solution first.');
		} else {
			var now = new Date();
			var currentFileName = studio.currentEditor.getEditingFile().name;
			var currentFilePath = studio.currentEditor.getEditingFile().path;
			var currentProject = getProjectOfFile(currentFilePath);
			var currentProjectReady = isCurrentProjectReady(currentProject.projectPath, currentProject.basePath);
			if (currentProjectReady === false) {
				var isOK = studio.confirm("The Unit Test Service is not enabled in your Project.\nDo you want to enable it?\n(The Solution will be reloaded)");
				if (isOK === true) {
					var setupDone = enableService(currentProject.projectPath, currentProject.basePath);
					if (setupDone === true) {
						studio.sendCommand('ReloadSolution');
					}
				}
			} else {
			var testURL = getProjectAddress(currentProject.projectPath, currentProject.basePath) + '/waktest-ssjs?path=' + currentFilePath;
			studio.extension.openPageInTab(testURL + '&rnd=' + now.getTime(), '[Server-Side Test] ' + currentFileName, false);
		}
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
	getEnv();
	if (message.event !== "onStudioStart") {
		studio.sendCommand('Save');
		if (studio.getRemoteServerInfo()  === null) {
			studio.alert('Please Start your Solution first.');
		} else {
			var now = new Date();
			var currentFileName = studio.currentEditor.getEditingFile().name;
			var currentFilePath = studio.currentEditor.getEditingFile().path;
			var currentProject = getProjectOfFile(currentFilePath);
			var currentProjectReady = isCurrentProjectReady(currentProject.projectPath, currentProject.basePath);
			if (currentProjectReady === false) {
				var isOK = studio.confirm("The Unit Test Service is not enabled in your Project.\nDo you want to enable it?\n(The Solution will be reloaded)");
				if (isOK === true) {
					var setupDone = enableService(currentProject.projectPath, currentProject.basePath);
					if (setupDone === true) {
						studio.sendCommand('ReloadSolution');
					}
				}
			} else {
			var testURL = getProjectAddress(currentProject.projectPath, currentProject.basePath) + '/?waktest-path=' + currentFilePath;
			studio.extension.openPageInTab(testURL + '&rnd=' + now.getTime(), '[Client-Side Test] ' + currentFileName, false);
		}
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
	getEnv();
	if (message.event !== "onStudioStart") {
		studio.sendCommand('Save');
		if (studio.getRemoteServerInfo()  === null) {
			studio.alert('Please Start your Solution first.');
		} else {
			var currentFileName = studio.currentEditor.getEditingFile().name;
			var currentFilePath = studio.currentEditor.getEditingFile().path;
			var currentProject = getProjectOfFile(currentFilePath);
			var currentProjectReady = isCurrentProjectReady(currentProject.projectPath, currentProject.basePath);
			if (currentProjectReady === false) {
				var isOK = studio.confirm("The Unit Test Service is not enabled in your Project.\nDo you want to enable it?\n(The Solution will be reloaded)");
				if (isOK === true) {
					var setupDone = enableService(currentProject.projectPath, currentProject.basePath);
					if (setupDone === true) {
						studio.sendCommand('ReloadSolution');
					}
				}
			} else {
			var testURL = getProjectAddress(currentProject.projectPath, currentProject.basePath);
			studio.extension.showModelessDialog("runstudio.html", { 'waktest-path': currentFilePath, 'waktest-url': testURL, 'waktest-projectpath': currentProject.basePath }, {
				title: '[Studio-Side Test] ' + currentFileName,
				dialogwidth: 800,
				dialogheight: 400,
				resizable: true
			});
			}
		}
	}
	return true;
};

function dotResolve(str, self) {
	try {
		return str.split('.').reduce(function (obj,i) {
			return obj[i];
		}, self);
	} catch (ignore) {
		return undefined;
	}
}

function handleMessageFromMonitor (message) {
	var messages = [],
		command;
	if (typeof message === 'object') {
		messages.push(message);
	} else {
		message.split(/\r?\n/).forEach(function (item) {
			try {
				messages.push(JSON.parse(item.trim()));
			} catch (e) {
				messages.push(item.trim());
			}
		});
	}
	messages.forEach(function (item) {
		if (item) {
			if (typeof item === 'string') {
				studio.log(item);
			} else {
				studio.log(JSON.stringify(item));
				if (typeof item.command === 'string' && item.args instanceof Array) {
					command = dotResolve(item.command, studio);
					if (typeof command === 'function') {
						command.apply(studio, item.args);
					} else {
						postMessageToMonitor({error: 'Command ' + item.command + ' is undefined'});
					}					
				}
			}
		}
	});
}

function postMessageToMonitor (message) {
	if (message && monitor) {
		if (typeof message === 'object') {
			monitor.postMessage(JSON.stringify(message));
		} else {
			monitor.postMessage(message.toString());
		}
	}	
}

/*
 * wakbot_start
 *
 */
actions.wakbot_start = function wakbot_start(message) {
	"use strict";
	getEnv();
	if (message.event === "onStudioStart") {
		if (typeof env.WAKANDA_ENV !== 'undefined' && typeof env.QA_MODULE_LOCATION !== 'undefined' && env.WAKANDA_ENV === 'test') {
			if (os.isMac || os.isLinux) {
				monitor = new studio.SystemWorker('node ' + env.QA_MODULE_LOCATION + '/qa-scripts/studio-monitor.js', env.QA_MODULE_LOCATION);
			} else {
				monitor = new studio.SystemWorker('node ' + env.QA_MODULE_LOCATION + '\\qa-scripts\\studio-monitor.js', env.QA_MODULE_LOCATION);
			}
			monitor.onmessage = function (message) {
				handleMessageFromMonitor(message.data.toString());
			}
			postMessageToMonitor('onStudioStart');
		}
	}
	return true;
};

/*
 * wakbot_any
 *
 */
actions.wakbot_any = function wakbot_any(message) {
	"use strict";
	getEnv();
	if (monitor && typeof env.WAKANDA_ENV !== 'undefined' && typeof env.QA_MODULE_LOCATION !== 'undefined' && env.WAKANDA_ENV === 'test') {
		postMessageToMonitor(message);
	}
	return true;
};

/*
 * handleMessage
 *
 */
exports.handleMessage = function handleMessage(message) {
	"use strict";
	var actionName = message.action;
	if (!actions.hasOwnProperty(actionName)) {
		getEnv();
		if (monitor && typeof env.WAKANDA_ENV !== 'undefined' && typeof env.QA_MODULE_LOCATION !== 'undefined' && env.WAKANDA_ENV === 'test') {
			return actions['wakbot_any'](message);
		} else {
			return false;
		}		
	}
	return actions[actionName](message);
};
