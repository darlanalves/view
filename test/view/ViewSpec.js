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
			View.match('<<([\s\S]+?)>>', function(match) {
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

	// View.constructor() > update()
	it('should render a simple view', function() {
		var v = new View('<<test>>');
		expect(v.update({
			test: 'one'
		})).toBe('one');
	});

	// .before()
	it('should register a preprocessor', function() {
		var BeforeTest = View.extend();
		var dataCheck = false;
		var a = new BeforeTest();
		a.before(function(data) {
			dataCheck = data;
		});

		a.update({test: true});

		expect(typeof dataCheck).toBe('object');
		expect(dataCheck.test).toBeDefined();
		expect(dataCheck.test).toBe(true);
	});

	// :className
	it('should set classNames', function() {
		var ClassTestOne = View.extend({
			className: 'class-one'
		});

		var ClassTestTwo = ClassTestOne.extend({
			className: ['class-two', 'awesome']
		});

		var a = new ClassTestOne();
		var b = new ClassTestTwo();

		expect(a.getClassNames()).toEqual(['class-one']);
		expect(a.getDomEl().className).toBe('class-one');

		expect(a.getClassNames()).toEqual(['class-one', 'class-two', 'awesome']);
		expect(a.getDomEl().className).toBe('class-one class-two awesome');
	});

	// :attributes
	it('should set view attributes', function() {

	});
});