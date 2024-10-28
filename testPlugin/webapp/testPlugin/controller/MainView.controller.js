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
    'sap/ui/export/Spreadsheet' // Import the Spreadsheet library
], function (jQuery, PluginViewController, JSONModel, ColumnListItem, Column, Text, Label, Filter, FilterOperator, PersonalizableInfo, Fragment, Control, Spreadsheet) {
	"use strict";

	return PluginViewController.extend("company.custom.plugins.testPlugin.testPlugin.controller.MainView", {
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

            aFilters = aFilterGroupItems.map(function (oFGI) {
                var oControl = oFGI.getControl();
                if (oControl && oControl.getSelectedItem) {
                    var oSelectedItem = oControl.getSelectedItem();
                    if (oSelectedItem) {
                        var sSelectedText = oSelectedItem.getText();
                        return new Filter({
                            path: oFGI.getName(),
                            operator: FilterOperator.EQ,
                            value1: sSelectedText
                        });
                    }
                }
                return null;
            }).filter(function (oFilter) {
                return oFilter !== null;
            });

            var oTable = this.getView().byId('table');
            var oBinding = oTable.getBinding("items");
            if (oBinding) {
                oBinding.filter(aFilters);
            } else {
                console.error("Table binding is not available");
            }
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

        onExportToExcel: function () {
            var oModel = this.getView().getModel("data");
            var aData = oModel.getProperty("/tabItems");

            var aColumns = [
                { label: 'Order', property: 'order' },
                { label: 'Order Description', property: 'orderDescription' },
                { label: 'Order Status', property: 'status' },
                { label: 'Material', property: 'material/material' },
                { label: 'Material Description', property: 'material/description' },
                { label: 'Batch Number', property: 'batchNumber' },
                { label: 'Resource', property: 'resource' },
                { label: 'Work Center', property: 'workCenter' },
                { label: 'Quantity', property: 'buildQuantity' },
                { label: 'User ID', property: 'userId' },
                { label: 'Order Start Date', property: 'plannedStartDate' },
                { label: 'Order End Date', property: 'plannedCompletionDate' },
                { label: 'Consumption Time and Date', property: 'consumptionTimeAndDate' }
            ];

            var oSpreadsheet = new Spreadsheet({
                workbook: {
                    columns: aColumns,
                    hierarchyLevel: 'Level',
                    // context: {
                    //     application: "some value",
                    //     version: "some value",
                    //     title: "some value",
                    //     modifiedBy: "some value",
                    //     sheetName: "some value"
                    // }
                },
                dataSource: this.getView().byId('table').getBinding("items"),
                // columns: aColumns,
                fileName: 'report.xlsx',
                worker: false, // try disabling the worker if it's causing issues
                showProgress: true // enable to see if it helps in identifying where it fails
            });

            oSpreadsheet.build().then(function () {
                console.log('Export to Excel successful!');
            }).catch(function (oError) {
                console.error('Error while saving the file:', oError);
            });
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
        onBackPress:function(){
            UIComponent.getRouterFor(this).navTo("RouteView2");
            
        },

		onExit: function () {
			PluginViewController.prototype.onExit.apply(this, arguments);


		},
      
        
        
	});
});