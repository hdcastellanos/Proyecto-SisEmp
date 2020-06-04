sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"./utilities",
	"sap/ui/core/routing/History"
], function (BaseController, MessageBox, Utilities, History) {
	"use strict";

	return BaseController.extend("com.sap.build.standard.prototipo1.controller.CrearOrdenDeCompra2", {
		handleRouteMatched: function (oEvent) {
			var sAppId = "App5ea4d44f371ef10604ad8276";

			var oParams = {};

			if (oEvent.mParameters.data.context) {
				this.sContext = oEvent.mParameters.data.context;

			} else {
				if (this.getOwnerComponent().getComponentData()) {
					var patternConvert = function (oParam) {
						if (Object.keys(oParam).length !== 0) {
							for (var prop in oParam) {
								if (prop !== "sourcePrototype" && prop.includes("Set")) {
									return prop + "(" + oParam[prop][0] + ")";
								}
							}
						}
					};

					this.sContext = patternConvert(this.getOwnerComponent().getComponentData().startupParameters);

				}
			}

			var oPath;

              
			if (this.sContext) {
				oPath = {
					path: "/" + this.sContext,
					parameters: oParams
				};
				this.getView().bindObject(oPath);
			}

		},
		_onPageNavButtonPress: function () {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
			var oQueryParams = this.getQueryParameters(window.location);

			if (sPreviousHash !== undefined || oQueryParams.navBackToLaunchpad) {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("default", true);
			}

		},
		getQueryParameters: function (oLocation) {
			var oQuery = {};
			var aParams = oLocation.search.substring(1).split("&");
			for (var i = 0; i < aParams.length; i++) {
				var aPair = aParams[i].split("=");
				oQuery[aPair[0]] = decodeURIComponent(aPair[1]);
			}
			return oQuery;

		},
		_onButtonPress: function () {
			
			var oView = this.getView(),
				oController = this,
				status = true,
				requiredFieldInfo = [];
			this.save();
			if (requiredFieldInfo.length) {
				
				status = this.handleChangeValuestate(requiredFieldInfo, oView);
			}
			if (status) {
				return new Promise(function (fnResolve, fnReject) {
					var oModel = oController.oModel;
				
					var fnResetChangesAndReject = function (sMessage) {
						oModel.resetChanges();
						fnReject(new Error(sMessage));
					};
					if (oModel && oModel.hasPendingChanges()) {
						oModel.submitChanges({
							success: function (oResponse) {
								var oBatchResponse = oResponse.__batchResponses[0];
								var oChangeResponse = oBatchResponse.__changeResponses && oBatchResponse.__changeResponses[0];
								if (oChangeResponse && oChangeResponse.data) {
									var sNewContext = oModel.getKey(oChangeResponse.data);
									oView.unbindObject();
									oView.bindObject({
										path: "/" + sNewContext
									});
									if (window.history && window.history.replaceState) {
										window.history.replaceState(undefined, undefined, window.location.hash.replace(encodeURIComponent(oController.sContext),
											encodeURIComponent(sNewContext)));
									}
									oModel.refresh();
									fnResolve();
								} else if (oChangeResponse && oChangeResponse.response) {
									fnResetChangesAndReject(oChangeResponse.message);
								} else if (!oChangeResponse && oBatchResponse.response) {
									fnResetChangesAndReject(oBatchResponse.message);
								} else {
									oModel.refresh();
									fnResolve();
								}
							},
							error: function (oError) {
								fnReject(new Error(oError.message));
							}
						});
					} else {
						fnResolve();
					}
				}).catch(function (err) {
					if (err !== undefined) {
						MessageBox.error(err.message);
					}
				});
			}
		},
		handleChangeValuestate: function (requiredFieldInfo, oView) {
			var status = true;
			if (requiredFieldInfo) {
				requiredFieldInfo.forEach(function (requiredinfo) {
					var input = oView.byId(requiredinfo.id);
					if (input) {
						input.setValueState("None"); //initially set ValueState to None
						if (input.getValue() === "") {
							input.setValueState("Error"); //input is blank set ValueState to error
							status = false;
						} else if (input.getDateValue && !input._bValid) { //since 1.64 ui5 will be providing a function 'isValidValue' that can be used here.
							input.setValueState("Error"); //Invalid Date set ValueState to error
							status = false;
						}
					}
				});
			}
			return status;

		},
		onInit: function () {
			
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("CrearOrdenDeCompra2").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
			this.oModel = this.getOwnerComponent().getModel();

		},
		onChange: function (oEvent){
			
			var SelectedItem = oEvent.getParameter("selectedItem");
			var oContext = SelectedItem.getBindingContext();
			var Telefono = oContext.getProperty("Telefono");
            var Correo = oContext.getProperty("Correo");
            var Direccion = oContext.getProperty("Direccion"); 
            var ciudad = oContext.getProperty("Ciudad");
            
            var textTelefono = this.byId("telefonoP");
            var textCorreo = this.byId("correoP");
            var textDireccion = this.byId("direccionP");
            var textCiudad = this.byId("ciudadP");
            
             
             textTelefono.setText(Telefono);
             textCorreo.setText(Correo);
             textDireccion.setText(Direccion);
             textCiudad.setText(ciudad);
		},
		onChange1: function(oEvent){
			var oLocale = new sap.ui.core.Locale("en-US");
                var oFormatOptions = {
                 minIntegerDigits: 3,
                 maxIntegerDigits: 10,
                 minFractionDigits: 2,
                 maxFractionDigits: 4
                   };

             var oFloatFormat = sap.ui.core.format.NumberFormat.getFloatInstance(oFormatOptions, oLocale);
			
			
			var SelectedItem = oEvent.getParameter("selectedItem");
			var oContext = SelectedItem.getBindingContext();
			var precioUnit = oContext.getProperty("Precio");
			var cantidad = this.byId("cant1").getValue();
			console.log(cantidad);
		    var textPrecioUnit = this.byId("precioUn1");
		    var textPrecioTot = this.byId("precioTot1");
		    var cantidadNumber = parseInt(cantidad, 10);
		    var result = precioUnit * cantidadNumber ;
		    
		    var precioFormat = oFloatFormat.format(precioUnit);
		    var totalFormat = oFloatFormat.format(result);
		    
		    textPrecioUnit.setText("COP" + " " + precioFormat);
		    textPrecioTot.setText("COP" + " " + totalFormat);
		},
		onChange2: function(oEvent){
			
			var oLocale = new sap.ui.core.Locale("en-US");
                var oFormatOptions = {
                 minIntegerDigits: 3,
                 maxIntegerDigits: 10,
                 minFractionDigits: 2,
                 maxFractionDigits: 4
                   };

             var oFloatFormat = sap.ui.core.format.NumberFormat.getFloatInstance(oFormatOptions, oLocale);
			
			
			var SelectedItem = oEvent.getParameter("selectedItem");
			var oContext = SelectedItem.getBindingContext();
			var precioUnit = oContext.getProperty("Precio");
			var cantidad = this.byId("canti2").getValue();
			console.log(cantidad);
		    var textPrecioUnit = this.byId("precioUn2");
		    var textPrecioTot = this.byId("precioTot2");
		    var cantidadNumber = parseInt(cantidad, 10);
		    var result = precioUnit * cantidadNumber ;
		    
		    var precioFormat = oFloatFormat.format(precioUnit);
		    var totalFormat = oFloatFormat.format(result);
		    
		    textPrecioUnit.setText("COP" + " " + precioFormat);
		    textPrecioTot.setText("COP" + " " + totalFormat);
		}, 
		save: function(){
			
// 		var oModel = oController.oModel;
//			var oProperty = oModel.getProperty("/");
//			alert(JSON.stringify(oProperty));
			var noOrden = this.byId("noOrden").getText();
			var proveedor = this.byId("oComboBox").getValue();
			var Telefono = this.byId("telefonoP").getText();
            var Correo = this.byId("correoP").getText();
            var Direccion = this.byId("direccionP").getText();
            var Ciudad = this.byId("ciudadP").getText();
			var fechaOrden = this.byId("fechaOrden").getValue();
			var fechaPactada = this.byId("fechaPactada").getValue()
			var items = this.getView().byId("tableQuantity").getItems();
			var materiales = [];
			items.forEach(function(item){
    		//var str=item.getCells()[2].getText();	
    		//alert(parseFloat(str.split(" ").pop())*2);
    		var i = {"Nombre":item.getCells()[0].getValue(), "Cantidad":item.getCells()[1].getValue(), "Precio":item.getCells()[2].getText()};
    			
    			materiales.push(i);
			});
			
			var orden = {
				"NumeroOrden":noOrden, 
				"Proveedor":{
					"Nombre":proveedor, 
					"Telefono":Telefono, 
					"Correo":Correo, 
					"Direccion":Direccion, 
					"Ciudad":Ciudad,
				}, 
				"FechaOrden":fechaOrden, 
				"FechaPactada":fechaPactada , 
				"Materiales":materiales
			}
			alert("Guardado");
		}
		
	});
}, /* bExport= */ true);