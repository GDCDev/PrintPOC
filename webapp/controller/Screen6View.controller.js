sap.ui.define(["sap/ui/core/mvc/Controller",
	'sap/ui/model/json/JSONModel'
], function (Controller, JSONModel) {
	"use strict";
	return Controller.extend("sap.m.PrintPOC.controller.Screen6View", {
		onInit: function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("Screen6View")
				.attachPatternMatched(this._onObjectMatched, this);
			this.aBarcodes = [];
		},

		_onObjectMatched: function (oEvent) {
			var aBarcodes = oEvent.getParameter("arguments").barcodes.split(',');
			aBarcodes.forEach(function (e, i) {
				if(!this.aBarcodes.includes(e)){
					this.aBarcodes.push(e);
				}
			},this);
			
			var aBarcodesObject = [];
			this.aBarcodes.forEach(function (e, i) {
				aBarcodesObject.push({
					Code: e
				});
			});

			var oListDataModel = new JSONModel();
			oListDataModel.setData({
				listData: aBarcodesObject
			});
			this.getView().setModel(oListDataModel, "view");
		},

		onLineItemPressed: function (oEvent) {
			this.getOwnerComponent().getRouter().navTo("Screen4View", {
				//ean: encodeURIComponent(oEvent.getSource().getBindingContext().getProperty("Code"))
				ean: encodeURIComponent(oEvent.getSource().getTitle())
			}, false);
		},

		onNavBack: function (oEvent) {
			var oHistory = sap.ui.core.routing.History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
			if (sPreviousHash !== undefined) {
				history.go(-1);
			} else {
				this.getOwnerComponent().getRouter().navTo("Screen1View");
				this._clearList(this);
			}
		},
		
		_clearList: function(that){
			that.aBarcodes = [];
		},

		/**
		 *@memberOf sap.m.PrintPOC.controller.Screen6View
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
				if(oNavigation.routeName=="Screen1View"){
					this._clearList(this);
				}
				if (Object.getOwnPropertyNames(oParams).length !== 0) {
					this.getOwnerComponent().getRouter().navTo(oNavigation.routeName, oParams);
				} else {
					this.getOwnerComponent().getRouter().navTo(oNavigation.routeName);
				}
			}
		}
	});
});