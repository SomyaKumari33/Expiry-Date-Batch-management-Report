sap.ui.define([
    'jquery.sap.global',
    "sap/dm/dme/podfoundation/controller/PluginViewController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/comp/valuehelpdialog/ValueHelpDialog",
    "sap/ui/table/Table",
    "sap/ui/table/Column",
    "sap/m/Text",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/comp/filterbar/FilterBar",
    "sap/m/Input"    // Import the Input control
], function (jQuery, PluginViewController, JSONModel, ValueHelpDialog, Table, Column, Text, Filter, FilterOperator, MessageToast, MessageBox, FilterBar, Input) {
    "use strict";

    return PluginViewController.extend("company.custom.plugins.expiryPlugin.expiryPlugin.controller.MainView", {
        onInit: function () {
            PluginViewController.prototype.onInit.apply(this, arguments);
            // Create and set the data model for the view 
            var oModel = new JSONModel();
            this.getView().setModel(oModel, "data");

            // Fetch data from the backend API
            this._fetchOrderData();
        },

        _fetchOrderData: function () {
            var that = this;
            var oParameters = {
                plant: 'M206',
                page: '1,2,3,4,5,6,7,8,9,10',
                size: '1000'
            }; // Plant parameter for Order API

            // Fetch data from the Order API
            var sOrderUrl = this.getPublicApiRestDataSourceUri() + '/material/v2/materials';
            this.ajaxGetRequest(sOrderUrl, oParameters, function (oOrderResponseData) {
                that.setOrderData(oOrderResponseData);
            }, function (oError, sHttpErrorMessage) {
                that.handleErrorMessage(oError, sHttpErrorMessage);
            });
        },

        setOrderData: function (oOrderResponseData) {
            // Map the order data to include material and batch number
            var OrderData = oOrderResponseData.content.map(function (order) {
                return {
                    material: order.material,
                    description: order.description,
                    version: order.version,
                    // material: order.material.material,
                    // batchNumber: order.batchNumber
                };
            });

            var oModel = this.getView().getModel("data");
            oModel.setProperty("/orders", OrderData);
        },

        _fetchBatchData: function (sMaterial) {
            var that = this;
            var oBatchParams = { plant: 'M206', material: sMaterial };
            var sBatchUrl = this.getPublicApiRestDataSourceUri() + '/inventory/v1/batches';

            // Fetch data from the Batch API
            this.ajaxGetRequest(sBatchUrl, oBatchParams, function (oBatchResponseData) {
                that.setBatchData(oBatchResponseData);
            }, function (oError, sHttpErrorMessage) {
                that.handleErrorMessage(oError, sHttpErrorMessage);
            });
        },
        // Set Batch Data

        setBatchData: function (oBatchResponseData) {
            var aBatchData = oBatchResponseData.content.map(function (batch) {
                return {
                    batchNumber: batch.batchNumber,
                    //   productionDate: this.formatDate(batch.productionDate),
                    //   shelfLifeExpirationDate: batch.shelfLifeExpirationDate ? this.formatDate(batch.shelfLifeExpirationDate) : "N/A",
                    productionDate: new Date(batch.productionDate),
                    shelfLifeExpirationDate: new Date(batch.shelfLifeExpirationDate)
                };
            }, this); // Pass 'this' to maintain context

            // Update the model with the batch data for binding
            var oModel = this.getView().getModel("data");
            oModel.setProperty("/batches", aBatchData); // Assuming you have a path for batches


            //If you want to auto-populate UI fields
            //  if (aBatchData.length > 0) {
            //    var batch = aBatchData[0]; // Use the first batch for auto-population
            //    this.byId("inputbatch").setValue(batch.batchNumber);
            //    this.byId("inputTarget15i").setValue(batch.productionDate);
            //   this.byId("inputTarget195n").setValue(batch.shelfLifeExpirationDate);
            // }

        },



        formatDate: function (dateString) {
            if (!dateString) return "N/A"; // Check for null or undefined
            var date = new Date(dateString);
            return sap.ui.core.format.DateFormat.getDateInstance({ pattern: "yyyy-MM-dd" }).format(date);
        },





        handleErrorMessage: function (oError, sHttpErrorMessage) {
            // Handle error messages for API calls
            var err = oError || sHttpErrorMessage;
            this.showErrorMessage(err, true, true);
        },

        onValueHelpRequest: function (oEvent) {
            var oInput = oEvent.getSource();

            // Destroy existing dialog if it exists
            if (this.oValueHelpDialog) {
                this.oValueHelpDialog.destroy();
            }

            // Create Value Help Dialog for single selection
            this.oValueHelpDialog = new ValueHelpDialog({
                title: "Select Material",
                supportMultiselect: false,
                key: 'material',
                ok: function (oEvent) {
                    var aSelectedItems = oEvent.getParameter("tokens");
                    if (aSelectedItems && aSelectedItems.length) {
                        var sSelectedOrder = aSelectedItems[0].getKey();
                        this._populateSingleOrderData(sSelectedOrder);
                    }
                    oInput.setTokens(aSelectedItems);
                    this.oValueHelpDialog.close();
                }.bind(this),
                cancel: function () {
                    this.oValueHelpDialog.close();
                }.bind(this)
            });

            // Create Filter Bar
            var oFilterBar = new FilterBar({
                advancedMode: false,
                search: this.onSearch.bind(this),
                filterGroupItems: [
                    new sap.ui.comp.filterbar.FilterGroupItem({
                        groupName: "group1",
                        name: "material",
                        label: "Material",
                        control: new sap.m.Input({
                            placeholder: "Search for Material...",
                            value: ""
                        })
                    })
                ]
            });

            // Create the table for displaying orders
            this.oTable = new sap.ui.table.Table(this.createId("orderTable"), {
                visibleRowCount: 4,
                selectionMode: "Single" // Set to single selection
            });

            // Add columns to the table
            this.oTable.addColumn(new Column({
                label: new Text({ text: "Material" }),
                template: new Text({ text: "{data>material}" }),
                width: "170px"
            }));

            this.oTable.addColumn(new Column({
                label: new Text({ text: "Description" }),
                template: new Text({ text: "{data>description}" }),
                width: "200px"
            }));

            this.oTable.addColumn(new Column({
                label: new Text({ text: "Version" }),
                template: new Text({ text: "{data>version}" }),
                width: "150px"
            }));



            // Bind data to the table
            this.oTable.setModel(this.getView().getModel("data"), "data");
            this.oTable.bindRows("data>/orders");

            // Set Filter Bar and Table to the Value Help Dialog
            this.oValueHelpDialog.setFilterBar(oFilterBar);
            this.oValueHelpDialog.setTable(this.oTable);
            this.oValueHelpDialog.setContentWidth("700px");

            // Open the dialog if order data is available
            if (this.getView().getModel("data").getProperty("/orders")) {
                this.oValueHelpDialog.open();
            }
        },


        _populateSingleOrderData: function (sSelectedOrder) {
            var oModel = this.getView().getModel("data");
            var aItems = oModel.getProperty("/orders") || [];

            // Find the selected order data based on material
            var oSelectedOrderData = aItems.find(function (item) {
                return item.material === sSelectedOrder;
            });

            if (oSelectedOrderData) {
                // Set initial values based on material selection
                this.byId("inputbatch").setValue(oSelectedOrderData.batchNumber);

                // Fetch batch data based on material
                this._fetchBatchData(oSelectedOrderData.material); // Call to fetch batch data
            }
        },
        //     var oSelectedOrderData = aItems.find(function (item) {
        //         item.batchNumber === sSelectedOrder;
        //     });
        //     if (oSelectedOrderData) {
        //         // Set  batch number to inputs
        //         this.byId("inputTarget15i").setValue(oSelectedOrderData.productionDate);
        //         this.byId("inputTarget195n").setValue(oSelectedOrderData.shelfLifeExpirationDate);

        //         // Fetch batch data for the selected material
        //         this._fetchBatchData(oSelectedOrderData.material); // Call to fetch batch data
        //     }
        // },


        onSearch: function (oEvent) {
            var oFilterBar = oEvent.getSource(),
                aFilterGroupItems = oFilterBar.getFilterGroupItems(),
                aFilters = [];

            // Create filters based on selected input values
            aFilters = aFilterGroupItems.map(function (oFGI) {
                var oControl = oFGI.getControl();
                if (oControl && oControl.getValue) {
                    return new Filter({
                        path: oFGI.getName(),
                        operator: FilterOperator.Contains,
                        value1: oControl.getValue()
                    });
                }
            }).filter(Boolean); // Filter out empty values

            // Apply filters to the table binding
            this.oTable.getBinding("rows").filter(aFilters);
        },

        onValueHelpRequestbatch: function (oEvent) {
            var oInput = oEvent.getSource();

            if (this.oValueHelpDialog) {
                this.oValueHelpDialog.destroy();
            }

            // Create Value Help Dialog for single selection
            this.oValueHelpDialog = new ValueHelpDialog({
                title: "Select Batch Number",
                supportMultiselect: false,
                key: 'batchNumber',
                ok: function (oEvent) {
                    var aSelectedItems = oEvent.getParameter("tokens");
                    if (aSelectedItems && aSelectedItems.length) {
                        var sSelectedBatch = aSelectedItems[0].getKey();
                        this._onBatchNumberSelection(sSelectedBatch);  // Correct function call
                        oInput.setTokens(aSelectedItems);
                    }
                    this.oValueHelpDialog.close();
                }.bind(this),
                cancel: function () {
                    this.oValueHelpDialog.close();
                }.bind(this)
            });

            // Create Filter Bar
            var oFilterBar = new FilterBar({
                advancedMode: false,
                search: this.onSearch.bind(this),
                filterGroupItems: [
                    new sap.ui.comp.filterbar.FilterGroupItem({
                        groupName: "group1",
                        name: "batchNumber",
                        label: "Batch Number",
                        control: new sap.m.Input({
                            placeholder: "Search for batchNumber...",
                            value: ""
                        })
                    })
                ]
            });

            // Create the table for displaying orders
            this.oTable = new sap.ui.table.Table(this.createId("orderTable"), {
                visibleRowCount: 4,
                selectionMode: "Single" // Set to single selection
            });

            // Add columns to the table
            this.oTable.addColumn(new Column({
                label: new Text({ text: "Batch Number" }),
                template: new Text({ text: "{data>batchNumber}" }),
                width: "150px"
            }));

            this.oTable.addColumn(new Column({
                label: new Text({ text: "shelfLifeExpirationDate" }),
                template: new Text({ text: "{data>shelfLifeExpirationDate}" }),
                width: "200px"
            }));

            this.oTable.addColumn(new Column({
                label: new Text({ text: "productionDate" }),
                template: new Text({ text: "{data>productionDate}" }),
                width: "150px"
            }));



            // Bind data to the table
            this.oTable.setModel(this.getView().getModel("data"), "data");
            this.oTable.bindRows("data>/batches");

            // Set Filter Bar and Table to the Value Help Dialog
            this.oValueHelpDialog.setFilterBar(oFilterBar);
            this.oValueHelpDialog.setTable(this.oTable);
            this.oValueHelpDialog.setContentWidth("800px");

            // Open the dialog if order data is available
            if (this.getView().getModel("data").getProperty("/batches")) {
                this.oValueHelpDialog.open();
            }
        },

        onSearch: function (oEvent) {
            var oFilterBar = oEvent.getSource(),
                aFilterGroupItems = oFilterBar.getFilterGroupItems(),
                aFilters = [];

            // Create filters based on selected input values
            aFilters = aFilterGroupItems.map(function (oFGI) {
                var oControl = oFGI.getControl();
                if (oControl && oControl.getValue) {
                    return new Filter({
                        path: oFGI.getName(),
                        operator: FilterOperator.Contains,
                        value1: oControl.getValue()
                    });
                }
            }).filter(Boolean); // Filter out empty values

            // Apply filters to the table binding
            this.oTable.getBinding("rows").filter(aFilters);
        },
        // Modified _populateBatchData function
        _onBatchNumberSelection: function (sSelectedBatch) {
            var oModel = this.getView().getModel("data");
            var aItems = oModel.getProperty("/batches") || [];

            // Find the selected batch data based on batch number
            var oSelectedBatchData = aItems.find(function (item) {
                return item.batchNumber === sSelectedBatch;
            });

            if (oSelectedBatchData) {
                // Update fields based on batch number selection
                this.byId("inputTarget15i").setValue(oSelectedBatchData.productionDate);
                this.byId("inputTarget195n").setValue(oSelectedBatchData.shelfLifeExpirationDate);
            }
        },

        
        onSubmit: function () {
            var sUrl = this.getPublicApiRestDataSourceUri() + '/pe/api/v1/process/processDefinitions/start?key=REG_925fdf75-b56d-4c23-a734-ed5d38b2b97e';

            var oView = this.getView(),
                oMaterialInput = oView.byId('inputOrder'),  // Material MultiInput field
                oBatchInput = oView.byId('inputbatch'),     // Batch MultiInput field
                sExpDateNew = oView.byId('myDatePicker').getValue(),
                sExpDateCurrent = oView.byId('inputTarget195n').getValue() || "", // Initialize with empty string

                sBatchNo; // Declare without initializing

            // Retrieve material and batchNumber tokens from VHD
            var aMaterialTokens = oMaterialInput.getTokens(),
                aBatchTokens = oBatchInput.getTokens();

            // Log tokens to debug
            console.log("Material Tokens:", aMaterialTokens);
            console.log("Batch Tokens:", aBatchTokens);

            // Validation: Ensure material is not empty
            if (aMaterialTokens.length === 0) {
                sap.m.MessageToast.show("Please enter a material.");
                return; // Prevent form submission
            }

            // Validate expiration dates
            if (!sExpDateCurrent) {
                sap.m.MessageToast.show("Please provide a valid current expiration date.");
                return; // Exit if no date is provided
            }

            // Create a JavaScript Date object and format it
            var oDate = new Date(sExpDateCurrent);
            var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({ pattern: "yyyy-MM-dd" });
            var sFormattedDate = oDateFormat.format(oDate);
            console.log("Formatted Expiration Date:", sFormattedDate);

            // Ensure batch number is retrieved properly
            if (aBatchTokens.length === 0) {
                sap.m.MessageToast.show("Please enter a batch number.");
                return; // Prevent form submission
            }
            sBatchNo = aBatchTokens[0].getKey(); // Get the key of the first selected batch token

            // Assuming you are selecting a single material
            var sMaterial = aMaterialTokens[0].getKey(); // Get the key of the first selected material token

            var oPayload = {
                plant: "M206",
                material: sMaterial,
                batch: sBatchNo,
                expiryCurr: sExpDateCurrent,
                expiryNew: sExpDateNew
            };

            this.ajaxPostRequest(sUrl, oPayload, function (oResponseData) {
                console.log('POST service success:', oPayload, oResponseData);
                sap.m.MessageToast.show("Data successfully submitted!");
                this._clearInputFields(); // Clear inputs after submission
            }.bind(this), function (oError, sHttpErrorMessage) {
                console.error('POST service error:', sHttpErrorMessage);

                // Check the status code and show an appropriate message
                if (oError.status === 500) {
                    sap.m.MessageBox.error("Internal Server Error: Please contact the administrator.");
                } else {
                    sap.m.MessageBox.error("Error: " + oError.responseText || sHttpErrorMessage);
                }
            }.bind(this));
        },

        // Function to clear input fields after successful submission
        _clearInputFields: function () {
            var oOrderInput = this.byId("inputOrder");
            if (oOrderInput && oOrderInput.removeAllTokens) {
                oOrderInput.removeAllTokens(); // Clear all tokens for MultiInput
            }

            var oBatchInput = this.byId("inputbatch");
            if (oBatchInput && oBatchInput.removeAllTokens) {
                oBatchInput.removeAllTokens(); // Clear all tokens for MultiInput
            }
            this.byId("inputTarget15i").setValue(""); // Clear additional fields as needed
            this.byId("inputTarget195n").setValue("");
            this.byId("myDatePicker").setValue(""); // Clear date picker


            // Clear any other fields or reset state as needed
        },

        onClearFilters: function () {
            var oOrderInput = this.byId("inputOrder");
            if (oOrderInput && oOrderInput.removeAllTokens) {
                oOrderInput.removeAllTokens();
            }

            var oBatchInput = this.byId("inputbatch");
            if (oBatchInput && oBatchInput.removeAllTokens) {
                oBatchInput.removeAllTokens();
            }
            this.byId("inputTarget15i").setValue("");
            this.byId("inputTarget195n").setValue("");
            this.byId("myDatePicker").setValue("");

        },

        // // Function to clear input fields after successful submission
        // _clearInputFields: function () {
        //     var oOrderInput = this.byId("inputOrder");
        //     if (oOrderInput && oOrderInput.removeAllTokens) {
        //         oOrderInput.removeAllTokens(); // Clear all tokens for MultiInput
        //     }

        //     this.byId("inputTarget15").setValue(""); // Clear material field
        //     this.byId("inputTarget195").setValue(""); // Clear batch number field
        //     this.byId("inputTarget15i").setValue(""); // Clear additional fields as needed
        //     this.byId("inputTarget195n").setValue("");
        //     this.byId("myDatePicker").setValue(""); // Clear date picker

        //     // Clear any other fields or reset state as needed
        // },




        onAfterRendering: function () {

            // this.getView().byId("backButton").setVisible(this.getConfiguration().backButtonVisible);
            // this.getView().byId("closeButton").setVisible(this.getConfiguration().closeButtonVisible);

            // this.getView().byId("headerTitle").setText(this.getConfiguration().title);
            // this.getView().byId("textPlugin").setText(this.getConfiguration().text); 
            // Use a timeout to delay the styling logic slightly, allowing the DOM to fully render

        },



        onBeforeRenderingPlugin: function () {



        },

        isSubscribingToNotifications: function () {

            var bNotificationsEnabled = true;

            return bNotificationsEnabled;
        },


        getCustomNotificationEvents: function (sTopic) {
            //return ["template"];
        },


        getNotificationMessageHandler: function (sTopic) {

            //if (sTopic === "template") {
            //    return this._handleNotificationMessage;
            //}
            return null;
        },

        _handleNotificationMessage: function (oMsg) {

            var sMessage = "Message not found in payload 'message' property";
            if (oMsg && oMsg.parameters && oMsg.parameters.length > 0) {
                for (var i = 0; i < oMsg.parameters.length; i++) {

                    switch (oMsg.parameters[i].name) {
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
