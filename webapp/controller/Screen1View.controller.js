sap.ui.define(["sap/ui/core/mvc/Controller","sap/m/MessageBox"], function (Controller,MessageBox) {
	"use strict";
	return Controller.extend("sap.m.PrintPOC.controller.Screen1View", {
		/**
		 *@memberOf sap.m.PrintPOC.controller.Screen1View
		 */
		action: function (oEvent) {
			var that = this;
			var actionParameters = JSON.parse(oEvent.getSource().data("wiring").replace(/'/g, "\""));
			var eventType = oEvent.getId();
			var aTargets = actionParameters[eventType].targets || [];
			aTargets.forEach(function (oTarget) {
				var oControl = that.byId(oTarget.id);
				if (oControl) {
					var oParams = {};
					for (var prop in oTarget.parameters) {
						oParams[prop] = oEvent.getParameter(oTarget.parameters[prop]);
					}
					oControl[oTarget.action](oParams);
				}
			});
			var oNavigation = actionParameters[eventType].navigation;
			if (oNavigation) {
				var oParams = {};
				(oNavigation.keys || []).forEach(function (prop) {
					oParams[prop.name] = encodeURIComponent(JSON.stringify({
						value: oEvent.getSource().getBindingContext(oNavigation.model).getProperty(prop.name),
						type: prop.type
					}));
				});
				if (Object.getOwnPropertyNames(oParams).length !== 0) {
					this.getOwnerComponent().getRouter().navTo(oNavigation.routeName, oParams);
				} else {
					this.getOwnerComponent().getRouter().navTo(oNavigation.routeName);
				}
			}
		},
		onInit: function(){
			var oComponent = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this.getView()));
        	this._oResourceBundle = oComponent.getModel("i18n").getResourceBundle();
            //jQuery.sap.require("jquery.sap.resources");
			//var sLocale = sap.ui.getCore().getConfiguration().getLanguage();
			//var oBundle = jQuery.sap.resources({
			//	url: "i18n/i18n.properties",
			//	locale: sLocale
			//});
			this.msgInputErrAgain = this._oResourceBundle.getText("msgInputErr")+"\n"+ this._oResourceBundle.getText("msgInputAgain");
			//oBundle.getText("msgInputErr", [sLocale])+"\n"+oBundle.getText("msgInputAgain", [sLocale]);
        },
		/**
		 *@memberOf sap.m.PrintPOC.controller.Screen1View
		 */
		onGoPressed: function (oEvent) {
			var oParams = {};
			var oInput = this.byId("styleInput");
			if (oInput.getValue().trim() != "") {
				oParams["styleId"] = oInput.getValue();
				this.getOwnerComponent().getRouter().navTo("Screen2View", oParams);
			} else {
				
				MessageBox.alert(this.msgInputErrAgain, {
									icon : MessageBox.Icon.ERROR,
									title : "Error"
							});
			}
		}
	});
});