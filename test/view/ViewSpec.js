describe("View", function() {
	var proto = View.prototype;

	beforeEach(function() {
		this.addMatchers({
			toBeInstanceOf: function(expected) {
				return this.actual instanceof expected;
			},
			toBeObject: function() {
				return typeof this.actual === 'object' && this.actual !== null;
			},

			toBeString: function() {
				return typeof this.actual === 'string';
			}
		});
	});

	it("creates a new View object", function() {
		var view = function() {
			return new View();
		};

		expect(view).not.toThrow();
	});

	it("generates a view unique id and set it to view.$id", function() {
		var mock = {};
		proto.createId.call(mock);
		expect(mock.$id).toBeDefined();
	});

	it('creates the view dom node from view.tagName', function() {
		var mock = {
			tagName: 'div'
		};

		proto.createView.call(mock);
		expect(mock.el).toBeDefined();
		expect(mock.$el).toBeDefined();
	});

	it('initializes the view options and calls view.initialize()', function() {
		var mock = {
			defaults: {
				test: true
			},
			setData: function() {},
			initialize: function() {}
		};

		var viewOptions = {
			option: 'value'
		};

		spyOn(mock, 'initialize');

		proto.initializeView.call(mock, viewOptions);
		expect(mock.test).toBeDefined();
		expect(mock.initialize).toHaveBeenCalled();
	});

	it('applies the view attributes', function() {
		var mock = {
			attributes: {
				title: 'test'
			},

			$el: {
				attr: function() {}
			}
		};

		spyOn(mock.$el, 'attr');
		proto.applyAttributes.call(mock);
		expect(mock.$el.attr).toHaveBeenCalledWith(mock.attributes);
	});

	it('applies view styles', function() {
		var mock = {
			styles: {
				color: 'white'
			},

			$el: {
				css: function() {}
			}
		};

		spyOn(mock.$el, 'css');
		proto.applyStyles.call(mock);
		expect(mock.$el.css).toHaveBeenCalledWith(mock.styles);
	});

	it("applies view's css classes", function() {
		var mock = {
			getPrototypeChain: function() {
				return ['one', ['two', 'three'], false];
			},
			$el: {
				addClass: function() {}
			}
		};

		spyOn(mock.$el, 'addClass');
		proto.applyClasses.call(mock);
		expect(mock.$el.addClass).toHaveBeenCalledWith('one two three');
	});

	// getPrototypeChain
	it('gets the list of values of property that was set on this object and into prototype chain', function() {
		// dummy class
		var ClassMock = function() {};

		// property into prototype
		ClassMock.prototype.property = 2;

		// reference to dummy class
		ClassMock.prototype.self = ClassMock;

		// reference to a superclass
		ClassMock.prototype.superclass = {
			property: 1
		};

		var mock = new ClassMock();

		// own property
		mock.property = 3;

		// list must be an array of each found value of 'property'
		var list = proto.getPrototypeChain.call(mock, 'property');

		expect(list).toEqual([1, 2, 3]);
	});

	it('returns a Template instance from a template property', function() {
		var mock = {
			template: '<span></span>',
			otherTemplate: '<div></div>'
		};

		var tpl = proto.getTemplate.call(mock);
		var otherTpl = proto.getTemplate.call(mock, 'otherTemplate');

		expect(mock.template).toBeInstanceOf(Template);
		expect(mock.otherTemplate).toBeInstanceOf(Template);
		expect(tpl).toBeInstanceOf(Template);
		expect(otherTpl).toBeInstanceOf(Template);
	});

	it("returns the view's data", function() {
		var options = {
			data: {}
		};

		var view = new View(options);
		var result = view.getData();

		expect(result).toBeObject();
		expect(result).toEqual(options.data);
	});

	it("Applies view's template", function() {
		var mock = {
			data: {},
			template: '<span></span>',

			// template
			getTemplate: function() {
				return new Template(this.template);
			},

			// data
			getData: function() {
				return this.data;
			},

			// helpers
			self: {
				helpers: {}
			},

			// dom node
			el: {
				innerHTML: null
			}
		};

		proto.applyTemplate.call(mock);
		expect(mock.el.innerHTML).toBeString();
	});

	it("undelegates the view's registered events", function() {
		var mock = {
			getId: function() {
				return 'id';
			},
			$el: {
				off: function() {}
			}
		};

		spyOn(mock.$el, 'off');
		proto.undelegateEvents.call(mock);
		expect(mock.$el.off).toHaveBeenCalled();
	});

	it('registers a DOM event', function() {
		var mock = {
			addEvent: proto.addEvent,
			$el: {
				on: function() {}
			},

			theCallback: function() {}
		};

		var spy = spyOn(mock.$el, 'on');
		mock.addEvent('click .on-me', 'theCallback');
		expect(spy).toHaveBeenCalled();
		spy.reset();

		mock.addEvent();
		expect(spy).not.toHaveBeenCalled();
	});

	it("delegates the view's events", function() {
		var mock = {
			getId: function() {
				return 'id';
			},
			undelegateEvents: function() {},
			events: {
				'click .on-me': 'callback',
				'mouseenter .its-nest': 'callback'
			},
			customEvents: {
				'click .on-me': 'callback',
				'click .on-you': 'callback'
			},
			addEvent: proto.addEvent,
			callback: function() {},

			$el: {
				on: function() {}
			}
		};

		spyOn(mock, 'addEvent').andCallThrough();
		spyOn(mock.$el, 'on');
		spyOn(mock, 'undelegateEvents');

		proto.delegateEvents.call(mock);
		expect(mock.undelegateEvents).toHaveBeenCalled();
		expect(mock.$el.on).toHaveBeenCalled();
		expect(mock.addEvent).toHaveBeenCalled();
		expect(mock.addEvent.callCount).toBe(4);
	});

	it('run pre/post processors', function() {
		var spyBefore = jasmine.createSpy('before'),
			spyAfter = jasmine.createSpy('after');

		View.before(spyBefore);
		View.after(spyAfter);

		var mock = {
			runProcessors: proto.runProcessors
		};

		mock.runProcessors('before');
		mock.runProcessors('after');
		expect(spyBefore).toHaveBeenCalled();
		expect(spyAfter).toHaveBeenCalled();

		delete View.processors;
	});
});