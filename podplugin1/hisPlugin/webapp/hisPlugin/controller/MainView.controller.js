sap.ui.define([
    'jquery.sap.global',
	"sap/dm/dme/podfoundation/controller/PluginViewController",
	"sap/ui/model/json/JSONModel",
    "sap/m/ColumnListItem",
    "sap/m/Column",
    "sap/m/Text",
    'sap/m/Label',
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator',
    'sap/ui/comp/smartvariants/PersonalizableInfo',
    "sap/ui/core/Fragment",
    "sap/ui/core/Control",
    'sap/ui/export/Spreadsheet',  //Import the Spreadsheet library
    "sap/m/MessageToast"

], function (jQuery, PluginViewController, JSONModel, ColumnListItem, Column, Text, Label, Filter, FilterOperator, PersonalizableInfo, Fragment, Control, Spreadsheet, MessageToast) {
	"use strict";

	return PluginViewController.extend("company.custom.plugins.hisPlugin.hisPlugin.controller.MainView", {
		onInit: function () {
			PluginViewController.prototype.onInit.apply(this, arguments);
            var oModel = new JSONModel();
            this.getView().setModel(oModel, "data");

            // Fetch data from API
            this._fetchData();
        },

      

        onSearch: function (oEvent) {
            var oFilterBar = oEvent.getSource(),
                aFilterGroupItems = oFilterBar.getFilterGroupItems(),
                aFilters = [];
        
            // DateRange Selection
            var oDateRangeSelection = this.getView().byId("dateRange");
            var oDateRange = oDateRangeSelection.getDateValue();
            var oDateRangeEnd = oDateRangeSelection.getSecondDateValue();
        
            if (oDateRange && oDateRangeEnd) {
                aFilters.push(new Filter({
                    path: "plannedStartDate", // Assuming this is the field you want to filter
                    operator: FilterOperator.BT, // Between operator
                    value1: oDateRange.toISOString(), // Convert to ISO string
                    value2: oDateRangeEnd.toISOString()
                }));
            }
        
            // Iterate over filter group items to create filters
            aFilterGroupItems.forEach(function (oFGI) {
                var oControl = oFGI.getControl();
        
                if (oControl && oControl.getSelectedItems) {  // Handle MultiComboBox
                    var aSelectedItems = oControl.getSelectedItems();
                    if (aSelectedItems.length > 0) {
                        var aItemFilters = aSelectedItems.map(function (oSelectedItem) {
                            return new Filter({
                                path: oFGI.getName(),
                                operator: FilterOperator.EQ,
                                value1: oSelectedItem.getText()
                            });
                        });
                        aFilters.push(new Filter({
                            filters: aItemFilters,
                            and: false  // OR condition between selected items
                        }));
                    }
                } else if (oControl && oControl.getSelectedItem) {  // Handle other controls like ComboBox
                    var oSelectedItem = oControl.getSelectedItem();
                    if (oSelectedItem) {
                        aFilters.push(new Filter({
                            path: oFGI.getName(),
                            operator: FilterOperator.EQ,
                            value1: oSelectedItem.getText()
                        }));
                    }
                }
            });
        
            // Apply filters to the table binding
            var oTable = this.getView().byId('table');
            var oBinding = oTable.getBinding("items");
            if (oBinding) {
                oBinding.filter(aFilters);
            } else {
                console.error("Table binding is not available");
            }
        },
        
        onClearFilters: function () {
            var oFilterBar = this.getView().byId("filternbars"),
                aFilterGroupItems = oFilterBar.getFilterGroupItems();
        
            // Clear MultiComboBox selections
            aFilterGroupItems.forEach(function (oFGI) {
                var oControl = oFGI.getControl();
                if (oControl && oControl.setSelectedKeys) {
                    oControl.setSelectedKeys([]);  // Clear MultiComboBox selections
                }
            });
        
            // Clear DateRangeSelection
            var oDateRangeSelection = this.getView().byId("dateRange");
            if (oDateRangeSelection) {
                oDateRangeSelection.setDateValue(null);
                oDateRangeSelection.setSecondDateValue(null);
            }
        
            // Clear Table Filters
            var oTable = this.getView().byId("table");
            var oBinding = oTable.getBinding("items");
            if (oBinding) {
                oBinding.filter([]);
            } else {
                console.error("Table binding is not available");
            }
        
            MessageToast.show("Filters cleared.");
        },
        
        _fetchData: function () {
            var that = this;
            var sUrl = this.getPublicApiRestDataSourceUri() + '/order/v1/orders/list';
            var oParameters = {
                plant: 'M206'
            };

            this.ajaxGetRequest(sUrl, oParameters, function (oResponseData) {
                that.handleResponse(oResponseData);
            }, function (oError, sHttpErrorMessage) {
                that.handleErrorMessage(oError, sHttpErrorMessage);
            });
        },

        handleResponse: function (oResponseData) {
            var oModel = this.getView().getModel("data");
            oModel.setProperty("/tabItems", oResponseData.content);
        },

        handleErrorMessage: function (oError, sHttpErrorMessage) {
            var err = oError || sHttpErrorMessage;
            this.showErrorMessage(err, true, true);
        },

			
			           
            
		



			
			           
            
		




        onAfterRendering: function(){
           
            // this.getView().byId("backButton").setVisible(this.getConfiguration().backButtonVisible);
            // this.getView().byId("closeButton").setVisible(this.getConfiguration().closeButtonVisible);
            
            // this.getView().byId("headerTitle").setText(this.getConfiguration().title);
            // this.getView().byId("textPlugin").setText(this.getConfiguration().text); 

        },

		onBeforeRenderingPlugin: function () {

			
			
		},

        isSubscribingToNotifications: function() {
            
            var bNotificationsEnabled = true;
           
            return bNotificationsEnabled;
        },


        getCustomNotificationEvents: function(sTopic) {
            //return ["template"];
        },


        getNotificationMessageHandler: function(sTopic) {

            //if (sTopic === "template") {
            //    return this._handleNotificationMessage;
            //}
            return null;
        },

        _handleNotificationMessage: function(oMsg) {
           
            var sMessage = "Message not found in payload 'message' property";
            if (oMsg && oMsg.parameters && oMsg.parameters.length > 0) {
                for (var i = 0; i < oMsg.parameters.length; i++) {

                    switch (oMsg.parameters[i].name){
                        case "template":
                            
                            break;
                        case "template2":
                            
                        
                        }        
          

                    
                }
            }

        },
        

		onExit: function () {
			PluginViewController.prototype.onExit.apply(this, arguments);


		}
	});
});