var root = this,
	has = {}.hasOwnProperty,
	emptyFn = function() {},
	$dom = root.jQuery || root.Zepto || root.ender || root.$,
	_ = root._ || root.$;

var defaultOptions = {
	evaluate: /\{\[([\s\S]+?)\]\}/,
	escape: /[\[]{2}([\s\S]+?)[\]]{2}/,
	interpolate: /[\{]{2}([\s\S]+?)[}]{2}/
};

var viewOptions = /^attributes|styles$/,
	eventSplitter = /^(\S+)\s*(.*)$/,

	generalEvents = {
		click: true,
		dblclick: true,
		contextmenu: true,
		mousedown: true,
		mouseup: true,
		mouseenter: true,
		mouseleave: true,
		mousemove: true,
		mouseout: true,
		mouseover: true,
		keydown: true,
		keypress: true,
		keyup: true,
		submit: true
	},

	formEvents = {
		submit: true
	},

	inputEvents = {
		focus: true,
		blur: true
	};

/**
 * @class View
 * @author Darlan Alves <darlan@moovia.com>
 */
var View = extend({
	tagName: 'div',

	/**
	 * @property {String|String[]) className
	 * CSS class names to add into view's DOM node
	 */
	className: false,

	/**
	 * @property {String} template
	 * The view's main template
	 */
	template: false,

	/**
	 * @property {Object} styles
	 * Styles to apply when the view is created
	 */
	styles: false,

	/**
	 * @property {Object} attributes
	 * Attributes to apply when the view is created
	 */
	attributes: false,

	/**
	 * @property {Object} defaultData
	 * Initial data to render view
	 */
	defaultData: false,

	/**
	 * @param {Object} defaults
	 * Default view options
	 */
	defaults: false,

	/**
	 * @property {Boolean} rendered
	 * True if view was already rendered
	 */
	rendered: false,

	/**
	 * @ignore
	 */
	el: false,

	/**
	 * The view is created as a hidden object
	 *
	 * Use {@link #show show method} to show it
	 */
	hidden: false,

	/**
	 * View events
	 * { event: handler }
	 *		event:		'click .some.selector'
	 *		event:		'mouseover'
	 *		handler:	'methodName'
	 *		handler:	function(){}
	 */
	events: false,

	/**
	 * @ignore
	 */
	customEvents: false,

	/**
	 * @property [autoRender=false]
	 * Will render the view after creation if set to true
	 */
	autoRender: false,

	/**
	 * Called once, when the view is initializing
	 */
	initialize: emptyFn,

	/**
	 * Called everytime the view's data changes
	 */
	render: emptyFn,

	/**
	 * Hook called before the render() call
	 */
	beforeRender: emptyFn,

	/**
	 * Hook called after the render() call
	 */
	afterRender: emptyFn,

	/**
	 * Returns a jQuery/Zepto wrapper to view's DOM node
	 */
	getEl: function() {
		return this.$el;
	},

	/**
	 * Returns the actual view's DOM node
	 */
	getDom: function() {
		return this.el;
	},

	/**
	 * Returns the view's innerHTML value
	 */
	getBody: function() {
		return this.el.innerHTML;
	},

	/**
	 * Returns the view's unique id
	 */
	getId: function() {
		return this.$id;
	},

	/**
	 * Updates the view with new data
	 * @param {Object} data
	 */
	update: function(data) {
		if (data !== undefined) {
			this.setData(data);
		}

		this.renderView();
		return this;
	},

	/**
	 * Show view
	 */
	show: function() {
		this.$el.show();
		return this;
	},

	/**
	 * Hide view
	 */
	hide: function() {
		this.$el.hide();
		return this;
	},

	/**
	 * Block view events
	 */
	block: function() {
		this.$el.addClass('ui-blocked');
		// TODO not a good option!
		// Events should be paused instead
		this.undelegateEvents();
		return this;
	},

	/**
	 * Unblock previously blocked view
	 */
	unblock: function() {
		this.$el.removeClass('ui-blocked');
		this.delegateEvents();
		return this;
	},

	/**
	 * Bind or delegate event (as same as call jQuery's .on method)
	 * @param event
	 * @param selector
	 * @param fn
	 */
	on: function() {
		this.$el.on.apply(this.$el, arguments);
		return this;
	},

	/**
	 * Unbind or undelegate event (as same as call jQuery's .off method)
	 * @param event
	 * @param selector
	 * @param fn
	 */
	off: function() {
		this.$el.off.apply(this.$el, arguments);
		return this;
	},

	appendTo: function(el) {
		this.ensureViewIsRendered();
		this.$el.appendTo(el);
		return this;
	},

	prependTo: function(el) {
		this.ensureViewIsRendered();
		this.$el.prependTo(el);
		return this;
	},

	insertBefore: function(el) {
		this.ensureViewIsRendered();

		if (!(el instanceof $dom)) {
			el = $dom(el);
		}
		el.before(this.$el);
		return this;
	},

	insertAfter: function() {
		this.ensureViewIsRendered();

		if (!(el instanceof $dom)) {
			el = $dom(el);
		}
		el.after(this.$el);
		return this;
	},

	/**
	 * Selects nodes inside view. Use the same parameters of a jQuery() call
	 */
	select: function() {
		return this.$el.find.apply(this.$el, arguments);
	},

	/**
	 * @private
	 */
	setVisible: function(value) {
		if (value === false) {
			this.hide();
		} else {
			this.show();
		}

		return this;
	},

	/**
	 * @constructor
	 * @param {Object} options
	 */
	constructor: function(options) {
		if (this.__initialize__ === false) {
			return;
		}

		this.createId();
		this.createView();
		this.initializeView(options || {});

		if (this.autoRender) {
			this.renderView();
		}
	},

	//=================
	// Private Methods
	//=================

	/**
	 * Initializes the view options. Calls .initialize()
	 * @param {Object} options
	 * @private
	 */
	initializeView: function(options) {
		options = _.merge({}, this.defaults || {}, options);

		_.pick(options, function(value, key) {
			if (viewOptions.test(key)) {
				delete options[key];
				this[key] = _.merge(this[key] || {}, value);
			}
		}, this);

		var data = this.defaultData || {};
		if (options.data) {
			data = _.merge(data, options.data);
			delete options.data;
		}
		this.setData(data);

		if (options.events) {
			this.customEvents = options.events;
			delete options.events;
		}

		_.extend(this, options);
		this.initialize(options);
	},

	/**
	 * View ID generator
	 */
	createId: function() {
		this.$id = _.uniqueId('view');
	},

	/**
	 * Creates the view's root DOM node
	 */
	createView: function() {
		var el = document.createElement(this.tagName);
		this.$el = $dom(el);
		this.el = el;
	},

	/**
	 * Make sure the view was rendered and DOM is ready
	 * @private
	 */
	ensureViewIsRendered: function() {
		if (!this.rendered) {
			this.renderView();
		}
	},

	/**
	 * Does the view render process
	 * Will call the needed methods to get data, build DOM, bind events and run processors
	 * @private
	 */
	renderView: function() {
		this.rendered = true;
		this.applyAttributes();
		this.applyStyles();
		this.applyClasses();
		this.applyTemplate();
		this.delegateEvents();
		this.runProcessors('before');
		this.beforeRender();
		this.render();
		this.runProcessors('after');
		this.afterRender();

		if (this.hidden) {
			this.hide();
		}
	},

	/**
	 * Ensure the view DOM nodes and events are destroyed
	 */
	destroyView: function() {
		this.undelegateEvents();
		this.$el.remove();
		this.el = this.$el = null;
	},

	/**
	 * Runs a group of view processors
	 * @param {String} name		Group name
	 * @private
	 */
	runProcessors: function(name) {
		if (!(View.processors && View.processors[name] && View.processors[name].length)) {
			return;
		}

		var i, len, list = View.processors[name];

		// calls each processor in scope of current instance
		for (i = 0, len = list.length; i < len; i++) {
			list[i].call(this);
		}
	},

	/**
	 * Applies view's attributes (see {@link View#attributes})
	 * @private
	 */
	applyAttributes: function() {
		if (this.attributes !== false) {
			this.$el.attr(this.attributes);
		}
	},

	/**
	 * Applies view's styles (see {@link View#styles})
	 * @private
	 */
	applyStyles: function() {
		if (this.styles !== false) {
			this.$el.css(this.styles);
		}
	},

	/**
	 * Applies view's class names (see {@link View#className})
	 * @private
	 */
	applyClasses: function() {
		var list = [];

		_.each(this.getPrototypeChain('className'), function(item) {
			if (item === false) {
				return;
			}

			if (_.isArray(item)) {
				item = item.join(' ');
			}

			list.push(item);
		});

		this.$el.addClass(list.join(' '));
	},

	/**
	 * Creates the view inner HTML nodes from view's template. See {@link View#template}
	 * @private
	 */
	applyTemplate: function() {
		var template = this.getTemplate(),
			data = this.getData();

		this.el.innerHTML = template.render(data, this.self.helpers);
	},

	/**
	 * Returns a list of values that were set into this instance and prototype chain
	 * @param {String} property		Property name
	 * @return {Array}
	 */
	getPrototypeChain: function(property) {
		var parent, list = [],
			_self = this.self.prototype;

		if (has.call(this, property)) {
			list.push(this[property]);
		}

		if (has.call(_self, property)) {
			list.unshift(_self[property]);
		}

		parent = this.superclass;
		while (parent) {
			if (has.call(parent, property)) {
				list.unshift(parent[property]);
			}

			parent = parent.superclass;
		}

		return list;
	},

	/**
	 * Returns a Template object
	 * @param {String} propertyName		The property where template is defined
	 * @return {Template}
	 */
	getTemplate: function(name) {
		if (name === undefined) {
			name = 'template';
		}

		var template = this[name];

		if (!(template instanceof Template)) {
			template = new Template(template);
			this[name] = template;
		}

		return template;
	},

	/**
	 * Returns the data used to render view
	 * @return {Object}
	 */
	getData: function() {
		return this.data;
	},

	/**
	 * Sets the view data
	 * @private
	 */
	setData: function(data) {
		this.data = data;
		return this;
	},

	/**
	 * Adds an event listener to view
	 * @param {String} event				Event name (e.g: click)
	 * @param {Function|String} method		Callback or a method name on this object
	 * @param {String} [suffix]				Event suffix
	 * @private
	 */
	addEvent: function(event, method, suffix) {
		if (typeof method === 'string') {
			var me = this,
				name = method;

			// TODO use Function.bind if is possible
			method = function() {
				me[name].apply(me, arguments);
			};
		}

		if (typeof method !== 'function') {
			return false;
		}

		var match = event.match(eventSplitter);
		var eventName = match[1],
			selector = match[2];

		eventName += suffix || '';
		if (selector === '') {
			this.$el.on(eventName, method);
		} else {
			this.$el.on(eventName, selector, method);
		}

		return this;
	},

	/**
	 * Binds events to view's DOM, from this.events or this.customEvents (defined as option.events upon creation)
	 * @private
	 */
	delegateEvents: function() {
		if (this.events === false && this.customEvents === false) {
			return;
		}

		// remove previously attached events
		this.undelegateEvents();

		var eventSuffix = '.delegate' + this.getId();

		if (this.events) {
			_.each(this.events, function(method, event) {
				this.addEvent(event, method, eventSuffix);
			}, this);
		}

		if (this.customEvents) {
			_.each(this.customEvents, function(method, event) {
				this.addEvent(event, method, eventSuffix);
			}, this);
		}

		return this;
	},

	/**
	 * Removes previously bound events
	 * @private
	 */
	undelegateEvents: function() {
		this.$el.off('.delegate' + this.getId());
		return this;
	},

	statics: {
		helpers: {},

		/**
		 * Adds a helper function to view
		 * @param {String} helperName
		 * @param {Function} helper
		 *
		 * Helpers can be accessed inside templates like this:
		 *		'<span>[this.myHelper(...)]</span>'
		 *
		 * Also, a evaluated matcher must be set to run the code above.
		 *
		 * See {@link View#match matchers}
		 */
		helper: function(name, fn) {
			this.helpers[name] = fn;
			return this;
		},

		/**
		 * Adds a matcher RegExp to view templating. A matcher is a RegExp to a placeholder
		 * @param {RegExp|String} matcher
		 * @param {Function} [replaceFn]
		 *
		 * If `replaceFn` is omitted, the matcher will be threated as a code to evaluate, instead of a
		 * placeholder to data. This way, it's possible to replace data and run code inside templates.
		 *
		 * At least one evaluated matcher (without fn) should be registered in order to enable the use
		 * of helpers. See the examples below:
		 *
		 * <code>
		 * View.matcher(/\[([\S\s]+?)\]/)			// "...[this.something()]..." is evaluated
		 * View.matcher(/\{([\S\s]+?)\}/)			// "...{title}..." is replaced with data.title
		 * </code>
		 */
		match: function(matcher, fn) {
			Template.registerProcessor(matcher, fn);
			return this;
		},

		/**
		 * Adds a processor to this class
		 * @param {String} name		Processor name
		 * @param {Function} fn		Processor callback
		 * @private
		 */
		addProcessor: function(name, fn) {
			if (!this.processors) {
				this.processors = {};
			}

			if (!this.processors[name]) {
				this.processors[name] = [];
			}

			this.processors[name].push(fn);
		},

		/**
		 * Adds a view preprocessor
		 * @param {Function} callback
		 * @static
		 */
		before: function(fn) {
			this.addProcessor('before', fn);
			return this;
		},

		/**
		 * Adds a view postprocessor
		 * @param {Function} callback
		 * @static
		 */
		after: function(fn) {
			this.addProcessor('after', fn);
			return this;
		}
	}
});

exports.View = View;

/**
 * Features:
 * - preprocessors			View.before(fn)
 * - postprocessors			View.after(fn)
 * - matchers				View.match(matcher, [fn])
 * - helpers				View.helper(name, fn)

 * - reactive				this.update(data)
 * - jQuery/Zepto
 * - lo-dash utilities

 * TODO
 * - liverange
 */

/**
 * Config:
 * - hidden
 * - styles
 * - attributes
 * - events
 */

/**
 * Methods:
 * - constructor(options)
 * - initialize
 * - render
 * - select(selector)
 * - getEl
 * - getDom
 * - getId
 * - getBody
 * - show
 * - hide
 * - destroy
 * - block
 * - unblock
 * - update(data)
 * - append/prepend(el)
 * - insertBefore/After(el)
 */