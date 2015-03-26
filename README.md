## Unit Test Add-On for [Wakanda Studio](http://wakanda.org)

This Add-On is part of a set of Unit Testing tools for [Wakanda](http://wakanda.org):

* [Unit Test Module](https://github.com/SebCourvoisier4D/waktest-module.git) for Wakanda Server
* [Unit Test Widget](https://github.com/SebCourvoisier4D/waktest-widget.git) for Wakanda WAF

The [Unit Test Module](https://github.com/SebCourvoisier4D/waktest-module.git) **is required** in order to run your Server-Side, Client-Side and Studio-Side unit tests.

### Version

0.0.1

### Supported test libraries

Through the [Unit Test Module](https://github.com/SebCourvoisier4D/waktest-module.git), this Add-On integrates the following test libraries:

* [Mocha](http://mochajs.org)
* [Chai](http://chaijs.com)

### Installation

1. Import the Add-On using the Add-ons tool of Wakanda Studio, via its URL: https://github.com/SebCourvoisier4D/waktest-addon.git
2. Restart Wakanda Studio

### Usage

This Add-On adds a **Unit Test** icon to the toolbar of the Code Editor.

**NB:** The current Solution **must** be started on the Server.

Create a new JS file and then you'll have access to the following features:

* __New Test Suite__: insert a template for a new Test Suite, which complies with the BDD style of [Mocha](http://mochajs.org/#assertions).
* __New Test Case (Expect): insert a template for a new Test Case, which complies with the __expect()__ assertions style provided by [Chai](http://chaijs.com/guide/styles/#expect).
* __New Test Case (Should): insert a template for a new Test Case, which complies with the __should__ assertions style provided by [Chai](http://chaijs.com/guide/styles/#should).
* __New Test Case (Async): insert a template for a new Asynchronous Test Case.
* __Run on the Server-Side__: run the test suite implemented in the current script on the Server-Side (SSJS).
* __Run on the Client-Side__: run the test suite implemented in the current script on the Client-Side (WAF). In order for this action to be performed, your Project **must** contain an "index" Page at the root of its WebFolder, and this Page **must** contain an instance of the [Unit Test Widget](https://github.com/SebCourvoisier4D/waktest-widget.git).
* __Run on the Studio-Side__: run the test suite implemented in the current script in the context of the Studio, which gives you access to the [Wakanda Studio Extensions API](http://doc.wakanda.org/home2.en.html#/Wakanda-Studio-Extensions-API/Wakanda-Studio-Extensions-API.100-872838.en.html).

### Development

### Todo's
