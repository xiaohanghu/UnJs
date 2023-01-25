/** Window *************************************************************** */
Un.Window = {
	extend : Un.Box,
	public : {
		title : "",
		x : null,
		y : null,
		width : 500,
		height : 310,
		zIndex : 100,
		minWidth : 180,
		minHeight : 111,
		borderWidth : 7,
		headHeight : 32,
		modal : false,
		maximizable : true,
		draggable : true,
		resizable : true,
		head : null,
		closable : true,
		closeMethod : "destroy",
		hasShadow : true,
		className : "u_win",
		show : function() {
			this.active();
			if (this.modal)
				this.renderTo.showMask();
			this.setStyle("display", "");
		},
		toDefaultCursor : function() {
			if (this.head)
				this.head.setCursor("default");
			if (this.barN)
				this.barN.setCursor("default");
			if (this.barE)
				this.barE.setCursor("default");
			if (this.barS)
				this.barS.setCursor("default");
			if (this.barW)
				this.barW.setCursor("default");
			if (this.barNW)
				this.barNW.setCursor("default");
			if (this.barNE)
				this.barNE.setCursor("default");
			if (this.barSE)
				this.barSE.setCursor("default");
			if (this.barSW)
				this.barSW.setCursor("default");
		},
		restoreCursor : function() {
			if (this.head)
				this.head.setCursor("");
			if (this.barN)
				this.barN.setCursor("");
			if (this.barE)
				this.barE.setCursor("");
			if (this.barS)
				this.barS.setCursor("");
			if (this.barW)
				this.barW.setCursor("");
			if (this.barNW)
				this.barNW.setCursor("");
			if (this.barNE)
				this.barNE.setCursor("");
			if (this.barSE)
				this.barSE.setCursor("");
			if (this.barSW)
				this.barSW.setCursor("");
		},
		setWidth_ie6 : function(w) {
			this.setStyle("width", w + "px");
			if (this.barE)
				this.barE.left(w - this.borderWidth);
			if (this.barNE)
				this.barNE.left(w - this.borderWidth);
			if (this.barSE)
				this.barSE.left(w - this.borderWidth);
			if (this.background)
				this.background.setWidth(w - 2);
			if (this.body)
				this.body.setWidth(w - this.borderWidth * 2 - 2);
		},
		setHeight_ie6 : function(h) {
			this.setStyle("height", h + "px");
			if (this.barS)
				this.barS.top(h - this.borderWidth);
			if (this.barE)
				this.barE.setHeight(h);
			if (this.barW)
				this.barW.setHeight(h);
			if (this.barSE)
				this.barSE.top(h - this.borderWidth);
			if (this.barSW)
				this.barSW.top(h - this.borderWidth);
			if (this.background)
				this.background.setHeight(h - 2);
			if (this.body)
				this.body.setHeight(h - this.borderWidth - this.headHeight - 2);
			if (this.shadow_ie)
				this.shadow_ie.setHeight(h);
		},
		getAreaX : function() {
			return this.renderTo.getX();
		},
		getAreaY : function() {
			return this.renderTo.getY();
		},
		getAreaWidth : function() {
			return this.renderTo.getScrollWidth();
		},
		getAreaHeight : function() {
			return this.renderTo.getScrollHeight();
		},
		getCenterX : function() {
			return (this.renderTo.getClientWidth() - this.getWidth()) / 2
					+ this.renderTo.getScrollLeft();
		},
		getCenterY : function() {
			return (this.renderTo.getClientHeight() - this.getHeight()) / 2
					+ this.renderTo.getScrollTop();
		},
		moveToCenter : function() {
			var x = this.getCenterX();
			var y = this.getCenterY();
			this.moveTo(x, y);
		},
		setCapture : function() {
			if (this.e.setCapture)
				this.e.setCapture();
			// else if (window.captureEvents)
			// window.captureEvents(Event.MOUSEMOVE | Event.MOUSEUP);
		},
		releaseCapture : function() {
			if (this.e.releaseCapture)
				this.e.releaseCapture();
			// else if (window.captureEvents)
			// window.captureEvents(Event.MOUSEMOVE | Event.MOUSEUP);
		},
		move : function(e) {
			this.moveTo(e.clientX - this.re_m_x, e.clientY - this.re_m_y);
		},
		reduce : function() {
			if (this.hasShadow)
				this.hideShadow();
			// this.body.hide();
		},
		increase : function() {
			if (this.hasShadow)
				this.showShadow();
			// this.body.show();
		},
		startMove : function(e) {
			this.active();
			if (this.isMaximize()) {
				return;
			}
			this.re_m_x = e.clientX - this.getX();
			this.re_m_y = e.clientY - this.getY();
			this.setCapture();
			Un.document.addListener("mouseup", this.sotp, this);
			Un.document.addListener("mousemove", this.move, this);
			this.reduce();
			Un.body.setStyle("cursor", "normal");
		},
		sotp : function() {
			this.releaseCapture();
			Un.document.removeListener("mouseup", this.sotp);
			Un.document.removeListener("mousemove", this.move);
			Un.document.removeListener("mousemove", this.startResizeFun);
			this.increase();
			Un.body.setStyle("cursor", "");
		},
		startResize : function(fun, e) {
			this.startResizeFun = fun;
			this.active();
			if (this.isMaximize()) {
				return;
			}
			this.re_m_x = e.clientX - this.getX();
			this.re_m_y = e.clientY - this.getY();
			this.re_r_w_r = this.getWidth() - e.clientX;
			this.re_r_w_l = this.getWidth() + e.clientX;
			this.re_r_h_t = this.getHeight() + e.clientY;
			this.re_r_h_b = this.getHeight() - e.clientY;
			this.setCapture();
			this.hideShadow();
			Un.document.addListener("mouseup", this.sotp, this);
			Un.document.addListener("mousemove", this.startResizeFun, this);
			Un.body.setStyle("cursor", "normal");
		},
		startResizeN : function(e) {
			this.startResize(this.resizeN, e);
		},
		startResizeE : function(e) {
			this.startResize(this.resizeE, e);
		},
		startResizeS : function(e) {
			this.startResize(this.resizeS, e);
		},
		startResizeW : function(e) {
			this.startResize(this.resizeW, e);
		},
		startResizeNW : function(e) {
			this.startResize(this.resizeNW, e);
		},
		startResizeNE : function(e) {
			this.startResize(this.resizeNE, e);
		},
		startResizeSE : function(e) {
			this.startResize(this.resizeSE, e);
		},
		startResizeSW : function(e) {
			this.startResize(this.resizeSW, e);
		},
		resizeN : function(e) {
			var h = this.re_r_h_t - e.clientY;
			if (h > this.minHeight) {
				this.setHeight(h);
				this.top(e.clientY - this.re_m_y);
			}
		},
		resizeE : function(e) {
			var w = e.clientX + this.re_r_w_r;
			if (w > this.minWidth)
				this.setWidth(w);
		},
		resizeS : function(e) {
			var h = e.clientY + this.re_r_h_b;
			if (h > this.minHeight)
				this.setHeight(h);
		},
		resizeW : function(e) {
			var w = this.re_r_w_l - e.clientX;
			if (w > this.minWidth) {
				this.left(e.clientX - this.re_m_x);
				this.setWidth(w);
			}
		},
		resizeNW : function(e) {
			this.resizeN(e);
			this.resizeW(e);
		},
		resizeNE : function(e) {
			this.resizeN(e);
			this.resizeE(e);
		},
		resizeSE : function(e) {
			this.resizeS(e);
			this.resizeE(e);
		},
		resizeSW : function(e) {
			this.resizeS(e);
			this.resizeW(e);
		},
		buildBar : function(dir) {
			var bar = new Un.Box("div", "u_win_bar u_win_bar_" + dir);
			this["bar" + dir] = bar;
			this.appendChild(bar);
			bar
					.addListener("mousedown", this["startResize" + dir], this,
							false);
			return bar;
		},
		initDirBar : function() {
			var bw = this.borderWidth;
			this.buildBar("N").setHeight(bw);
			this.buildBar("E").setWidth(bw);
			this.buildBar("S").setHeight(bw);
			this.buildBar("W").setWidth(bw);
			this.buildBar("NW").setSize(bw, bw);
			this.buildBar("NE").setSize(bw, bw);
			this.buildBar("SE").setSize(bw, bw);
			this.buildBar("SW").setSize(bw, bw);
		},
		buildShadow_ie : function() {
			this.shadow_ie = new Un.Box("div", "u_shadow_ie u_shadow_ie_filter");
			this.appendChild(this.shadow_ie);
		},
		buildShadow_ie6 : function() {
			this.shadow_ie = new Un.Box("div", "u_shadow_ie");

			this.shadow_ie.setHeight(this.height);
			this.appendChild(this.shadow_ie);
		},
		showShadow_ie : function() {
			this.shadow_ie.show();
		},
		hideShadow_ie : function() {
			this.shadow_ie.hide();
		},
		showShadow : function() {
			this.addClass("u_win_shadow");
		},
		hideShadow : function() {
			this.removeClass("u_win_shadow");
		},
		initShadow : function() {
			switch (Un.AGENT.NAME) {
			case "ie":
				if (Un.AGENT.VERSION == "6.0")
					this.buildShadow_ie6();
				else
					this.buildShadow_ie();
				this.showShadow = this.showShadow_ie;
				this.hideShadow = this.hideShadow_ie;
				break;
			}
		},
		initManager : function() {
			var manager = Un.Window.Manager.getManager(this.renderTo);
			if (null == manager)
				var manager = new Un.Window.Manager(this.renderTo);
			this.manager = manager;
		},
		initPosition : function() {
			var lw = this.manager.getLastWin();
			if (lw && lw.e && lw.isShow()) {
				this.x = this.x || lw.x + lw.headHeight;
				this.y = this.y || lw.y + lw.headHeight;
			} else {
				this.x = this.x
						|| (this.renderTo.getClientWidth() - this.width) / 2
						+ this.renderTo.getScrollLeft();
				this.y = this.y
						|| (this.renderTo.getClientHeight() - this.height) / 2
						+ this.renderTo.getScrollTop();
			}
			this.manager.setLastWin(this);
		},
		reset : function() {
			this.setSize(this.width, this.height);
			this.moveTo(this.x, this.y);
			this.setStyle("zIndex", this.zIndex);
			this.showShadow();
		},
		closeAction : function() {
			this.destroy();
		},
		close : function() {
			var rs = this.doCustomEvent("beforeclose");
			if (!Un.Util.getBoolean(rs)) {
				return false;
			}
			if (this.modal && this.renderTo)
				this.renderTo.hideMask();
			this.doCustomEvent("close");
			this.closeAction();
			return true;
		},
		setCloseMethod : function(m) {
			switch (m) {
			case "destroy":
				break;
			case "hide":
				this.closeAction = this.hide;
				break;
			}
		},
		initCloseButton : function() {
			this.closeIcon = new Un.Button({
				className : "u_btn_close"
			});
			this.closeIcon.addListener("click", this.close, this, false);
			this.closeIcon.addListener("mousedown", function() {
			}, null, false);
			this.head.appendChild(this.closeIcon);
			this.setCloseMethod(this.closeMethod);
		},
		isMaximize : function() {
			if (this.maxIcon)
				return (this.maxIcon.hasClass("u_btn_max")) ? false : true;
			else
				return false;
		},
		maximizeRestore : function() {
			this.active();
			if (this.isMaximize())
				this.restore();
			else
				this.maximize();
		},
		maximize : function() {
			this.restoreX = this.getX();
			this.restoreY = this.getY();
			this.restoreW = this.getWidth();
			this.restoreH = this.getHeight();
			this.hideShadow();
			this.setSize(this.getAreaWidth(), this.getAreaHeight());
			this.moveTo(0, 0);
			this.maxIcon.up();
			this.maxIcon.removeClass("u_btn_max");
			this.maxIcon.addClass("u_btn_restore");
			this.maxIcon.className = "u_btn_restore";
			this.toDefaultCursor();
		},
		restore : function() {
			this.moveTo(this.restoreX, this.restoreY);
			this.setSize(this.restoreW, this.restoreH);
			this.maxIcon.up();
			this.maxIcon.removeClass("u_btn_restore");
			this.maxIcon.addClass("u_btn_max");
			this.maxIcon.className = "u_btn_max";
			this.restoreCursor();
			this.showShadow();
		},
		initMaximizeButton : function() {
			this.maxIcon = new Un.Button({
				className : "u_btn_max"
			});
			this.maxIcon
					.addListener("click", this.maximizeRestore, this, false);
			this.maxIcon.addListener("mousedown", function() {
			}, null, false);
			this.head.appendChild(this.maxIcon);
			this.head
					.addListener("dblclick", this.maximizeRestore, this, false);
		},
		setTitle : function(t) {
			this.titleDiv.setInnerHtml(t);
		},
		addContent : function(c) {
			this.body.appendChild(c);
		},
		initBackground : function() {
			this.background = new Un.Box("div", "u_win_bg");
			this.appendChild(this.background);
		},
		initHead : function() {
			this.head = new Un.Box("div", "u_win_head");
			this.head.setHeight(this.headHeight);
			this.titleDiv = new Un.Element("div", "un_title");
			this.head.appendChild(this.titleDiv);
			this.appendChild(this.head);
		},
		initBody : function() {
			this.body = new Un.Box("div", "u_win_body");
			this.body.setPosition(this.headHeight, this.borderWidth,
					this.borderWidth, this.borderWidth);
			this.appendChild(this.body);
		},
		active : function() {
			var h = this.manager.getHotWin();
			if (h && h.e)
				h.cold();
			this.hot();
			this.manager.setHotWin(this);
		},
		hot : function() {
			this.setStyle("zIndex", "10000");
		},
		cold : function() {
			this.setStyle("zIndex", this.zIndex);
		},
		addMask_ie6 : function() {
			this.appendChild(new Un.Box("iframe", "u_mask_iframe_ie6"));
		}
	},
	constructor : function() {

		if (Un.AGENT.is("ie", "6.0")) {
			this.setHeight = this.setHeight_ie6;
			this.setWidth = this.setWidth_ie6;
			this.addMask_ie6();
		}
		this.initManager();
		this.initBackground();
		this.initHead();
		this.initBody();

		if (this.resizable)
			this.initDirBar();
		if (this.hasShadow)
			this.initShadow();
		if (this.closable)
			this.initCloseButton();
		if (this.maximizable)
			this.initMaximizeButton();

		if (this.draggable)
			this.head.addListener("mousedown", this.startMove, this, false);
		else
			this.head.setStyle("cursor", "default");

		this.addListener("click", this.active);

		this.setTitle(this.title);
		this.hide();
		this.render();

		this.initPosition();
		this.reset();

	},
	static : {}
};
Un.Window = Un.newClass(Un.Window);
/** *************************************************************** Window */

Un.Window.Manager = Un.newClass({
	extend : Un.Object,
	public : {
		e : null,
		hotWin : null,
		lastWin : null,
		getHotWin : function() {
			return this.hotWin;
		},
		setHotWin : function(w) {
			this.hotWin = w;
		},
		getLastWin : function() {
			return this.lastWin;
		},
		setLastWin : function(w) {
			this.lastWin = w;
		}
	},
	constructor : function(e) {
		this.e = e;
		Un.Window.Manager.addManager(this);
	},
	static : {
		managers : [],
		getManager : function(e) {
			for ( var i = 0, len = this.managers.length; i < len; i++) {
				var m = this.managers[i];
				if (Un.Element.getHtmlElement(m.e) == Un.Element
						.getHtmlElement(e)) {
					return m;
				}
			}
			return null;
		},
		addManager : function(m) {
			this.managers.push(m);
		}
	}
});

Un.ApplyPanel = Un.newClass({
	extend : Un.Window,
	public : {
		headHeight : 28,
		width : 320,
		height : 280,
		borderWidth : 4,
		draggable : false,
		closable : false,
		maximizable : false
	},
	constructor : function() {
	}
});
