sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/ui/core/UIComponent"
], function (Controller) {
	"use strict";
	return Controller.extend("sap.m.PrintPOC.controller.Screen2View", {
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf sap.m.PrintPOC.view.Screen2View
		 */

		onInit: function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("Screen2View")
				.attachPatternMatched(this._onObjectMatched, this);
		},

		_onObjectMatched: function (oEvent) {
			var query = oEvent.getParameter("arguments").styleId;

			//this.getView().bindElement({path: decodeURIComponent(sPath)});

			if (query && query !== "") {
				var filters = [];
				var filter = new sap.ui.model.Filter("Style", sap.ui.model.FilterOperator.Contains, query);
				filters.push(filter);
				// update list binding
				var list = this.getView().byId("poList");
				var binding = list.getBinding("items");
				binding.filter(filters);

				//var oModel = this.getView().getModel();
				//var desc = oModel.getProperty("/eanSet(Style='"+ query+ "')/Description"); //no effect
				//var descStr = "/eanSet('4059602799160')/Description";			//based on odata, key access
				//var desc = oModel.getProperty(descStr);
				//var oData = oModel.oData;					//oData' content

				var desc = "";
				var filteredData = binding.aLastContextData;
				if (filteredData && filteredData.length > 0) {
					var firstObjStr = filteredData[0];
					var firstObj = new sap.ui.model.json.JSONModel();
					firstObj.setData(JSON.parse(firstObjStr));
					desc = firstObj.getProperty("/Description");
				}
				var styleCtrl = this.getView().byId("style");
				styleCtrl.setText(query + " - " + desc);
				//styleCtrl.bindProperty("text", "/eanSet('xxxxx')/Style");
			}
		},
		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf sap.m.PrintPOC.view.Screen2View
		 */ //	onBeforeRendering: function() {
		//
		//	},
		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf sap.m.PrintPOC.view.Screen2View
		 */ //	onAfterRendering: function() {
		//
		//	},
		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf sap.m.PrintPOC.view.Screen2View
		 */ //	onExit: function() {
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
		PrintEANList: function (oEvent) {
			//setBlank
			var setBlank = function (txt, nums, isLeft) {
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
			var getAfterColon = function (txt) {
				var start = txt.indexOf(":");
				if (start !== -1)
					start += 2;
				else
					start = txt.length;

				return txt.substring(start);
			};

			var items = this.byId('poList').getItems();
			var printPage = '';
			//for monospaced font
			printPage += '<code>';
			// jQuery.sap.require("jquery.sap.resources");

			//   var sLocale = sap.ui.getCore().getConfiguration().getLanguage();
			//   var oBundle = jQuery.sap.resources({
			//       url: "i18n/i18n.properties",
			//       locale: sLocale
			//   })

			//   var msgStyleDescription = oBundle.getText("StyleDescription", [sLocale]);

			printPage += '[Style]'; //style
			printPage += '<br/>';
			printPage += '[Style Description]<br/>'; //---->i18n
			printPage += '<br/>';
			printPage += 'EAN             Color   Size      Price (EUR)<br/>';
			printPage += '=============   =====   ======      =========<br/>';
			for (var i = 0; i < items.length; i++) {
				var printLine = '';
				printLine += setBlank(items[i].mProperties.title, 16);
				printLine += setBlank(getAfterColon(items[i].mAggregations.attributes[0].mProperties.text), 8);
				printLine += setBlank(getAfterColon(items[i].mAggregations.attributes[1].mProperties.text), 5);
				printLine += setBlank(items[i].mProperties.number, 15, true);
				printLine += '<br/>';
				printPage += printLine;
			}
			//for monospaced font
			printPage += '</code>';
			printPage = printPage.replace(/ /g, "&nbsp;");
			var options = {
				name: 'EANList', // + style
				printerId: ''
			};
			cordova.plugins.printer.print(printPage, options, function (res) {
				//alert(res ? 'Done' : 'Canceled'); //----->i18n
			});
		}
	});
});