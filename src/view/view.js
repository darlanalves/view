/**
 * Features:
 * - preprocessors			this.before(fn)
 * - postprocessors			this.after(fn)
 * - matchers				View.match(matcher, [fn])
 * - helpers				View.helper(name, fn)
 * - reactive				this.update(data)
 * - liverange
 * - jQuery/Zepto DOM/Events
 * - lo-dash utilities
 */

/**
 * Properties:
 * - tagName
 * - className[]
 * - id
 * - template (html)
 */

/**
 * Config:
 * - hidden
 * - autoRender
 * - styles
 * - attributes
 */

/**
 * Methods:
 * - constructor(template, options)
 * - initialize
 * - render
 * - select(selector)
 * - getEl
 * - getDomEl
 * - getId
 * - show
 * - hide
 * - destroy
 * - block
 * - unblock
 * - update(data)
 * - append/prepend(el)
 * - insertBefore/After(el)
 */

var root = this,
	has = {}.hasOwnProperty,
	emptyFn = function() {},
	$dom = root.jQuery || root.Zepto || root.ender || root.$,
	$util = root._ || root.$;

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
		}
	},

	tagName: 'div',
	className: false,
	id: false,
	template: false,
	autoRender: false,
	styles: false,
	attributes: false,

	constructor: function(options) {
		this.initializeTemplate(this.template);
		this.$before = [];
		this.$after = [];
		this.initializeView(options);
		this.renderView();
	},

	initialize: emptyFn,
	render: emptyFn,

	before: function(fn) {
		this.$before.push(fn);
		return this;
	},

	after: function(fn) {
		this.$after.push(fn)
		return this;
	},

	update: function(data) {
		this.$data = data;
		return this.renderView();
	},

	getEl: function() {
		return this.$el;
	},

	getDomEl: function() {
		return this.el;
	},

	select: function() {
		return this.$el.select.apply(this.$el, arguments);
	},

	show: function() {

	},

	hide: function() {

	},

	destroy: function() {

	},

	block: function() {

	},

	unblock: function() {

	},

	// ===== Private Methods =====
	initializeTemplate: function(template) {
		this.$template = Template.create(template || '');
	},

	initializeView: function(options) {
		this.createDom();
		this.initialize(options);
	},

	renderView: function() {
		this.runProcessors(this.$before);
		this.updateDom();
		this.render();
		this.runProcessors(this.$after);
		return this.el.innerHTML;
	},

	runProcessors: function(processors) {
		var me = this;
		$util.each(processors, function(fn) {
			fn.call(me, me.$data);
		});
	},

	createDom: function() {
		if (this.el) {
			this.destroyDom();
		}

		var el = document.createElement(this.tagName);
		el.className = this.getClassNames().join(' ');
		this.el = el;
		this.$el = $dom(el);
	},

	destroyDom: function() {
		this.$el.unbind();
		this.$el.remove();
	},

	updateDom: function() {
		this.el.innerHTML = this.$template.render(this.$data, this.self.helpers);
	},

	getClassNames: function() {
		if (this.$classNames) {
			return this.$classNames;
		}

		var list = this.getParentChain('className'),
			result = [];

		$util.each(list, function(item) {
			if (typeof item === 'string') {
				result.push(item);
			} else if ($util.isArray(item)) {
				result = result.concat(item);
			}
		});

		return this.$classNames = result;
	},

	getParentChain: function(property) {
		var result = [];
		if (has.call(this, property)) {
			result.push(this[property]);
		}

		var parent = this.superclass;
		do {
			if (has.call(parent, property)) {
				result.push(parent[property]);
			}
			parent = parent.superclass;
		} while (typeof parent === 'object');

		return result;
	}
});

/*
copy = function(destination, source) {
	var name;
	for (name in source) {
		if (has.call(source, name)) {
			destination[name] = source[name];
		}
	}

	return destination;
},

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

var defaultOptions = {
	evaluate: /\{\[([\s\S]+?)\]\}/,
	escape: /[\[]{2}([\s\S]+?)[\]]{2}/,
	interpolate: /[\{]{2}([\s\S]+?)[}]{2}/
};

// escape
var htmlEscapes = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#39;'
};

var reUnescapedHtml = /[&<>"']/g;

function escapeHtmlChar(match) {
	return htmlEscapes[match];
}

function escape(string) {
	return string == null ? '' : String(string).replace(reUnescapedHtml, escapeHtmlChar);
}
// end escape

function merge(d) {
	var src = slice.call(arguments, 1),
		i = 0,
		len = src.length;
	for (; i < len; i++) {
		d = copy(d, src[i]);
	}

	return d;
}
*/

exports.View = View;