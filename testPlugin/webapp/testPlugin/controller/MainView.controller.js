sap.ui.define([
    'jquery.sap.global',
	"sap/dm/dme/podfoundation/controller/PluginViewController",
	"sap/ui/model/json/JSONModel",
    "sap/m/ColumnListItem",
    // "sap/m/Column",
    // "sap/m/Text",
    'sap/m/Label',
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator',
    'sap/ui/comp/smartvariants/PersonalizableInfo',
    "sap/ui/core/Fragment",
    "sap/ui/core/Control",
    'sap/ui/export/Spreadsheet', // Import the Spreadsheet library
     "sap/ui/table/Column",
     "sap/m/Text",
     "sap/m/MessageBox",
     "sap/m/MessageToast"
], function (jQuery, PluginViewController, JSONModel, ColumnListItem, Label, Filter, FilterOperator, PersonalizableInfo, Fragment, Control, Spreadsheet, Column, Text, MessageBox, MessageToast) {
	"use strict";

	return PluginViewController.extend("company.custom.plugins.testPlugin.testPlugin.controller.MainView", {
		onInit: function () {
			PluginViewController.prototype.onInit.apply(this, arguments);
            var oModel = new JSONModel();
            this.getView().setModel(oModel, "data");

            // Fetch data from API
            this._fetchData();
            
        
		},
        onMaterialValueHelpRequest: function() {
            var oView = this.getView(),
                oViewModel = oView.getModel("data");
            
            if (!this.oMaterialVHDia) {
                //Load the fragment
                this.oMaterialVHDia = sap.ui.xmlfragment(
                    "company.custom.plugins.testPlugin.testPlugin.view.fragments.MaterialValueHelpRequest",
                    this
                );

                this.oMaterialVHDia.getTableAsync().then(function (oTable) {
                    //Add columns to the table
                    oTable.addColumn(
                        new Column({
                            label: new Text({ text: "Material" }),
                            template: new Text({ text: "{data>material/material}" }),
                            width: "170px"

                        })
                    );
                    oTable.addColumn(
                        new Column({
                            label: new Text({ text: "status" }),
                            template: new Text({ text: "{data>material/description}" }),
                            width: "180px"
                        })
                    );
                    oTable.addColumn(
                        new Column({
                            label: new Text({ text: "orderType" }),
                            template: new Text({ text: "{data>material/version}" }),
                            width: "170px"
                        })
                    );
                    //Bind data to the table
                    oTable.setModel(oViewModel, "data");
                    oTable.bindRows("data>/tabItems");
                });
            }
            this.oMaterialVHDia.open();
        },
         
        onMaterialVHDiaSearch: function (oEvent) {
            var oFilterBar = oEvent.getSource(),
            aFilterGroupItems = oFilterBar.getFilterGroupItems(),
            aFilters = [];

            //Create filters based on selected input Values
            aFilters = aFilterGroupItems.map(function (oFGI) {
                var oControl = oFGI.getControl();
                if (oControl && oControl.getValue) {
                    return new Filter({
                        path: oFGI.getName(),
                        operator: FilterOperator.Contains,
                        value1: oControl.getValue()
                    });
                }
            })
            .filter(Boolean); //Filter out empty values

            //Get the table for dialog and apply filter 
            this.oMaterialVHDia.getTableAsync().then(oTable => {
               var oRowBindingCtx = oTable.getBinding("rows");
            //    oRowBindingCtx = oTable.getBinding("rows");
               oRowBindingCtx.filter(aFilters);
            });
        },
        onMaterialVHDiaOKPress: function (oEvent) {
            var aSelectedItems = oEvent.getParameter("tokens");

            //No order selected
            if (aSelectedItems.length < 1) {
                return;
            }

            //Close dialog
            this.oMaterialVHDia.close();

            //Get Batch info for selected resource
            var sSelectedmaterial = aSelectedItems[0].getKey();

            //Set the selected order to model
            var oViewModel = this.getView().getModel("data");
            oViewModel.setProperty("/material/material", sSelectedmaterial);
            oViewModel.setProperty("/ismaterialSelected", true);
            console.log("sSelectedmaterial", sSelectedmaterial);
        },

        
        
        

            onMaterialVHDiaCancelPress: function (oEvent) {
                this.oMaterialVHDia.close();
            },
        
        onOrderValueHelpRequest: function() {
            var oView = this.getView(),
                oViewModel = oView.getModel("data");
            
            if (!this.oOrderVHDia) {
                //Load the fragment
                this.oOrderVHDia = sap.ui.xmlfragment(
                    "company.custom.plugins.testPlugin.testPlugin.view.fragments.OrderValueHelpRequest",
                    this
                );

                this.oOrderVHDia.getTableAsync().then(function (oTable) {
                    //Add columns to the table
                    oTable.addColumn(
                        new Column({
                            label: new Text({ text: "Order" }),
                            template: new Text({ text: "{data>order}" }),
                            width: "170px"

                        })
                    );
                    oTable.addColumn(
                        new Column({
                            label: new Text({ text: "status" }),
                            template: new Text({ text: "{data>status}" }),
                            width: "170px"
                        })
                    );
                    oTable.addColumn(
                        new Column({
                            label: new Text({ text: "orderType" }),
                            template: new Text({ text: "{data>orderType}" }),
                            width: "170px"
                        })
                    );
                    //Bind data to the table
                    oTable.setModel(oViewModel, "data");
                    oTable.bindRows("data>/tabItems");
                });
            }
            this.oOrderVHDia.open();
        },
         
        onOrderVHDiaSearch: function (oEvent) {
            var oFilterBar = oEvent.getSource(),
            aFilterGroupItems = oFilterBar.getFilterGroupItems(),
            aFilters = [];

            //Create filters based on selected input Values
            aFilters = aFilterGroupItems.map(function (oFGI) {
                var oControl = oFGI.getControl();
                if (oControl && oControl.getValue) {
                    return new Filter({
                        path: oFGI.getName(),
                        operator: FilterOperator.Contains,
                        value1: oControl.getValue()
                    });
                }
            })
            .filter(Boolean); //Filter out empty values

            //Get the table for dialog and apply filter 
            this.oOrderVHDia.getTableAsync().then(oTable => {
               var oRowBindingCtx = oTable.getBinding("rows");
            //    oRowBindingCtx = oTable.getBinding("rows");
               oRowBindingCtx.filter(aFilters);
            });
        },
        onOrderVHDiaOKPress: function (oEvent) {
            var aSelectedItems = oEvent.getParameter("tokens");

            //No order selected
            if (aSelectedItems.length < 1) {
                return;
            }

            //Close dialog
            this.oOrderVHDia.close();

            //Get Batch info for selected resource
            var sSelectedorder = aSelectedItems[0].getKey();

            //Set the selected order to model
            var oViewModel = this.getView().getModel("data");
            oViewModel.setProperty("/order", sSelectedorder);
            oViewModel.setProperty("/isorderSelected", true);
        },

        
        
        

            onOrderVHDiaCancelPress: function (oEvent) {
                this.oOrderVHDia.close();
            },
            onStatusValueHelpRequest: function() {
                var oView = this.getView(),
                    oViewModel = oView.getModel("data");
                
                if (!this.oStatusVHDia) {
                    //Load the fragment
                    this.oStatusVHDia = sap.ui.xmlfragment(
                        "company.custom.plugins.testPlugin.testPlugin.view.fragments.StatusValueHelpRequest",
                        this
                    );
    
                    this.oStatusVHDia.getTableAsync().then(function (oTable) {
                        //Add columns to the table
                        oTable.addColumn(
                            new Column({
                                label: new Text({ text: "Status" }),
                                template: new Text({ text: "{data>status}" }),
                                width: "170px"
    
                            })
                        );
                        oTable.addColumn(
                            new Column({
                                label: new Text({ text: "executionStatus" }),
                                template: new Text({ text: "{data>executionStatus}" }),
                                width: "170px"
                            })
                        );
                        oTable.addColumn(
                            new Column({
                                label: new Text({ text: "releaseStatus" }),
                                template: new Text({ text: "{data>releaseStatus}" }),
                                width: "170px"
                            })
                        );
                        //Bind data to the table
                        oTable.setModel(oViewModel, "data");
                        oTable.bindRows("data>/tabItems");
                    });
                }
                this.oStatusVHDia.open();
            },
             
            onStatusVHDiaSearch: function (oEvent) {
                var oFilterBar = oEvent.getSource(),
                aFilterGroupItems = oFilterBar.getFilterGroupItems(),
                aFilters = [];
    
                //Create filters based on selected input Values
                aFilters = aFilterGroupItems.map(function (oFGI) {
                    var oControl = oFGI.getControl();
                    if (oControl && oControl.getValue) {
                        return new Filter({
                            path: oFGI.getName(),
                            operator: FilterOperator.Contains,
                            value1: oControl.getValue()
                        });
                    }
                })
                .filter(Boolean); //Filter out empty values
    
                //Get the table for dialog and apply filter 
                this.oStatusVHDia.getTableAsync().then(oTable => {
                   var oRowBindingCtx = oTable.getBinding("rows");
                //    oRowBindingCtx = oTable.getBinding("rows");
                   oRowBindingCtx.filter(aFilters);
                });
            },
            onStatusVHDiaOKPress: function (oEvent) {
                var aSelectedItems = oEvent.getParameter("tokens");
    
                //No Status selected
                if (aSelectedItems.length < 1) {
                    return;
                }
    
                //Close dialog
                this.oStatusVHDia.close();
    
                //Get Batch info for selected resource
                var sSelectedStatus = aSelectedItems[0].getKey();
    
                //Set the selected order to model
                var oViewModel = this.getView().getModel("data");
                oViewModel.setProperty("/status", sSelectedStatus);
                oViewModel.setProperty("/isStatusSelected", true);
            },
    
            
            
            
    
                onStatusVHDiaCancelPress: function (oEvent) {
                    this.oStatusVHDia.close();
                },
                onSearch: function() {
                    var oView = this.getView(),
                        oViewModel = oView.getModel("data"),
                        aFilters = [];
                
                    // Get selected Order
                    var sSelectedOrder = oViewModel.getProperty("/order");
                    if (sSelectedOrder) {
                        aFilters.push(new sap.ui.model.Filter("order", sap.ui.model.FilterOperator.EQ, sSelectedOrder));
                    }
                
                    // Get selected Material
                    var sSelectedMaterial = oViewModel.getProperty("/material/material");
                    if (sSelectedMaterial) {
                        aFilters.push(new sap.ui.model.Filter("material/material", sap.ui.model.FilterOperator.EQ, sSelectedMaterial));
                    }
                
                    // Get selected Status
                    var sSelectedStatus = oViewModel.getProperty("/status");
                    if (sSelectedStatus) {
                        aFilters.push(new sap.ui.model.Filter("status", sap.ui.model.FilterOperator.EQ, sSelectedStatus));
                    }
                
                    // Get selected Date Range (start and end dates)
                    var oDateRange = oView.byId("dateRange").getDateValue();
                    var oEndDate = oView.byId("dateRange").getSecondDateValue();
                    console.log("oDateRange", oDateRange);
                    console.log("oEndDate", oEndDate);


                    
                    // Apply Date Range filter if dates are selected
                    if (oDateRange && oEndDate) {
                        //Convert the dates to ISO format strins(e.g., "YYYY-MM-DD")
                        var sStartDateISO = oDateRange.toISOString();
                        var sEndDateISO = oEndDate.toISOString();

                        
                        aFilters.push(new sap.ui.model.Filter({
                            path: "plannedStartDate",
                            operator: sap.ui.model.FilterOperator.BT,
                            value1: sStartDateISO,
                            value2: sEndDateISO
                        }));
                    }
                
                    // Apply filters to the table's binding
                    var oTable = oView.byId("table"),
                        oBinding = oTable.getBinding("items");
                        console.log("aFilters", aFilters);
                        console.log("Table Binding before filters:", oBinding);

                
                    oBinding.filter(aFilters);
                    oBinding.refresh(true);
                    //Log table binding after filter to verify
                    console.log("Table Binding after filter:", oBinding);
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