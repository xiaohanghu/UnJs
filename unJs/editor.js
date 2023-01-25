Un.Editor = {
	extend : Un.Box,
	public : {
		editArea : null,
		getValue : function() {
			return this.editArea.getInnerHtml();
		},
		clear : function() {
			this.editArea.setInnerHtml("");
		}
	},
	constructor : function() {
		this.editArea = new Un.Component({
			className : "u_editArea"
		});
		this.editArea.setAttribute("contentEditable", true);
		this.editArea.setStyle("cursor", "pointer");
		this.appendChild(this.editArea);
	}
};
Un.Editor = Un.newClass(Un.Editor);