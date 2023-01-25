/** $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ */

/** files */
var SCRIPTS = [ "core.js", "tabTree.js" ];
var STYLES = [ "style/grey/css/reset.css", "style/grey/css/tabTree.css" ];

/** $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ */

if (typeof Un == "undefined")
	Un = {};

Un.CodeLoader = {
	getRoot : function() {
		var scriptSrc, match, scripts = document.getElementsByTagName('script');

		for ( var i = 0, ln = scripts.length; i < ln; i++) {
			scriptSrc = scripts[i].src;
			match = scriptSrc.match(/load\.js$/);
			if (match) {
				var path = scriptSrc.substring(0, scriptSrc.length
						- match[0].length);
				return path;
			}
		}
	},
	loadScript : function(src) {
		var script = document.createElement("script");
		script.src = src;
		document.appendChild(script);
	},
	loadStyle : function(src) {
		var link = document.createElement("link");
		link.href = src;
		link.rel = "stylesheet";
		link.type = "text/css";
		document.appendChild(link);
	},
	loadScripts : function(scripts) {
		for ( var i = 0, len = scripts.length; i < len; i++) {
			this.loadScript(Un.ROOT + scripts[i]);
		}
	},
	loadStyles : function(styles) {
		for ( var i = 0, len = styles.length; i < len; i++) {
			this.loadStyle(Un.ROOT + styles[i]);
		}
	}
};

Un.ROOT = Un.CodeLoader.getRoot();

Un.CodeLoader.loadScripts(SCRIPTS);
Un.CodeLoader.loadStyles(STYLES);
