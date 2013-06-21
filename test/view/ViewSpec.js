describe("View", function() {

	// new View
	it('should create an empty view', function() {
		var e = new View();
		expect(e).toBeDefined();
		expect(e instanceof View).toBe(true);
	});

	// View.match()
	it('should register a view matcher and render a test template', function() {
		expect(function() {
			View.match(/\{\{([\s\S]+?)\}\}/, function(match) {
				return match;
			});
		}).not.toThrow();
	});

	// View.helper()
	it('should register a helper', function() {
		expect(function() {
			View.helper('testHelper', function() {
				console.log('helper check', arguments);
			});
		}).not.toThrow();
	});

	/**
	 * Covers:
	 * - constructor, initilizeTemplate, initializeView, createDom, getClassNames, getParentChain
	 * - update, renderView, runProcessors, updateDom, getData(), getBody()
	 */
	it('should render a simple view', function() {
		var SimpleView = View.extend({
			template: '<span>{{test}}</span>'
		});

		var data = {
			test: 'one'
		};

		var view = new SimpleView();
		view.update(data);
		expect(view.getData()).toEqual(data);
		expect(view.getBody()).toBe('<span>one</span>');
	});

	// .before()
	it('should register a preprocessor', function() {
		var BeforeTest = View.extend();
		var dataCheck = false;
		var a = new BeforeTest();
		View.before(function(data) {
			dataCheck = data;
		});

		a.update({
			test: true
		});

		expect(typeof dataCheck).toBe('object');
		expect(dataCheck.test).toBeDefined();
		expect(dataCheck.test).toBe(true);
		delete View.processors;
	});

	// :className
	it('should set view className', function() {
		var ClassCheck = View.extend({
			template: '<span>test</span>',
			className: ['one', 'two']
		});

		var SubCheck = ClassCheck.extend({
			className: 'three'
		});

		var sub = new SubCheck();
		// force rendering
		sub.update({});

		expect(sub.getDom().className).toBe('one two three');
	});

	// :attributes
	it('should set view attributes', function() {
		var AttrCheck = View.extend();
		var str = 'title test';
		var attr = new AttrCheck({
			attributes: {
				title: str
			}
		});
		// force rendering
		attr.update({});

		expect(attr.getDom().title).toBe(str);
	});
});