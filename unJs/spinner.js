/**
 *
 * Un.Input
 *
 */
Un.Input = Un.newClass({
	extend : Un.Element,
	public : {
		tagName : "input",
		defaultValue : "",
		tip : null,
		className : "u_input",
		getValue : function() {
			var v = this.getAttribute("value");
			return (this.isTip()) ? "" : v;
		},
		setValue : function(v) {
			this.setAttribute("value", v);
		},
		getDefaultValue : function() {
			return this.getAttribute("defaultValue");
		},
		setDefaultValue : function(v) {
			this.setAttribute("defaultValue", v);
		},
		reset : function() {
			var value = this.getDefaultValue();
			if ("" == value && this.tip)
				this.showTip();
			else
				this.setValue(value);
		},
		clear : function() {
			this.setValue("");
		},
		isEmpty : function() {
			return "" == this.getValue();
		},
		showTip : function() {
			this.setValue(this.tip);
			this.addClass("u_input_tip");
		},
		hideTip : function() {
			this.removeClass("u_input_tip");
		},
		isTip : function() {
			return this.getAttribute("value") == this.tip;
		},
		canTip : function() {
			this.addListener("blur", function() {
				if (this.isEmpty())
					this.showTip();
			});
			this.addListener("focus", function() {
				if (this.isTip()) {
					this.clear();
					this.hideTip();
				}
			});
		},
		notValid : function() {
			this.addClass("u_input_invalid");
		},
		toValid : function() {
			this.removeClass("u_input_invalid");
		},
		listeners : {

		}
	},
	constructor : function() {
		this.setDefaultValue(this.defaultValue);
		this.setValue(this.getDefaultValue());
		if (this.tip) {
			this.canTip();
			if ("" == this.getValue())
				this.showTip();
		}
		delete this.defaultValue;
	}
});

/**
 *
 * Un.Input.Text
 *
 */
Un.Input.Text = {
	extend : Un.Input,
	public : {
		type : null,
		$ : {
			type : "text"
		},
		numberText : function() {
			this.addListener("keydown", this.inputNumber);
		},
		inputNumber : function(event) {
			var isNumberCode = ((event.keyCode > 47 && event.keyCode < 58)
					|| (event.keyCode > 95 && event.keyCode < 106)
					|| (event.keyCode > 36 && event.keyCode < 41) || (event.keyCode == 8));
			if (!isNumberCode) {
				event.returnValue = false;
			}
		},
		select : function() {
			this.e.select();
		}
	},
	constructor : function() {
		this.addClass("u_input_text");
		switch (this.type) {
		case "number":
			this.numberText();
		default:
			;
		}
	}
};
Un.Input.Text = Un.newClass(Un.Input.Text);
Un.Spinner = Un.newClass({
	extend : Un.Component,
	public : {
		tip : "",
		defaultValue : "",
		minValue : -Number.MAX_VALUE,
		maxValue : Number.MAX_VALUE,
		incrementValue : 1,
		millisec : 150,
		$ : {
			className : "u_spinner"
		},
		getValue : function() {
			return parseInt(this.text.getValue());
		},
		setValue : function(v) {
			this.text.setValue(v);
			if (v != this.text.tip)
				this.text.hideTip();
			this.check();
		},
		getDefaultValue : function() {
			return this.text.getDefaultValue();
		},
		parseValue : function(v) {
			if (v != 0)
				v = v - v % this.incrementValue;
			return v;
		},
		getMidValue : function() {
			var v = 0;
			if (this.minValue == -Number.MAX_VALUE) {
				if (this.maxValue != Number.MAX_VALUE)
					v = this.maxValue;
			} else {
				if (this.maxValue == Number.MAX_VALUE)
					v = this.minValue;
				else
					v = (this.minValue + this.maxValue) / 2;
			}
			return this.parseValue(v);
		},
		isValid : function() {
			var v = this.getValue();
			if (v <= this.maxValue && v >= this.minValue
					&& (v % this.incrementValue == 0))
				return true;
			return false;
		},
		notValid : function() {
			this.text.notValid();
		},
		toValid : function() {
			this.text.toValid();
		},
		check : function() {
			if (this.isValid())
				this.toValid();
			else
				this.notValid();
		},
		plus : function() {
			var value = this.getValue() + this.incrementValue;
			var d = this.getDefaultValue();
			var dv = ("" == d) ? this.getMidValue() : d;
			value = isNaN(value) ? dv : value;

			if (value > this.maxValue)
				this.setValue(this.minValue);
			else
				this.setValue(value);
		},
		minus : function() {
			var value = this.getValue() - this.incrementValue;
			var d = this.getDefaultValue();
			var dv = ("" == d) ? this.getMidValue() : d;
			value = isNaN(value) ? dv : value;

			if (value < this.minValue) {
				this.setValue(this.maxValue);
			} else
				this.setValue(value);
		},
		autoPlus : function() {
			var spinner = this;
			var proxy = function() {
				spinner.plus();
			};
			this.intervalId = window.setInterval(proxy, this.millisec);
		},
		stopPlus : function() {
			window.clearInterval(this.intervalId);
		},
		autoMinus : function() {
			var spinner = this;
			var proxy = function() {
				spinner.minus();
			};
			this.intervalId = window.setInterval(proxy, this.millisec);
		},
		stopMinus : function() {
			window.clearInterval(this.intervalId);
		}
	},
	constructor : function() {
		this.text = new Un.Input.Text({
			tip : this.tip,
			defaultValue : this.parseValue(this.defaultValue)
		});
		this.text.addClass("u_spinner_text");

		this.text.addListener("keyup", this.check, this);

		this.bar = new Un.Element("div", "u_spinner_bar");

		this.barT = new Un.Button({
			className : "u_spinner_bar_T"
		});
		this.barT.addListener("click", this.plus, this);
		this.barT.addListener("mousedown", this.autoPlus, this);
		this.barT.addListener("mouseup", this.stopPlus, this);
		this.barT.addListener("mouseout", this.stopMinus, this);

		this.barB = new Un.Button({
			className : "u_spinner_bar_B"
		});
		this.barB.addListener("click", this.minus, this);
		this.barB.addListener("mousedown", this.autoMinus, this);
		this.barB.addListener("mouseup", this.stopMinus, this);
		this.barB.addListener("mouseout", this.stopMinus, this);

		this.bar.appendChildren([ this.barT, this.barB ]);
		this.appendChild(this.text);
		this.appendChild(this.bar);

		delete this.defaultValue;
	}
});
