sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/UIComponent",
	"sap/m/MessageBox",
	'sap/ui/model/json/JSONModel'
], function (Controller, UIComponent, MessageBox, JSONModel) {
	"use strict";
	return Controller.extend("sap.m.PrintPOC.controller.Screen2View", {
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf sap.m.PrintPOC.view.Screen2View
		 */
		onInit: function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("Screen2View").attachPatternMatched(this._onObjectMatched, this);
		},
		
		_onObjectMatched: function (oEvent) {
			var query = oEvent.getParameter("arguments").styleId;
			if (query && query !== "") {
				//var filters = [];
				//var filter = new sap.ui.model.Filter("Style", sap.ui.model.FilterOperator.EQ, query);
				//filters.push(filter);
				// update list binding
				//var list = this.getView().byId("poList");
				//var binding = list.getBinding("items");
				//binding.filter(filters);
				
			
				var sServiceUrl = "/EANSet?Style=" + query;
				var olistDataModel = new JSONModel();
				var oView = this.getView();
				$.ajax({
					type : "GET",
					url : sServiceUrl,
					dataType: "json", 
					async : false,
					success: function(data) {
						
						olistDataModel.setData({
							listData: data
						});
						oView.setModel(olistDataModel, "view");
					},
					error: function(err) {
						MessageBox.alert(err,{
									icon : MessageBox.Icon.ERROR,
									title : "Error"
							});
					}
				});
				
			}
		},
		
		onLineItemPressed: function (oEvent) {
			this.getOwnerComponent().getRouter().navTo("Screen4View", {
				//ean: encodeURIComponent(oEvent.getSource().getBindingContext().getProperty("EAN"))
				ean:encodeURIComponent(oEvent.getSource().getProperty("title"))
			}, false);
		},
		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf sap.m.PrintPOC.view.Screen2View
		 */
		//	onBeforeRendering: function() {
		//
		//	},
		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf sap.m.PrintPOC.view.Screen2View
		 */
		//	onAfterRendering: function() {
		//
		//	},
		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf sap.m.PrintPOC.view.Screen2View
		 */
		//	onExit: function() {
		//
		//	}
		/**
		 *@memberOf sap.m.PrintPOC.controller.Screen2View
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
		/**
		 *@memberOf sap.m.PrintPOC.controller.Screen2View
		 */
		onPrintEANListPressed: function (oEvent) {
			//setBlank
			var fnSetBlank = function (txt, nums, isLeft) {
				if (txt.length >= nums) {
					txt = txt.substring(0, nums);
					return txt;
				}
				while (txt.length < nums) {
					if (isLeft) {
						txt = " " + txt;
					} else {
						txt = txt + " ";
					}
				}
				return txt;
			};
			//getAfterColon
			var fnGetAfterColon = function (txt) {
				var start = txt.indexOf(":");
				if (start !== -1)
					start += 2;
				else
					start = txt.length;
				return txt.substring(start);
			};
			var aItems = this.byId("poList").getItems();
			var sPrintPage = "";
			//for monospaced font
			sPrintPage += "<tt>";
			var aStylearr = this.getView().byId("style").getText().split(" - ");
			if (aStylearr.length < 2) {
				if (!aStylearr[0])
					aStylearr[0] = "";
				aStylearr[1] = "";
			}
			var sCurr = "EUR";
			if (aItems.length > 0 && aItems[0].mProperties.Currency) {
				sCurr = aItems[0].mProperties.Currency;
			}
			sPrintPage += aStylearr[0];
			//style
			sPrintPage += "<br/>";
			sPrintPage += aStylearr[1] + "<br/>";
			//---->i18n
			sPrintPage += "<br/>";
			sPrintPage += "EAN             Color   Size      Price (" + sCurr + ")<br/>";
			sPrintPage += "=============   =====   ======      =========<br/>";
			for (var i = 0; i < aItems.length; i++) {
				var sPrintLine = "";
				sPrintLine += fnSetBlank(aItems[i].mProperties.title, 16);
				sPrintLine += fnSetBlank(fnGetAfterColon(aItems[i].mAggregations.attributes[0].mProperties.text), 8);
				sPrintLine += fnSetBlank(fnGetAfterColon(aItems[i].mAggregations.attributes[1].mProperties.text), 5);
				sPrintLine += fnSetBlank(aItems[i].mProperties.number, 15, true);
				sPrintLine += "<br/>";
				sPrintPage += sPrintLine;
			}
			//for monospaced font
			sPrintPage += "</tt>";
			sPrintPage = sPrintPage.replace(/ /g, "&nbsp;");
			var oOptions = {
				name: "StyleEANList" + aStylearr[0],
				// + style
				printerId: ""
			};
			if (cordova) {
				cordova.plugins.printer.print(sPrintPage, oOptions, function (res) {
					//console.log(res ? "Done" : "Canceled");
				});
			}
		},
		
		/**
		 *@memberOf sap.m.PrintPOC.controller.Screen2View
		 */
		onUpdateFinished: function (oEvent) {
			
			//var filteredData = binding.aLastContextData;
			//if (filteredData && filteredData.length > 0) {
			//	var firstObjStr = filteredData[0];
			//	var firstObj = new sap.ui.model.json.JSONModel();
			//	firstObj.setData(JSON.parse(firstObjStr));
			//	desc = firstObj.getProperty("/Description");
			//}
		
			var aItems = this.byId("poList").getItems();
			var oStyleCtrl = this.getView().byId("style");
			if (aItems.length > 0) {
				var sDesc = aItems[0].mAggregations.attributes[2].mProperties.text;
				var sStyle = aItems[0].mAggregations.attributes[3].mProperties.text;
				oStyleCtrl.setText(sStyle + " - " + sDesc); //styleCtrl.bindProperty("text", "/eanSet('xxxxx')/Style");
			} else {
				oStyleCtrl.setText(" - ");
			}
		}
	});
});