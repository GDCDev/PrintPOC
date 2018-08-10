sap.ui.define(["sap/ui/core/mvc/Controller",
		'sap/ui/model/json/JSONModel'], function (Controller,JSONModel) {
	"use strict";
	return Controller.extend("sap.m.PrintPOC.controller.Screen6View", {
		onInit: function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("Screen6View")
				.attachPatternMatched(this._onObjectMatched, this);
		},

		_onObjectMatched: function (oEvent) {
			var barcodes = oEvent.getParameter("arguments").barcodes.split(',');
			
			var barcodesObject = [];
			barcodes.forEach(function(e,i){
				barcodesObject.push({Code:e});
			});
			//var list = this.getView().byId("barcodeList");
			var oModel = new JSONModel();
			oModel.setData({
				listData : barcodesObject
			});
			this.getView().setModel(oModel);
			// if (query && query !== "") {
			// 	var filters = [];
			// 	var filter = new sap.ui.model.Filter("Style", sap.ui.model.FilterOperator.Contains, query);
			// 	filters.push(filter);
			// 	// update list binding
			// 	var list = this.getView().byId("poList");
			// 	var binding = list.getBinding("items");
			// 	binding.filter(filters);

			// 	var desc = "";
			// 	var filteredData = binding.aLastContextData;
			// 	if (filteredData && filteredData.length > 0) {
			// 		var firstObjStr = filteredData[0];
			// 		var firstObj = new sap.ui.model.json.JSONModel();
			// 		firstObj.setData(JSON.parse(firstObjStr));
			// 		desc = firstObj.getProperty("/Description");
			// 	}
			// 	var styleCtrl = this.getView().byId("style");
			// 	styleCtrl.setText(query + " - " + desc);
			// }
		},
		
		onLineItemPressed: function(oEvent) {
			this.getOwnerComponent().getRouter().navTo("Screen4View", {
				ean: encodeURIComponent(oEvent.getSource().getBindingContext().getProperty("Code"))
			}, false);
		},
		
		onNavBack: function(oEvent) {
			// var oHistory = sap.ui.core.routing.History.getInstance();
			// var	sPreviousHash = oHistory.getPreviousHash();
			// if (sPreviousHash !== undefined) {
			// 	history.go(-1);
			// } else {
				this.getOwnerComponent().getRouter().navTo("Screen1View");
			// }
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
				if (Object.getOwnPropertyNames(oParams).length !== 0) {
					this.getOwnerComponent().getRouter().navTo(oNavigation.routeName, oParams);
				} else {
					this.getOwnerComponent().getRouter().navTo(oNavigation.routeName);
				}
			}
		}
	});
});