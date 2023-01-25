Un.CONTEXT_PATH = "";
Un.Reader = Un
		.newClass( {
			public : {
				url : null,
				read : function(param, callBack, caller) {
					var obj = {
						url : this.url,
						param : param,
						caller : caller,
						success : function(text) {
							if (text == "gologin") {
								window.location.href = Un.CONTEXT_PATH + "/jsp/login.jsp";
							} else {
								var data = eval("(" + text + ")");
								callBack.call(this, data);
							}
						}
					};
					Un.Ajax.request(obj);
				}
			}
		});

Un.Table = Un.newClass( {
	extend : Un.Component,
	public : {
		tagName : "table",
		tbody : null,
		columnCount : 0,
		addRow : function(e) {
			this.tbody.appendChild(e);
		}
	},
	constructor : function() {
		this.tbody = new Un.Element( {
			tagName : "tbody"
		});
		this.appendChild(this.tbody);
	}
});

Un.Table.Tr = Un.newClass( {
	extend : Un.Element,
	public : {
		tagName : "tr",
		$ : {
			className : "u_tabTree_tr"
		}
	}
});

Un.Table.Th = Un.newClass( {
	extend : Un.Element,
	public : {
		tagName : "th",
		$ : {
			className : "u_tabTree_th"
		}
	}
});

Un.Table.Td = Un.newClass( {
	extend : Un.Element,
	public : {
		tagName : "td",
		text : null,
		$ : {
			className : "u_tabTree_td"
		}
	},
	constructor : function() {
		if (this.text) {
			var span = new Un.Element("span");
			span.e.innerHTML = this.text;
			this.appendChild(span);
		}
	},
	static : {
		addTitle : function(te, ti) {
			if (typeof te == "string")
				te = new Un.Element("span", null, te);
			ti = ti || te.e.innerHTML;
			te.e.title = ti;
			return te;
		}
	}
});

Un.TabTree = Un.newClass( {
	extend : Un.Table,
	public : {
		tagName : "table",
		$ : {
			className : "u_tabTree"
		},
		head : null,
		hotTr : null,
		reader : null,
		id : null,
		columnCount : 0,
		trLively : false,
		showIndex : false,
		activeBranch : false,
		activeLeaf : false,
		root : null,
		addTr : function(tr) {
			if (!(tr instanceof Un.TabTree.Tr)) {
				tr = new Un.TabTree.Tr(this, tr);
			}
			var c = this.columnCount - tr.e.children.length;
			var tag = tr.e.children[0].tagName;
			for ( var i = 0; i < c; i++) {
				tr.appendChild(new Un.Element(tag));
			}
			tr.tabTree = this;
			this.addRow(tr);
		},
		addRootTr : function(tr) {
			this.addTr(tr);
			tr.setStyle("display", "none");
			this.id = tr.id;
			tr.tabTree = this;
			this.root = tr;
		},
		load : function() {
			this.root.expand();
		},
		unload : function() {
			var trs = this.root.childTrs;
			for ( var i = 0, le = trs.length; i < le; i++) {
				trs[i].unload();
			}
		},
		expandByCounts : function(c) {
			this.root.expandByCounts(c);
		}
	},
	constructor : function() {
		this.addRow(this.head);
		this.columnCount = this.head.columnCount;
		if (this.root) {
			this.addRootTr(this.root);
			this.root.tabTree = this;
		}
	}
});

Un.TabTree.Head = Un.newClass( {
	extend : Un.Table.Tr,
	public : {
		columnCount : 0,
		model : null,
		renderers : null
	},
	constructor : function() {
		this.renderers = [];
		for ( var i = 0, le = this.model.length; i < le; i++) {
			var m = this.model[i];
			var th = new Un.Table.Th();
			th.appendChild(new Un.Element("span", null, m.text));
			if (m.width)
				th.setStyle("width", m.width + "px");
			this.appendChild(th);
			this.renderers[i] = m.renderer;
		}
		this.columnCount = this.model.length;
	}
});

Un.TabTree.Tr = Un.newClass( {
	extend : Un.Table.Tr,
	public : {
		id : null,
		leaf : false,
		texts : null,
		value : null,
		childTrs : null,
		icon : null,
		tabTree : null,
		tds : null,
		isTitle : false,
		lively : false,
		canActive : false,
		index : -1,
		isHot : function() {
			return this.hasClass(Un.TabTree.Tr.C_HOT);
		},
		isOpen : function() {
			return this.icon.isExpand();
		},
		isEmpty : function() {
			if (this.childTrs.length == 0)
				return true;
			return false;
		},
		getChildByCount : function(i) {
			return this.childTrs[--i];
		},
		getLastChild : function() {
			if (this.childTrs.length == 0)
				return this;
			return this.childTrs[this.childTrs.length - 1];
		},
		getLastTr : function() {
			var tr = this.getLastChild();
			if (tr.childTrs.length > 0)
				return tr.getLastTr();
			else
				return tr;
		},
		addChild : function(tr) {
			if (!(tr instanceof Un.TabTree.Tr)) {
				tr.lively = this.tabTree.trLively;
				tr.index = this.childTrs.length;
				if (tr.children) {
					var children = tr.children;
					delete tr.children;
				}
				tr = new Un.TabTree.Tr(this.tabTree, tr);
			}
			this.getLastTr().insertAfter(tr);
			this.childTrs.push(tr);
			this.icon.expand();
			if (children)
				tr.addChildren(children);
		},
		addChildren : function(trs) {
			for ( var i = 0, le = trs.length; i < le; i++) {
				this.addChild(trs[i]);
			}
		},
		removeChildren : function() {
			for ( var i = 0, le = this.childTrs.length; i < le; i++) {
				this.childTrs[i].removeChildren();
				this.childTrs[i].destroy();
			}
			this.childTrs = [];
		},
		loadData : function(data) {
			data = this.parseData(data);
			this.addChildren(data);
			this.expandByCounts();
		},
		load : function() {
			var param = {
				rootId : this.tabTree.id,
				nodeId : this.id
			};
			this.tabTree.reader.read(param, this.loadData, this);
		},
		unload : function() {
			this.removeChildren();
			this.shrink();
		},
		expandByCounts : function(c) {
			if (c)
				if (c.length == 0)
					this.hot();
				else
					this.expandCounts = c;
			if (!this.expandCounts)
				return;
			if (!this.leaf) {
				this.expand();
				if (!this.isEmpty() && this.expandCounts
						&& this.expandCounts.length > 0) {
					var co = this.expandCounts;
					var child = this.getChildByCount(co[0]);
					co.shift();
					child.expandByCounts(co);
					this.expandCounts = null;
				}
			}
		},
		expand : function() {
			if (!this.leaf) {
				if (this.isEmpty()) {
					this.load();
				} else {
					for ( var i = 0, le = this.childTrs.length; i < le; i++) {
						this.childTrs[i].show();
					}
					this.icon.expand();
				}
			}
		},
		shrink : function() {
			if (!this.leaf) {
				for ( var i = 0, le = this.childTrs.length; i < le; i++) {
					this.childTrs[i].hide();
					this.childTrs[i].shrink();
				}
				this.icon.shrink();
			}
		},
		onOff : function() {
			if (this.isOpen()) {
				this.shrink();
			} else {
				this.expand();
			}
		},
		active : function() {
			if (this.isHot()) {
				this.cold();
			} else {
				this.hot();
			}
		},
		hot : function() {
			this.addClass(Un.TabTree.Tr.C_HOT);
			var tr = this.tabTree.hotTr || this;
			if (tr != this)
				tr.cold();
			this.tabTree.hotTr = this;
		},
		cold : function() {
			this.removeClass(Un.TabTree.Tr.C_HOT);
			if (this.tabTree.hotTr == this)
				this.tabTree.hotTr = null;
		},
		build : function() {
			var tds = [];
			var first = true;
			if (!this.texts)
				this.texts = [ " " ];
			for ( var i = 0, le = this.texts.length; i < le; i++) {
				var text = this.texts[i];
				if ("" != text && text) {
					tds[i] = new Un.Table.Td();
					if (this.tabTree && this.tabTree.head) {
						var renderers = this.tabTree.head.renderers;
						if (renderers[i]) {
							text = renderers[i](text);
						}
					}
					if (!this.leaf && first) {
						var icon = new Un.TabTree.Icon();
						if (this.lively != true)
							icon.addListener("click", this.onOff, this, false);
						this.icon = icon;
						tds[i].appendChild(icon);
						first = false;
						var span = new Un.Element("span");
						span.setInnerHtml(text);
						text = span;
					}
					tds[i].setInnerHtml(text);
				} else {
					if (this.tabTree && this.tabTree.showIndex && i == 0
							&& this.leaf) {
						var span = new Un.Element("span", "index",
								(this.index + 1) + ".");
						tds[i] = new Un.Table.Td( {
							tagName : "td",
							children : [ span ]
						});
					} else {
						tds[i] = new Un.Element("td");
					}
				}
			}
			this.tds = tds;
		},
		parseText : function(texts, level, length, includeYtNum) {
			if (level > 1) {
				level--;
			} else {
				var title = true;
			}
			var newTexts = [];
			for ( var i = 0, le = level - 1; i < le; i++) {
				newTexts.push("");
			}
			for ( var i = 0, le = texts.length; i < le; i++) {
				newTexts.push(texts[i]);
			}
			for ( var i = newTexts.length, len = length - 1; i < len; i++) {
				newTexts.push("");
			}
			if (includeYtNum) {
				if (title) {
					var text = new Un.Element("span", "green", includeYtNum);
					newTexts.push(text);
				} else
					newTexts.push(includeYtNum);
			} else {
				newTexts.push("");
			}
			return newTexts;
		},
		parseNode : function(node) {
			var newNode = {};

			if (node.leaf) {
				newNode.leaf = true;
				if (this.tabTree.activeLeaf)
					newNode.canActive = true;
			} else if (this.tabTree.activeBranch) {
				newNode.canActive = true;
			}
			delete node.leaf;

			texts = node.text.split(";");
			var level = node.level;
			if (level < 3) {
				newNode.isTitle = true;
			}
			var newTexts = this.parseText(texts, --level,
					this.tabTree.columnCount, node.includeYtNum);
			newNode.texts = newTexts;
			delete node.text;

			if (node.children)
				newNode.children = this.parseData(node.children);
			delete node.children;

			Un.copy(newNode, node);

			return newNode;
		},
		parseData : function(data) {
			var newDate = new Array();
			for ( var i = 0, le = data.length; i < le; i++) {
				var node = data[i];
				var newNode = this.parseNode(node);
				newDate.push(newNode);
			}
			return newDate;
		}
	},
	constructor : function(tabTree) {
		if (tabTree instanceof Un.TabTree)
			this.tabTree = tabTree;
		this.tds = [];
		this.childTrs = [];
		this.build();
		for ( var i = 0, le = this.tds.length; i < le; i++) {
			td = Un.Table.Td.$(this.tds[i]);
			if (0 == i)
				td.addClass("u_tabTree_td_c1");
			this.appendChild(td);
		}
		if (this.isTitle)
			this.addClass("u_tabTree_tr_title");
		if (this.canActive) {
			this.addListener("click", this.active);
		}
		if (this.lively == true && !this.leaf) {
			this.addListener("click", this.onOff);
		}
	},
	static : {
		C_HOT : "u_tabTree_tr_hot"
	}
});

Un.TabTree.Icon = Un.newClass( {
	extend : Un.Element,
	public : {
		tagName : "img",
		$ : {
			className : "u_tabTree_td_icon_s",
			src : Un.BLANK_IMAGE_URL
		},
		isExpand : function() {
			return this.hasClass(Un.TabTree.Icon.C_E);
		},
		expand : function() {
			this.e.className = Un.TabTree.Icon.C_E;
		},
		shrink : function() {
			this.e.className = Un.TabTree.Icon.C_S;
		}
	},
	static : {
		C_E : "u_tabTree_td_icon_e",
		C_S : "u_tabTree_td_icon_s"
	}
});
