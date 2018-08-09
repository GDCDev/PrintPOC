sap.ui.define([
	"sap/ui/core/mvc/Controller",
"sap/ui/core/UIComponent",
"sap/m/MessageBox",
"sap/m/MessageToast"
], function (Controller,UIComponent,MessageBox,MessageToast) {
	"use strict";

	return Controller.extend("sap.m.PrintPOC.controller.Screen5View", {

		//to check EAN13 format
		_checkEAN13:function(txt){
			if(!(/^[0-9]{13}$/.test(txt)))
				return false;
            var Code = txt.split("");
            var A = 0;
            var B = 0;
            for(var i=0;i<12;i++)
            {
                if(i%2==1)
                {
                    A += parseInt(Code[i]);
                }
                else
                {
                    B += parseInt(Code[i]);
                }  
            }
            var C1 = B;
            var C2 = A*3;
            var CC = (C1+C2)%10;
            var  CheckCode = (10 - CC)%10;
            return  CheckCode+""==Code[12];
		},
		
		_scan: function(that){
			//---->i18n
			cordova.plugins.barcodeScanner.scan(
					function (result) 
					{
						if(result.cancelled){
							//navto 
							if(that.barcodes.length==0)
								that.getOwnerComponent().getRouter().navTo("Screen1View");
							else
								that.getOwnerComponent().getRouter().navTo("Screen6View", {barcodes:that.barcodes.join()});
						}
						else if(result.format!=="BAR_CODE"||!that._checkEAN13(result.text)){
							//reScan
							MessageBox.alert("Scan error.\nPlease scan again.",{
									icon : MessageBox.Icon.ERROR,
									title : "Error",
									onClose: function(oAction) {
										that._scan(that);
								}
							});
						}
						else{
							if(!that.barcodes.contains(result.text))
								that.barcodes.push(result.text);
							MessageToast.show("Scanned a new barcode:\n"+result.text,{duration: 2000});
						}
					},
					function (error) {
						//reScan
						MessageBox.alert("Scan error.\nPlease scan again.",{
								icon : MessageBox.Icon.ERROR,
								title : "Error",
								onClose: function(oAction) {
									that._scan(that);
							}
						});
					}
				);
		},
		
		onInit: function(){
                var oRouter = UIComponent.getRouterFor(this);
                oRouter.getRoute("Screen5View")
                    .attachPatternMatched(this._onAfterRendering, this);
                this.barcodes=[];
            },
            
        _onAfterRendering: function (oEvent) {
            	//only async call works even though 1ms
	            var interval = jQuery.sap.intervalCall(5, this, function(){
	                    this._scan(this);
	                    jQuery.sap.clearIntervalCall(interval);
	                });
            },
		/**
		 *@memberOf sap.m.PrintPOC.controller.Screen3View
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