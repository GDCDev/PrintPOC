sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
	"use strict";
	return Controller.extend("sap.m.PrintPOC.controller.Screen4View", {
		
		/**
		 *@memberOf sap.m.PrintPOC.controller.Screen4View
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
		
		//https://github.com/lindell/JsBarcode/wiki/Options
		printLabel: function (oEvent) {
			var printPage = '<div style="width:230;height:161">\
		{0}&nbsp;&nbsp;{1}&nbsp;&nbsp;&nbsp;<div style="float:right">{2}</div><br/>\
		{3}&nbsp;&nbsp;{4}<br/>\
		<svg class="barcode"\
			jsbarcode-format="EAN13"\
			jsbarcode-height="45"\
			jsbarcode-width="2"\
			jsbarcode-value="{5}"\
			jsbarcode-textmargin="0"\
			jsbarcode-fontoptions="bold">\
		</svg><br/>\
		{6}<div style="float:right">{7}</div>\
	</div>';
	
			printPage = printPage.replace(/\{0\}/g, "013")
					.replace(/\{1\}/g, "E1")
					.replace(/\{2\}/g, "053EE1B002")
					.replace(/\{3\}/g, "001")
					.replace(/\{4\}/g, "34")
					.replace(/\{5\}/g, "4053571463596")
					.replace(/\{6\}/g, "EUR")
					.replace(/\{7\}/g, "100,00");

			var options = {
				name: 'EANList', // + style
				printerId: ''
			};
			
			document.getElementById('printContainer').innerHTML=printPage;
			JsBarcode(".barcode").init();
			
			cordova.plugins.printer.print(document.getElementById('printContainer'), options, function (res) {
				//alert(res ? 'Done' : 'Canceled'); //----->i18n
				document.getElementById('printContainer').innerHTML="";
			});
		}
	});
});