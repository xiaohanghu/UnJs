/** Tree *************************************************************** */
Un.Tree = Un
		.newClass( {
			extend : Un.Component,
			public : {
				tagName : "ul",
				className : "u_tree",
				root : null,
				url : null,
				radioNode : null,
				rootVisible : true,
				addRoot : function(r) {
					this.appendChild(r);
				},
				/**
				 * 隐藏根节点
				 */
				hideRoot : function() {
					this.root.head.hide();
					var nodes = this.root.getChildren();
					for ( var i = 0, len = nodes.length; i < len; i++) {
						nodes[i].cutLevelAll(1);
					}
					this.rootVisible = false;
				},
				/**
				 * 显示根节点
				 */
				showRoot : function() {
					this.root.head.show();
					var nodes = this.root.getChildren();
					for ( var i = 0, len = nodes.length; i < len; i++) {
						nodes[i].addLevelAll(this.root);
					}
					this.rootVisible = true;
				},
				grow : function(root) {
					root.tree = this;
					this.root = Un.Tree.Node.$(root);
					this.root.head.addClass("u_tree_h_root");
					if (!this.rootVisible) {
						this.hideRoot();
					}
					this.addRoot(this.root);
				},
				expandAll : function() {
					this.root.expandAll();
				},
				collapseAll : function() {
					if (this.rootVisible)
						this.root.collapseAll();
					else {
						var cs = this.root.getChildren();
						for ( var i = 0, len = cs.length; i < len; i++) {
							cs[i].collapseAll();
						}
					}
				},
				isAsync : function() {
					return this.url != null;
				},
				load : function(n) {
					var param = {
						id : n.id
					};
					var obj = {
						url : this.url,
						param : param,
						caller : n,
						success : function(text) {
							if (text == "gologin") {
								Tree.location.href = Un.CONTEXT_PATH + "/jsp/login.jsp";
							} else {
								var data = eval("(" + text + ")");
								this.grow(data);
							}
						}
					};
					Un.Ajax.request(obj);
				},
				setCheckedNode : function(n) {
					this.radioNode = n;
				},
				getCheckedNode : function() {
					return this.radioNode;
				},
				getCheckedNodes : function() {
					return this.root.getCheckedNodes();
				},
				getNodeById : function(id) {
					return this.root.getNodeById(id);
				}
			},
			constructor : function() {
				if (this.root)
					this.grow(this.root);
			}
		});

Un.CheckTree = Un.newClass( {
	extend : Un.Tree,
	public : {
		mode : null,
		addRoot : function(r) {
			r.addCheckbox();
			this.appendChild(r);
		},
		resetChecked : function() {
			this.root.resetChecked_1();
		}
	},
	constructor : function() {
	}
});

Un.RadioTree = Un.newClass( {
	extend : Un.Tree,
	public : {
		mode : null,
		radioNode : null,
		defaultRadioNode : null,
		setCheckedNode : function(n) {
			this.radioNode = n;
		},
		getCheckedNode : function() {
			return this.radioNode;
		},
		setDefaultRadioNode : function(n) {
			if (typeof n == "string")
				n = this.getNodeById(n);
			n.setRadioChecked(true);
			this.defaultRadioNode = n;
		},
		resetChecked : function() {
			if (this.defaultRadioNode)
				this.defaultRadioNode.setRadioChecked(true);
		}
	},
	constructor : function(o) {
		if (o && o.defaultRadioId) {
			this.setDefaultRadioNode(o.defaultRadioId);
		}
	}
});

Un.Tree.Node = Un.newClass( {
	extend : Un.Element,
	public : {
		tagName : "li",
		className : "u_tree_node",
		id : null,
		text : null,
		value : null,
		tree : null,
		parent : null,
		leaf : null,
		levelIcons : null,// 存放缩进占位icon
		href : "#",
		target : "",
		children : null,
		/**
		 * 迭代遍历子节点
		 * 
		 * @param fun[function]要调用的函数
		 * @param p[void]要传入的参数
		 */
		iterator : function(fun, p) {
			var r = fun.call(this, p);
			if (r != undefined) {
				return r;
			}
			var c = this.getChildren();
			if (c) {
				for ( var i = 0, len = c.length; i < len; i++) {
					var r1 = c[i].iterator(fun, p);
					if (r1 != undefined)
						return r1;
				}
			}
		},
		/**
		 * 迭代遍历父节点
		 * 
		 * @param fun[function]要调用的函数
		 * @param p[void]要传入的参数
		 */
		iteratorParent : function(fun, p) {
			var r = fun.call(this, p);
			if (r != undefined)
				return r;
			var pa = this.getParent();
			if (pa) {
				var r1 = pa.iteratorParent(fun, p);
				if (r1 != undefined)
					return r1;
			}
		},
		getText : function() {
			return this.text.getAttribute("innerHTML");
		},
		setParent : function(p) {
			this.parent = p;
		},
		getParent : function() {
			return this.parent;
		},
		_addLevel : function(p) {
			p = p ? p : this.getParent();
			var e = new Un.Element("div", "u_tree_icon");
			if (!p.isLast())
				e.addClass("u_tree_line");
			var e1 = this.levelIcons[this.levelIcons.length - 1];
			e1 = e1 ? e1 : this.bar;
			e1.insertBefore(e);
			this.levelIcons.push(e);
		},
		/**
		 * 清空节点的层级后，调用改方法能正确的设置节点的层级，层级样式与父节点相关。
		 * 
		 * @param p父节点
		 */
		addLevel : function(p) {
			if (!p)
				return;
			this._addLevel(p);
			p = p.getParent();
			if (p)
				this.addLevel(p);
		},
		/**
		 * 给节点增加一个层级，会迭代增加子节点的层级。
		 * 
		 * @param p父节点
		 */
		addLevelAll : function(p) {
			this.iterator(this._addLevel, p);
		},
		cutLevel : function(n) {
			n = (typeof n == "number") ? n : 1;
			for ( var i = 0; i < n; i++) {
				var e = this.levelIcons.pop();
				this.head.removeChild(e);
			}
		},
		cutLevelAll : function(n) {
			this.iterator(this.cutLevel, n);
		},
		_setLevel : function(o) {
			this.cutLevel(o.n);
			this.addLevel(o.p);
		},
		/**
		 * 该方法会根据节点的当前父亲节点，重新渲染层级且获得正确的样式。
		 */
		setLevel : function(p) {
			var o = {
				n : this.getLevel(),
				p : p ? p : this.parent
			};
			this.iterator(this._setLevel, o);
		},
		getLevel : function() {
			return this.levelIcons.length;
		},
		isLeaf : function() {
			return this.hasClass("u_tree_leaf");
		},
		setLeaf : function(b) {
			if (b)
				this.addClass("u_tree_leaf");
			else
				this.removeClass("u_tree_leaf");
		},
		isFirst : function() {
			if (this.parent) {
				var c = this.parent.getFirstChild();
				return c.equals(this);
			}
			return true;
		},
		isLast : function() {
			if (this.parent) {
				var c = this.parent.getLastChild();
				return c.equals(this);
			}
			return true;
		},
		setLast : function(b) {
			if (b)
				this.head.addClass("u_tree_h_last");
			else
				this.head.removeClass("u_tree_h_last");
		},
		addBody : function() {
			this.body = new Un.Element("ul", "u_tree_body");
			this.appendChild(this.body);
		},
		addLine : function(n) {
			this.levelIcons[this.levelIcons.length - n - 1]
					.addClass("u_tree_line");
		},
		drawLine : function() {
			if (!this.isLeaf()) {
				for ( var i = 0, len = this.children.length; i < len; i++) {
					var c = this.children[i];
					c.iterator(c.addLine, this.getLevel());
				}
			}
		},
		removeLine : function(n) {
			this.levelIcons[this.levelIcons.length - n - 1]
					.removeClass("u_tree_line");
		},
		eraseLine : function() {
			if (!this.isLeaf())
				for ( var i = 0, len = this.children.length; i < len; i++) {
					var c = this.children[i];
					c.iterator(c.removeLine, this.getLevel());
				}
		},
		appendNode : function(n) {
			n.setParent(this);
			n.setLevel();
			n.tree = this.tree;
			if (this.tree instanceof Un.CheckTree) {
				n.addCheckbox();
			} else if (this.tree instanceof Un.RadioTree && n.isLeaf())
				n.addRadio();
			if (this.isEmpty()) {
				this.setEmpty(false);
			} else {
				var la = this.getLastChild();
				la.setLast(false);
				la.drawLine();
			}
			n.setLast(true);
			this.body.appendChild(n);
			this.children.push(n);
			return n;
		},
		grow : function(nodes) {
			for ( var i = 0, len = nodes.length; i < len; i++) {
				var n = nodes[i];
				n.tree = this.tree;
				var node = Un.Tree.Node.$(n);
				this.appendNode(node);
			}
			if (this.isEmpty() && !this.isAsync()) {
				this.setEmpty(true);
			}
		},
		getChildren : function() {
			return this.children;
		},
		getFirstChild : function() {
			var c = this.getChildren();
			return c[0];
		},
		getLastChild : function() {
			var c = this.getChildren();
			return c[c.length - 1];
		},
		isExpand : function() {
			return !this.bar.hasClass("u_tree_bar_e");
		},
		expand : function() {
			if (this.isLeaf())
				return;
			this.bar.removeClass("u_tree_bar_e");
			this.icon.removeClass("u_tree_node_icon_e");
			/** this.body.show(); */
			this.body.slideDown(100);
		},
		expandAll : function() {
			this.iterator(this.expand);
		},
		collapse : function() {
			if (this.isLeaf())
				return;
			this.bar.addClass("u_tree_bar_e");
			this.icon.addClass("u_tree_node_icon_e");
			/** this.body.hide(); */
			this.body.slideUp(100);
		},
		collapseAll : function() {
			this.iterator(this.collapse);
		},
		expandCollapse : function() {
			if (this.isExpand())
				this.collapse();
			else
				this.expand();
		},
		isEmpty : function() {
			return this.getChildren().length == 0;
		},
		setEmpty : function(b) {
			var c = "u_tree_empty";
			if (b) {
				this.addClass(c);
				try {
					this.bar.removeListener("click", this.expandCollapse);
				} catch (e) {
				}
			} else {
				this.bar.addListener("click", this.expandCollapse, this);
				this.removeClass(c);
			}
		},
		isAsync : function() {
			if (this.tree)
				return this.tree.isAsync();
			return false;
		},
		load : function() {
		},
		addCheckbox : function() {
			if (this.checkbox)
				return;
			this.checkbox = new Un.Checkbox();
			this.checkbox.addClass("u_tree_icon");
			this.checkbox.removeListener("click", this.checkbox.active);
			this.checkbox.addListener("click", this._setChecked, this);
			this.icon.insertBefore(this.checkbox);
		},
		pushInCheckedArray : function(arr) {
			if (this.getChecked())
				arr.push(this);
		},
		getCheckedNodes : function() {
			var arr = [];
			this.iterator(this.pushInCheckedArray, arr);
			return arr;
		},
		getChecked : function(b) {
			return (this.checkbox) ? this.checkbox.getValue() : null;
		},
		setChecked : function(b) {
			if (this.checkbox)
				this.checkbox.setChecked(b);
		},
		setParentsChecked : function(b) {
			this.iteratorParent(this.setChecked, b);
		},
		setChildrenChecked : function(b) {
			this.iterator(this.setChecked, b);
		},
		_setChecked : function() {
			if (this.getChecked()) {
				this.setChildrenChecked(false);
			} else {
				this.setChildrenChecked(true);
				this.setParentsChecked(true);
			}
		},
		setDefaultChecked : function(b) {
			this.checkbox.setDefaultChecked(b);
		},
		resetChecked : function() {
			this.checkbox.reset();
		},
		resetChecked_1 : function() {
			this.iterator(this.resetChecked);
		},
		setRadioChecked : function(b) {
			if (b) {
				var n = this.tree.getCheckedNode();
				if (n)
					n.radio.setChecked(false);
				this.tree.setCheckedNode(this);
				this.radio.setChecked(true);
			} else {
				this.radio.setChecked(false);
			}
		},
		getRadioChecked : function() {
			return (this.radio) ? this.radio.getValue() : null;
		},
		activeRadio : function() {
			this.setRadioChecked(!this.getRadioChecked());
		},
		addRadio : function(b) {
			this.radio = new Un.Radio();
			this.radio.addClass("u_tree_icon");
			this.radio.removeListener("click", this.radio.active);
			this.radio.addListener("click", this.activeRadio, this);
			this.icon.insertBefore(this.radio);
		},
		checkById : function(id) {
			if (this.id == id)
				return this;
		},
		getNodeById : function(id) {
			var r = this.iterator(this.checkById, id);
			return this.iterator(this.checkById, id);
		}
	},
	constructor : function(o) {
		this.levelIcons = [];

		this.head = new Un.Element("div", "u_tree_h");
		this.bar = new Un.Element("div", "u_tree_icon");
		this.bar.addClass("u_tree_bar");

		this.icon = new Un.Element("div", "u_tree_icon");
		this.icon.addClass("u_tree_node_icon");

		this.text = new Un.Element( {
			tagName : "a",
			className : "u_tree_text",
			$ : {
				href : this.href,
				innerHTML : this.text,
				target : this.target
			}
		});

		this.head.appendChildren( [ this.bar, this.icon, this.text ]);

		if (o.checked == true) {
			this.addCheckbox();
			this.setChecked(true);
			this.setDefaultChecked(true);
		} else if (o.checked == false) {
			this.addCheckbox();
			this.setDefaultChecked(false);
		}

		this.appendChild(this.head);
		if (o.nodes) {
			if (!this.body)
				this.addBody();
			this.children = [];
			this.grow(o.nodes);
		} else {
			this.setLeaf(true);
		}
	}
});

Un.Checkbox = Un.newClass( {
	extend : Un.Component,
	public : {
		className : "u_checkbox",
		defaultChecked : false,
		active : function() {
			this.setChecked(!this.getValue());
		},
		setDefaultChecked : function(b) {
			this.defaultChecked = b;
		},
		setChecked : function(b) {
			var c = this.className + "_checked";
			if (b)
				this.addClass(c);
			else
				this.removeClass(c);
		},
		getValue : function() {
			return this.hasClass(this.className + "_checked");
		},
		reset : function() {
			this.setChecked(this.defaultChecked);
		}
	},
	constructor : function() {
		this.reset();
		this.addListener("click", this.active);
	}
});

Un.Radio = Un.newClass( {
	extend : Un.Checkbox,
	public : {
		className : "u_radio"
	},
	constructor : function() {
	}
});
/** *************************************************************** Tree */
