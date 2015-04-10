## Unit Test Extension for [Wakanda Studio](http://wakanda.org)

This Extension is part of a set of Unit Testing tools for [Wakanda](http://wakanda.org), that includes the [Unit Test Widget](https://github.com/SebCourvoisier4D/UnitTestWidget.git) for Wakanda WAF

### Version

0.0.2

### Supported test libraries

Through the Unit Test Service (included in Wakanda Server v11+), this Extension integrates the following test libraries:

* [Mocha](http://mochajs.org)
* [Chai](http://chaijs.com)

### Installation

1. Install the Extension using the Add-ons tool of Wakanda Studio
2. Restart Wakanda Studio

### Usage

This Extension adds a **Unit Test** icon to the toolbar of the Code Editor.

**NB:** The current Solution **must** be started on the Server and the Unit Test Service **must** be enabled for the current Project by adding the follwing line in its .waSettings file:

```
<service name="unitTest" modulePath="services/unitTest" enabled="true" autoStart="true"/>
```

Create a new JS file and then you'll have access to the following features:

* __New Test Suite__: insert a template for a new Test Suite, which complies with the BDD style of [Mocha](http://mochajs.org/#assertions).
* __New Test Case (Expect)__: insert a template for a new Test Case, which complies with the __expect()__ assertions style provided by [Chai](http://chaijs.com/guide/styles/#expect).
* __New Test Case (Should)__: insert a template for a new Test Case, which complies with the __should__ assertions style provided by [Chai](http://chaijs.com/guide/styles/#should).
* __New Test Case (Async)__: insert a template for a new Asynchronous Test Case.
* __Run on the Server-Side__: run the test suite implemented in the current script on the Server-Side (SSJS).
* __Run on the Client-Side__: run the test suite implemented in the current script on the Client-Side (WAF). In order for this action to be performed, your Project **must** contain an "index" Page at the root of its WebFolder, and this Page **must** contain an instance of the [Unit Test Widget](https://github.com/SebCourvoisier4D/UnitTestWidget.git).
* __Run on the Studio-Side__: run the test suite implemented in the current script in the context of the Studio, which gives you access to the [Wakanda Studio Extensions API](http://doc.wakanda.org/home2.en.html#/Wakanda-Studio-Extensions-API/Wakanda-Studio-Extensions-API.100-872838.en.html).

### Development

### Todo's
