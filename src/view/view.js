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

var viewOptions = /^attributes|styles|events|hidden$/,
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

var View = extend({
	statics: {
		helpers: {},

		helper: function(name, fn) {
			this.helpers[name] = fn;
			return this;
		},

		match: function(matcher, fn) {
			Template.registerProcessor(matcher, fn);
			return this;
		},

		addProcessor: function(pos, fn) {
			if (!this.processors) {
				this.processors = {};
			}

			if (!this.processors[pos]) {
				this.processors[pos] = [];
			}

			this.processors[pos].push(fn);
		},

		before: function(fn) {
			this.addProcessor('before', fn);
			return this;
		},

		after: function(fn) {
			this.addProcessor('after', fn);
			return this;
		},
	},

	tagName: 'div',
	className: false,
	template: false,
	styles: false,
	attributes: false,
	el: false,
	defaults: false,
	rendered: false,
	hidden: false,

	// { event: handler }
	// event:		click .some .selector
	// event:		mouseover
	// handler:		'methodName'
	// handler:		function(){}
	events: false,

	autoRender: false,

	initialize: emptyFn,
	render: emptyFn,
	beforeRender: emptyFn,
	afterRender: emptyFn,

	getEl: function() {
		return this.$el;
	},

	getDom: function() {
		return this.el;
	},

	getBody: function() {
		return this.el.innerHTML;
	},

	getId: function() {
		return this.$id;
	},

	update: function(data) {
		this.setData(data);
		this.renderView();
	},

	show: function() {
		this.$el.show();
		return this;
	},

	hide: function() {
		this.$el.hide();
		return this;
	},

	block: function() {
		this.$el.addClass('ui-blocked');
		this.undelegateEvents();
	},

	unblock: function() {
		this.$el.removeClass('ui-blocked');
		this.delegateEvents();
	},

	on: function( /* event, selector, fn */ ) {
		this.$el.on.apply(this.$el, arguments);
	},

	off: function( /* event, selector, fn */ ) {
		this.$el.off.apply(this.$el, arguments);
	},

	appendTo: function(el) {
		this.ensureView();
		this.$el.appendTo(el);
	},

	prependTo: function(el) {
		this.ensureView();
		this.$el.prependTo(el);
	},

	insertBefore: function(el) {
		this.ensureView();
		if (!(el instanceof $dom)) el = $dom(el);
		el.before(this.$el);
	},

	insertAfter: function() {
		this.ensureView();
		if (!(el instanceof $dom)) el = $dom(el);
		el.after(this.$el);
	},

	select: function() {
		return this.$el.select.apply(this.$el, arguments);
	},

	setVisible: function(value) {
		if (value === false) {
			this.hide();
		} else {
			this.show();
		}
	},

	constructor: function(options) {
		if (this.__initialize__ === false) return;
		this.$id = _.uniqueId('view');
		this.createView();
		this.doInitialize(options);

		if (this.autoRender) {
			this.renderView();
		}
	},

	//=================
	// Private Methods
	//=================
	ensureView: function() {
		if (!this.rendered) {
			this.renderView();
		}
	},

	doInitialize: function(options) {
		options = _.merge({}, this.defaults || {}, options);

		_.pick(options, function(value, key) {
			if (viewOptions.test(key)) {
				delete options[key];
				this[key] = value;
			}
		}, this);

		if (options.data) {
			this.setData(options.data);
			delete options.data;
		}

		this.options = options;
		this.initialize(options);
	},

	getOptions: function() {
		return this.options;
	},

	createView: function() {
		var el = document.createElement(this.tagName);
		this.$el = $dom(el);
		this.el = el;
	},

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
		this.setVisible(!this.hidden);
	},

	runProcessors: function(name) {
		if (!(View.processors && View.processors[name])) return;

		var data = this.getData();
		_.each(View.processors[name], function(fn) {
			fn.call(this, data);
		}, this);
	},

	destroyView: function() {
		this.undelegateEvents();
		this.$el.remove();
		this.el = this.$el = null;
	},

	applyAttributes: function() {
		if (this.attributes !== false) {
			this.$el.attr(this.attributes);
		}
	},

	applyStyles: function() {
		if (this.styles !== false) {
			this.$el.css(this.styles);
		}
	},

	applyClasses: function() {
		var _self = this.self.prototype,
			list = [],
			sp = ' ',
			item, ownerPrototype, cls = 'className';

		if (has.call(_self, cls)) {
			list.unshift(_self[cls]);
		}

		ownerPrototype = this.superclass;
		while (ownerPrototype) {
			if (has.call(ownerPrototype, cls)) {
				item = ownerPrototype[cls];
				if (item !== false) {
					if (_.isArray(item)) {
						item = item.join(sp);
					}

					list.unshift(item);
				}
			}

			ownerPrototype = ownerPrototype.superclass;
		}

		this.$el.addClass(list.join(sp));
	},

	applyTemplate: function() {
		var template = this.getTemplate(),
			data = this.getData();

		this.el.innerHTML = template.render(data, this.self.helpers);
	},

	getTemplate: function(name) {
		if (name !== undefined) {
			var template = this[name];
		} else {
			var template = this.template || '';
		}

		if (!(template instanceof Template)) {
			template = new Template(template);
			this[name] = template;
		}

		return template;
	},

	getData: function() {
		return this.data;
	},

	setData: function(data) {
		data.id = this.getId();
		this.data = data;
	},

	delegateEvents: function() {
		if (this.events !== false) {
			var eventSuffix = '.delegate' + this.getId();

			_.each(events, function(method, event) {
				if (typeof method !== 'function') {
					method = this[method];
				}
				if (!method) return;

				var match = eventSplitter.match(event);
				var eventName = match[1],
					selector = match[2];

				eventName += eventSuffix;
				if (selector === '') {
					this.$el.on(eventName, method);
				} else {
					this.$el.on(eventName, selector, method);
				}
			}, this);
		}

		return this;
	},

	undelegateEvents: function() {
		this.$el.off('.delegate' + this.getId());
		return this;
	}
});

exports.View = View;

/**
 * Features:
 * - preprocessors			this.before(fn)
 * - postprocessors			this.after(fn)
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
 * - autoRender
 * - styles
 * - attributes
 * - events
 */

/**
 * Methods:
 * - constructor(template, options)
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