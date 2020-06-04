sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"./utilities",
	"sap/ui/core/routing/History"
], function (BaseController, MessageBox, Utilities, History) {
	"use strict";

	return BaseController.extend("com.sap.build.standard.prototipo1.controller.InventarioProducto", {
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
		_onPageNavButtonPress: function (oEvent) {

			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function (fnResolve) {

				this.doNavigate("Home", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

		},
		doNavigate: function (sRouteName, oBindingContext, fnPromiseResolve, sViaRelation) {
			var sPath = (oBindingContext) ? oBindingContext.getPath() : null;
			var oModel = (oBindingContext) ? oBindingContext.getModel() : null;

			var sEntityNameSet;
			if (sPath !== null && sPath !== "") {
				if (sPath.substring(0, 1) === "/") {
					sPath = sPath.substring(1);
				}
				sEntityNameSet = sPath.split("(")[0];
			}
			var sNavigationPropertyName;
			var sMasterContext = this.sMasterContext ? this.sMasterContext : sPath;

			if (sEntityNameSet !== null) {
				sNavigationPropertyName = sViaRelation || this.getOwnerComponent().getNavigationPropertyForNavigationWithContext(sEntityNameSet,
					sRouteName);
			}
			if (sNavigationPropertyName !== null && sNavigationPropertyName !== undefined) {
				if (sNavigationPropertyName === "") {
					this.oRouter.navTo(sRouteName, {
						context: sPath,
						masterContext: sMasterContext
					}, false);
				} else {
					oModel.createBindingContext(sNavigationPropertyName, oBindingContext, null, function (bindingContext) {
						if (bindingContext) {
							sPath = bindingContext.getPath();
							if (sPath.substring(0, 1) === "/") {
								sPath = sPath.substring(1);
							}
						} else {
							sPath = "undefined";
						}

						// If the navigation is a 1-n, sPath would be "undefined" as this is not supported in Build
						if (sPath === "undefined") {
							this.oRouter.navTo(sRouteName);
						} else {
							this.oRouter.navTo(sRouteName, {
								context: sPath,
								masterContext: sMasterContext
							}, false);
						}
					}.bind(this));
				}
			} else {
				this.oRouter.navTo(sRouteName);
			}

			if (typeof fnPromiseResolve === "function") {
				fnPromiseResolve();
			}

		},
		_onObjectListItemPress: function (oEvent) {

			var oBindingContext = oEvent.getParameter("listItem").getBindingContext();

			return new Promise(function (fnResolve) {
				this.doNavigate("DetalleProducto", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

		},
		_onObjectListItemPress1: function (oEvent) {

			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function (fnResolve) {

				this.doNavigate("DetalleProducto", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

		},
		_onOverflowToolbarButtonPress: function (oEvent) {

			this.mSettingsDialogs = this.mSettingsDialogs || {};
			var sSourceId = oEvent.getSource().getId();
			var oDialog = this.mSettingsDialogs["ViewSettingsDialog1"];

			var confirmHandler = function (oConfirmEvent) {
				var self = this;
				var sFilterString = oConfirmEvent.getParameter('filterString');
				var oBindingData = {};

				/* Grouping */
				if (oConfirmEvent.getParameter("groupItem")) {
					var sPath = oConfirmEvent.getParameter("groupItem").getKey();
					oBindingData.groupby = [new sap.ui.model.Sorter(sPath, oConfirmEvent.getParameter("groupDescending"), true)];
				} else {
					// Reset the group by
					oBindingData.groupby = null;
				}

				/* Sorting */
				if (oConfirmEvent.getParameter("sortItem")) {
					var sPath = oConfirmEvent.getParameter("sortItem").getKey();
					oBindingData.sorters = [new sap.ui.model.Sorter(sPath, oConfirmEvent.getParameter("sortDescending"))];
				}

				/* Filtering */
				oBindingData.filters = [];
				// The list of filters that will be applied to the collection
				var oFilter;
				var vValueLT, vValueGT;

				vValueLT = oDialog.getModel().getProperty("/Cantidad/vValueLT");
				vValueGT = oDialog.getModel().getProperty("/Cantidad/vValueGT");
				if (vValueLT !== "" || vValueGT !== "") {
					oFilter = this.getCustomFilter("Cantidad", vValueLT, vValueGT);
					oBindingData.filters.push(oFilter);
					sFilterString = sFilterString ? sFilterString + ', ' : 'Filtered by: ';
					sFilterString += this.getCustomFilterString(true, "Cantidad", oFilter.sOperator, vValueLT, vValueGT);
				}

				// Simple filters (String)
				var mSimpleFilters = {},
					sKey;
				for (sKey in oConfirmEvent.getParameter("filterKeys")) {
					var aSplit = sKey.split("___");
					var sPath = aSplit[1];
					var sValue1 = aSplit[2];
					var oFilterInfo = new sap.ui.model.Filter(sPath, "EQ", sValue1);

					// Creating a map of filters for each path
					if (!mSimpleFilters[sPath]) {
						mSimpleFilters[sPath] = [oFilterInfo];
					} else {
						mSimpleFilters[sPath].push(oFilterInfo);
					}
				}

				for (var path in mSimpleFilters) {
					// All filters on a same path are combined with a OR
					oBindingData.filters.push(new sap.ui.model.Filter(mSimpleFilters[path], false));
				}

				aCollections.forEach(function (oCollectionItem) {
					var oCollection = self.getView().byId(oCollectionItem.id);
					var oBindingInfo = oCollection.getBindingInfo(oCollectionItem.aggregation);
					var oBindingOptions = this.updateBindingOptions(oCollectionItem.id, oBindingData, sSourceId);
					if (oBindingInfo.model === "kpiModel") {
						oCollection.getObjectBinding().refresh();
					} else {
						oCollection.bindAggregation(oCollectionItem.aggregation, {
							model: oBindingInfo.model,
							path: oBindingInfo.path,
							parameters: oBindingInfo.parameters,
							template: oBindingInfo.template,
							templateShareable: true,
							sorter: oBindingOptions.sorters,
							filters: oBindingOptions.filters
						});
					}

					// Display the filter string if necessary
					if (typeof oCollection.getInfoToolbar === "function") {
						var oToolBar = oCollection.getInfoToolbar();
						if (oToolBar && oToolBar.getContent().length === 1) {
							oToolBar.setVisible(!!sFilterString);
							oToolBar.getContent()[0].setText(sFilterString);
						}
					}
				}, this);
			}.bind(this);

			function resetFiltersHandler() {

				oDialog.getModel().setProperty("/Cantidad/vValueLT", "");
				oDialog.getModel().setProperty("/Cantidad/vValueGT", "");

			}

			function updateDialogData(filters) {
				var mParams = {
					context: oReferenceCollection.getBindingContext(),
					success: function (oData) {
						var oJsonModelDialogData = {};
						// Loop through each entity
						oData.results.forEach(function (oEntity) {
							// Add the distinct properties in a map
							for (var oKey in oEntity) {
								if (!oJsonModelDialogData[oKey]) {
									oJsonModelDialogData[oKey] = [oEntity[oKey]];
								} else if (oJsonModelDialogData[oKey].indexOf(oEntity[oKey]) === -1) {
									oJsonModelDialogData[oKey].push(oEntity[oKey]);
								}
							}
						});

						var oDialogModel = oDialog.getModel();

						oJsonModelDialogData["Cantidad"] = {
							vValueLT: (oDialogModel && oDialogModel.getProperty("/Cantidad")) ? oDialogModel.getProperty("/Cantidad/vValueLT") : "",
							vValueGT: (oDialogModel && oDialogModel.getProperty("/Cantidad")) ? oDialogModel.getProperty("/Cantidad/vValueGT") : ""
						};

						if (!oDialogModel) {
							oDialogModel = new sap.ui.model.json.JSONModel();
							oDialog.setModel(oDialogModel);
						}
						oDialogModel.setData(oJsonModelDialogData);
						oDialog.open();
					}
				};
				var sPath;
				var sModelName = oReferenceCollection.getBindingInfo(aCollections[0].aggregation).model;
				// In KPI mode for charts, getBindingInfo would return the local JSONModel
				if (sModelName === "kpiModel") {
					sPath = oReferenceCollection.getObjectBinding().getPath();
				} else {
					sPath = oReferenceCollection.getBindingInfo(aCollections[0].aggregation).path;
				}
				mParams.filters = filters;
				oModel.read(sPath, mParams);
			}

			if (!oDialog) {
				oDialog = sap.ui.xmlfragment({
					fragmentName: "com.sap.build.standard.prototipo1.view.ViewSettingsDialog1"
				}, this);
				oDialog.attachEvent("confirm", confirmHandler);
				oDialog.attachEvent("resetFilters", resetFiltersHandler);

				this.mSettingsDialogs["ViewSettingsDialog1"] = oDialog;
			}

			var aCollections = [];

			aCollections.push({
				id: "sap_m_Page_0-content-sap_m_ObjectList-1588887640354-nouaf9rif5yv9lqnor526f2b7_S7",
				aggregation: "items"
			});

			var oReferenceCollection = this.getView().byId(aCollections[0].id);
			var oSourceBindingContext = oReferenceCollection.getBindingContext();
			var oModel = oSourceBindingContext ? oSourceBindingContext.getModel() : this.getView().getModel();

			// toggle compact style
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), oDialog);
			var designTimeFilters = this.mBindingOptions && this.mBindingOptions[aCollections[0].id] && this.mBindingOptions[aCollections[0].id]
				.filters && this.mBindingOptions[aCollections[0].id].filters[undefined];
			updateDialogData(designTimeFilters);

		},
		updateBindingOptions: function (sCollectionId, oBindingData, sSourceId) {
			this.mBindingOptions = this.mBindingOptions || {};
			this.mBindingOptions[sCollectionId] = this.mBindingOptions[sCollectionId] || {};

			var aSorters = this.mBindingOptions[sCollectionId].sorters;
			var aGroupby = this.mBindingOptions[sCollectionId].groupby;

			// If there is no oBindingData parameter, we just need the processed filters and sorters from this function
			if (oBindingData) {
				if (oBindingData.sorters) {
					aSorters = oBindingData.sorters;
				}
				if (oBindingData.groupby || oBindingData.groupby === null) {
					aGroupby = oBindingData.groupby;
				}
				// 1) Update the filters map for the given collection and source
				this.mBindingOptions[sCollectionId].sorters = aSorters;
				this.mBindingOptions[sCollectionId].groupby = aGroupby;
				this.mBindingOptions[sCollectionId].filters = this.mBindingOptions[sCollectionId].filters || {};
				this.mBindingOptions[sCollectionId].filters[sSourceId] = oBindingData.filters || [];
			}

			// 2) Reapply all the filters and sorters
			var aFilters = [];
			for (var key in this.mBindingOptions[sCollectionId].filters) {
				aFilters = aFilters.concat(this.mBindingOptions[sCollectionId].filters[key]);
			}

			// Add the groupby first in the sorters array
			if (aGroupby) {
				aSorters = aSorters ? aGroupby.concat(aSorters) : aGroupby;
			}

			var aFinalFilters = aFilters.length > 0 ? [new sap.ui.model.Filter(aFilters, true)] : undefined;
			return {
				filters: aFinalFilters,
				sorters: aSorters
			};

		},
		getCustomFilter: function (sPath, vValueLT, vValueGT) {
			if (vValueLT !== "" && vValueGT !== "") {
				return new sap.ui.model.Filter([
					new sap.ui.model.Filter(sPath, sap.ui.model.FilterOperator.GT, vValueGT),
					new sap.ui.model.Filter(sPath, sap.ui.model.FilterOperator.LT, vValueLT)
				], true);
			}
			if (vValueLT !== "") {
				return new sap.ui.model.Filter(sPath, sap.ui.model.FilterOperator.LT, vValueLT);
			}
			return new sap.ui.model.Filter(sPath, sap.ui.model.FilterOperator.GT, vValueGT);

		},
		getCustomFilterString: function (bIsNumber, sPath, sOperator, vValueLT, vValueGT) {
			switch (sOperator) {
			case sap.ui.model.FilterOperator.LT:
				return sPath + (bIsNumber ? ' (Less than ' : ' (Before ') + vValueLT + ')';
			case sap.ui.model.FilterOperator.GT:
				return sPath + (bIsNumber ? ' (More than ' : ' (After ') + vValueGT + ')';
			default:
				if (bIsNumber) {
					return sPath + ' (More than ' + vValueGT + ' and less than ' + vValueLT + ')';
				}
				return sPath + ' (After ' + vValueGT + ' and before ' + vValueLT + ')';
			}

		},
		filterCountFormatter: function (sValue1, sValue2) {
			return sValue1 !== "" || sValue2 !== "" ? 1 : 0;

		},
		_onButtonPress: function (oEvent) {

			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function (fnResolve) {

				this.doNavigate("CrearOrdenDeCompra2", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

		},
		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("InventarioProducto").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));

		},
		onExit: function () {

			// to destroy templates for bound aggregations when templateShareable is true on exit to prevent duplicateId issue
			var aControls = [{
				"controlId": "sap_m_Page_0-content-sap_m_ObjectList-1588887640354-nouaf9rif5yv9lqnor526f2b7_S7",
				"groups": ["items"]
			}];
			for (var i = 0; i < aControls.length; i++) {
				var oControl = this.getView().byId(aControls[i].controlId);
				if (oControl) {
					for (var j = 0; j < aControls[i].groups.length; j++) {
						var sAggregationName = aControls[i].groups[j];
						var oBindingInfo = oControl.getBindingInfo(sAggregationName);
						if (oBindingInfo) {
							var oTemplate = oBindingInfo.template;
							oTemplate.destroy();
						}
					}
				}
			}

		}
	});
}, /* bExport= */ true);