var actions = {},
env,
monitor;

var Base64 = require('base64');

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
}

function getAddonsRootFolder(addonType) {
	var rootAddonsFolder = '';
	switch (addonType) {
		case 'wakanda-extensions':
		rootAddonsFolder = FileSystemSync('EXTENSIONS_USER');
		break;
		case 'wakanda-internal-extensions':
        	// @FIXME (hack)
        	rootAddonsFolder = studio.Folder(studio.File(studio.getFileIcon()).parent.parent.parent.parent.path + 'Extensions');
        	break;
        }
        return rootAddonsFolder;
    }

    function getExtensions(filter) {
    	var extensions = studio.getExtensionList();
    	/*
    	var extensions = [],
    	history = [],
    	globalExtensions = Folder(getAddonsRootFolder('wakanda-extensions').path).folders,
    	localExtensions = Folder(getAddonsRootFolder('wakanda-internal-extensions').path).folders;
    	globalExtensions.forEach(function (extension) {
    		extensions.push({
    			name: extension.name,
    			path: extension.path,
    			kind: 'global',
    			enabled: true
    		});
    		history.push(extension.name);
    	});
    	localExtensions.forEach(function (extension) {
    		if (history.indexOf(extension.name) === -1) {
    			extensions.push({
    				name: extension.name,
    				path: extension.path,
    				kind: 'internal',
    				enabled: true
    			});
    		}
    	});
    	*/
    	extensions = extensions.sort(function (a, b) {
    		if (a.name < b.name) {
    			return -1;
    		}
    		if (a.name > b.name) {
    			return 1;
    		}
    		return 0;
    	});
    	if (typeof filter === 'string') {
    		return extensions.filter(function (item) {
    			return (item.name.toLowerCase().indexOf(filter.toLowerCase()) !== -1);
    		});
    	} else if (filter instanceof RegExp) {
    		return extensions.filter(function (item) {
    			return (filter.test(item.name) === true);
    		});
    	}
    	return extensions;
    }

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
    }

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
 	while ((project = myRe.exec(solutionXml)) !== null) {
 		var settingsFile = studio.File(solutionFile.parent.parent.path + project[1].replace('../', ''));
 		projects.push({
 			'projectPath': settingsFile.path,
 			'basePath': settingsFile.parent.path
 		});
 	}
 	if (projects.length === 0) {
 		var selectedProjects = studio.getSelectedProjects();
 		if (selectedProjects.length > 0) {
 			selectedProjects.forEach(function (project) {
 				projects.push({
 					'projectPath': project,
 					'basePath': studio.File(project).parent.path
 				});
 			});
 		}
 	}
 	return projects;
 };

 function getProjectOfFile(filePath) {
 	var project = null;
 	var projects = getProjects();
 	projects.forEach(function(item) {
 		if (filePath.indexOf(item.basePath) !== -1) {
 			project = item;
 		}
 	});
 	return project;
 };

 function getProjectAddress(projectPath, projectBasePath) {
 	try {
 		var projectXml = studio.loadText(projectPath);
 		var myRe = /path="([^"]+)">[^<]+<tag\s+name="settings"/gim;
 		var settingsPath = projectBasePath + myRe.exec(projectXml)[1].replace('./', '');
 		var serverAddress = studio.getRemoteServerInfo().split(':');
 		var serverPort = /\sport="(\d+)"/i.exec(studio.loadText(settingsPath))[1];
 		return serverAddress[0] + ':' + serverAddress[1] + ':' + serverPort;
 	} catch (e) {
 		return 'http://127.0.0.1:8081';
 	}
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
 * waktest_runaddonSelector
 *
 */
 actions.waktest_runaddonSelector = function waktest_runaddonSelector(message) {
 	"use strict";
 	getEnv();
 	if (message.event !== "onStudioStart") {
 		studio.sendCommand('Save');
 		if (studio.getRemoteServerInfo() === null) {
 			studio.alert('Please Start the Server first.');
 			return false;
 		} else {
 			var currentFilePath = studio.currentEditor.getEditingFile().path;
 			var currentProject = getProjectOfFile(currentFilePath);
 			if (currentProject === null) {
 				studio.alert('You must select one and only one project in your Wakanda Solution.');
 				return false;
 			} else {
 				studio.extension.showModelessDialog("selectaddon.html", {
 					'waktest-addons': getExtensions(),
 					'waktest-path': currentFilePath
 				}, {
 					title: '[Select Extension]',
 					dialogwidth: 800,
 					dialogheight: 400,
 					resizable: true
 				});
 			}
 		}
 	}
 	return true;
 };

/*
 * waktest_runaddon
 *
 */
 actions.waktest_runaddon = function waktest_runaddon(message) {
 	"use strict";
 	var automatic = true, target = null, _path = null;
 	getEnv();
 	if (typeof message.params !== 'undefined') {
 		if (typeof message.params.target !== 'undefined') {
 			target = message.params.target;
 		}
 		if (typeof message.params.path !== 'undefined') {
 			_path = message.params.path;
 		} else {
 			automatic = false;
 		}
 	}
 	if (target === null) {
 		if (automatic === false) {
 			studio.alert('No target given.');
 		}
 		return false;
 	}
 	if (message.event !== "onStudioStart") {
 		studio.sendCommand('Save');
 		if (studio.getRemoteServerInfo() === null) {
 			if (automatic === false) {
 				studio.alert('Please Start the Server first.');
 			}
 			return false;
 		} else {
 			if (automatic === false) {
 				var currentFileName = studio.currentEditor.getEditingFile().name;
 				var currentFilePath = studio.currentEditor.getEditingFile().path;
 			} else {
 				var currentFileName = studio.File(_path).name;
 				var currentFilePath = studio.File(_path).path;
 			}
 			var currentProject = getProjectOfFile(currentFilePath);
 			if (currentProject === null) {
 				if (automatic === false) {
 					studio.alert('You must select one and only one project in your Wakanda Solution.');
 				}
 				return false;
 			} else {
 				var currentProjectReady = isCurrentProjectReady(currentProject.projectPath, currentProject.basePath);
 				if (currentProjectReady === false) {
 					if (automatic === false) {
 						var isOK = studio.confirm("The Unit Test Service is not enabled in your Project.\nDo you want to enable it?\n(The Solution will be reloaded)");
 						if (isOK === true) {
 							var setupDone = enableService(currentProject.projectPath, currentProject.basePath);
 							if (setupDone === true) {
 								studio.sendCommand('ReloadSolution');
 							}
 						}
 					}
 					return false;
 				} else {
 					var testURL = getProjectAddress(currentProject.projectPath, currentProject.basePath);
 					studio.sendExtensionWebZoneCommand(target, 'runUnitTest', [currentFilePath, testURL, currentProject.basePath, automatic]);
 				}
 			}
 		}
 	}
 	return true;
 };

/*
 * waktest_runssjs
 *
 */
 actions.waktest_runssjs = function waktest_runssjs(message) {
 	"use strict";
 	var automatic = false;
 	if (typeof message.params !== 'undefined' && typeof message.params.length !== 'undefined' && message.params.length === 1) {
 		automatic = true;
 	}
 	getEnv();
 	if (message.event !== "onStudioStart") {
 		studio.sendCommand('Save');
 		if (studio.getRemoteServerInfo() === null) {
 			if (automatic === false) {
 				studio.alert('Please Start the Server first.');
 			}
 			return false;
 		} else {
 			if (automatic === false) {
 				var currentFileName = studio.currentEditor.getEditingFile().name;
 				var currentFilePath = studio.currentEditor.getEditingFile().path;
 			} else {
 				var currentFileName = studio.File(message.params[0]).name;
 				var currentFilePath = studio.File(message.params[0]).path;
 			}
 			var currentProject = getProjectOfFile(currentFilePath);
 			if (currentProject === null) {
 				if (automatic === false) {
 					studio.alert('You must select one and only one project in your Wakanda Solution.');
 				}
 				return false;
 			} else {
 				var currentProjectReady = isCurrentProjectReady(currentProject.projectPath, currentProject.basePath);
 				if (currentProjectReady === false) {
 					if (automatic === false) {
 						var isOK = studio.confirm("The Unit Test Service is not enabled in your Project.\nDo you want to enable it?\n(The Solution will be reloaded)");
 						if (isOK === true) {
 							var setupDone = enableService(currentProject.projectPath, currentProject.basePath);
 							if (setupDone === true) {
 								studio.sendCommand('ReloadSolution');
 							}
 						}
 					}
 					return false;
 				} else {
 					var testURL = getProjectAddress(currentProject.projectPath, currentProject.basePath) + '/waktest-ssjs?path=' + currentFilePath;
 					studio.extension.openPageInTab(testURL + '&waktest-automatic=' + (automatic ? 1 : 0) + '&rnd=' + (new Date()).getTime(), '[Server Test] ' + currentFileName, false);
 				}
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
 	var automatic = false;
 	if (typeof message.params !== 'undefined' && typeof message.params.length !== 'undefined' && message.params.length === 1) {
 		automatic = true;
 	}
 	getEnv();
 	if (message.event !== "onStudioStart") {
 		studio.sendCommand('Save');
 		if (studio.getRemoteServerInfo() === null) {
 			if (automatic === false) {
 				studio.alert('Please Start the Server first.');
 			}
 			return false;
 		} else {
 			if (automatic === false) {
 				var currentFileName = studio.currentEditor.getEditingFile().name;
 				var currentFilePath = studio.currentEditor.getEditingFile().path;
 			} else {
 				var currentFileName = studio.File(message.params[0]).name;
 				var currentFilePath = studio.File(message.params[0]).path;
 			}
 			var currentProject = getProjectOfFile(currentFilePath);
 			if (currentProject === null) {
 				if (automatic === false) {
 					studio.alert('You must select one and only one project in your Wakanda Solution.');
 				}
 				return false;
 			} else {
 				var currentProjectReady = isCurrentProjectReady(currentProject.projectPath, currentProject.basePath);
 				if (currentProjectReady === false) {
 					if (automatic === false) {
 						var isOK = studio.confirm("The Unit Test Service is not enabled in your Project.\nDo you want to enable it?\n(The Solution will be reloaded)");
 						if (isOK === true) {
 							var setupDone = enableService(currentProject.projectPath, currentProject.basePath);
 							if (setupDone === true) {
 								studio.sendCommand('ReloadSolution');
 							}
 						}
 					}
 					return false;
 				} else {
 					var testURL = getProjectAddress(currentProject.projectPath, currentProject.basePath) + '/prototype/index.waPage/index.html?waktest-path=' + currentFilePath;
 					studio.extension.openPageInTab(testURL + '&waktest-automatic=' + (automatic ? 1 : 0) + '&rnd=' + (new Date()).getTime(), '[Prototyper Test] ' + currentFileName, false);
 				}
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
 	var automatic = false;
 	if (typeof message.params !== 'undefined' && typeof message.params.length !== 'undefined' && message.params.length === 1) {
 		automatic = true;
 	}
 	getEnv();
 	if (message.event !== "onStudioStart") {
 		studio.sendCommand('Save');
 		if (studio.getRemoteServerInfo() === null) {
 			if (automatic === false) {
 				studio.alert('Please Start the Server first.');
 			}
 			return false;
 		} else {
 			if (automatic === false) {
 				var currentFileName = studio.currentEditor.getEditingFile().name;
 				var currentFilePath = studio.currentEditor.getEditingFile().path;
 			} else {
 				var currentFileName = studio.File(message.params[0]).name;
 				var currentFilePath = studio.File(message.params[0]).path;
 			}
 			var currentProject = getProjectOfFile(currentFilePath);
 			if (currentProject === null) {
 				if (automatic === false) {
 					studio.alert('You must select one and only one project in your Wakanda Solution.');
 				}
 				return false;
 			} else {
 				var currentProjectReady = isCurrentProjectReady(currentProject.projectPath, currentProject.basePath);
 				if (currentProjectReady === false) {
 					if (automatic === false) {
 						var isOK = studio.confirm("The Unit Test Service is not enabled in your Project.\nDo you want to enable it?\n(The Solution will be reloaded)");
 						if (isOK === true) {
 							var setupDone = enableService(currentProject.projectPath, currentProject.basePath);
 							if (setupDone === true) {
 								studio.sendCommand('ReloadSolution');
 							}
 						}
 					}
 					return false;
 				} else {
 					var testURL = getProjectAddress(currentProject.projectPath, currentProject.basePath);
 					studio.extension.showModelessDialog("runstudio.html", {
 						'waktest-path': currentFilePath,
 						'waktest-url': testURL,
 						'waktest-projectpath': currentProject.basePath,
 						'waktest-automatic': automatic
 					}, {
 						title: '[Studio Test] ' + currentFileName,
 						dialogwidth: 800,
 						dialogheight: 400,
 						resizable: true
 					});
 				}
 			}
 		}
 	}
 	return true;
 };

 function dotResolve(str, self) {
 	try {
 		return str.split('.').reduce(function(obj, i) {
 			return obj[i];
 		}, self);
 	} catch (ignore) {
 		return undefined;
 	}
 }

 function handleMessageFromMonitor(message) {
 	var messages = [],
 	command,
 	result;
 	if (typeof message === 'object') {
 		messages.push(message);
 	} else {
 		message.split(/\r?\n/).forEach(function(item) {
 			try {
 				messages.push(JSON.parse(item.trim()));
 			} catch (e) {
 				messages.push(item.trim());
 			}
 		});
 	}
 	messages.forEach(function(item) {
 		if (item) {
 			if (typeof item === 'object') {
 				if (typeof item.command === 'string' && item.args instanceof Array) {
 					if (item.command === 'runTest') {
 						try {
 							var testFile = studio.File(item.args[0]);
 							var currentProject = getProjectOfFile(testFile.path);
 							if (currentProject === null) {
 								postMessageToMonitor({
 									event: 'onError',
 									error: 'Command ' + item.command + ' failed',
 									data: 'You must select one and only one project in your Wakanda Solution.'
 								});
 							} else {
 								var testURL = getProjectAddress(currentProject.projectPath, currentProject.basePath);
 								var opened = studio.extension.showModelessDialog("runstudio.html", {
 									'waktest-path': testFile.path,
 									'waktest-url': testURL,
 									'waktest-projectpath': currentProject.basePath,
 									'waktest-automatic': true
 								}, {
 									title: '[Studio-Side Test] ' + testFile.name,
 									dialogwidth: 800,
 									dialogheight: 400,
 									resizable: true
 								});
 								if (opened === true) {
 									postMessageToMonitor({
 										event: 'onCommandRun',
 										command: item.command,
 										args: item.args,
 										result: true
 									});
 								} else {
 									postMessageToMonitor({
 										event: 'onError',
 										error: 'Command ' + item.command + ' could not be launched'
 									});
 								}
 							}
 						} catch (e) {
 							postMessageToMonitor({
 								event: 'onError',
 								error: 'Command ' + item.command + ' failed',
 								data: e
 							});
 						}
 					} else {
 						command = dotResolve(item.command, studio);
 						if (typeof command === 'function') {
 							try {
 								result = command.apply(studio, item.args);
 								postMessageToMonitor({
 									event: 'onCommandRun',
 									command: item.command,
 									args: item.args,
 									result: result
 								});
 							} catch (e) {
 								postMessageToMonitor({
 									event: 'onError',
 									error: 'Command ' + item.command + ' failed',
 									data: e
 								});
 							}
 						} else {
 							postMessageToMonitor({
 								event: 'onError',
 								error: 'Command ' + item.command + ' is undefined'
 							});
 						}
 					}
 				}
 			}
 		}
 	});
 }

 function postMessageToMonitor(message) {
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
 			monitor.onmessage = function(message) {
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
 	if (typeof message.params !== 'undefined' && typeof message.params.report === 'string') {
 		try {
 			message.params.report = JSON.parse(Base64.decode(message.params.report));
 			var consoleMessage = {
 				msg: 'Test suite ended: {%span class="green"%}' + message.params.report.passes + ' passed{%/span%}, {%span class="red"%}' + message.params.report.failures + ' failed{%/span%}, ' + message.params.report.skipped + ' skipped.',
 				type: 'INFO',
 				category: 'env'
 			};
 			studio.sendCommand('wakanda-extension-mobile-console.append.' + Base64.encode(JSON.stringify(consoleMessage)));
 		} catch (e) {
 			try {
 				message.params.report = JSON.parse(message.params.report);
 				var consoleMessage = {
 					msg: 'Test suite ended: {%span class="green"%}' + message.params.report.passes + ' passed{%/span%}, {%span class="red"%}' + message.params.report.failures + ' failed{%/span%}, ' + message.params.report.skipped + ' skipped.',
 					type: 'INFO',
 					category: 'env'
 				};
 				studio.sendCommand('wakanda-extension-mobile-console.append.' + Base64.encode(JSON.stringify(consoleMessage)));
 			} catch (ignore) {}
 		}
 	} else if (typeof message.params !== 'undefined' && typeof message.params.report === 'object') {
 		var consoleMessage = {
 			msg: 'Test suite ended: {%span class="green"%}' + message.params.report.passes + ' passed{%/span%}, {%span class="red"%}' + message.params.report.failures + ' failed{%/span%}, ' + message.params.report.skipped + ' skipped.',
 			type: 'INFO',
 			category: 'env'
 		};
 		studio.sendCommand('wakanda-extension-mobile-console.append.' + Base64.encode(JSON.stringify(consoleMessage)));
 	}
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
