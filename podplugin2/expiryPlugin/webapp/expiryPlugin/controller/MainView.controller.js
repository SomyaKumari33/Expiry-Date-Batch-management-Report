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
                size: '500'
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
        // Function to handle material selection and fetch batch data based on the selected material
onMaterialSelection: function (sSelectedMaterial) {
    // Fetch batch data based on the selected material
    this._fetchBatchData(sSelectedMaterial);
},

_fetchBatchData: function (sMaterial) {
    var that = this;
    var oBatchParams = { plant: 'M206', material: sMaterial };
    var sBatchUrl = this.getPublicApiRestDataSourceUri() + '/inventory/v1/batches';

    // Fetch data from the Batch API
    this.ajaxGetRequest(sBatchUrl, oBatchParams, function (oBatchResponseData) {
        if (oBatchResponseData && oBatchResponseData.content) {
            that.setBatchData(oBatchResponseData);
            console.log("Batch data loaded successfully:", oBatchResponseData.content);
        } else {
            console.log("No batch data received:", oBatchResponseData);
        }
    }, function (oError, sHttpErrorMessage) {
        that.handleErrorMessage(oError, sHttpErrorMessage);
    });
},
        // Set Batch Data

        setBatchData: function (oBatchResponseData) {
            var aBatchData = oBatchResponseData.content.map(function (batch) {
                return {
                    batchNumber: batch.batchNumber,
                    productionDate: this.formatDate(batch.productionDate),
                    shelfLifeExpirationDate: batch.shelfLifeExpirationDate ? this.formatDate(batch.shelfLifeExpirationDate) : "N/A",
                };
            }, this); // Pass 'this' to maintain context

            // Update the model with the batch data for binding
            var oModel = this.getView().getModel("data");
            oModel.setProperty("/batches", aBatchData); // Assuming you have a path for batches
        

         
        
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
                        // this._populateSingleOrderData(sSelectedOrder);
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
                width: "150px"
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
            this.oValueHelpDialog.setContentWidth("800px");

            // Open the dialog if order data is available
            if (this.getView().getModel("data").getProperty("/orders")) {
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

        onValueHelpRequestbatch: function (oEvent) {
            var oInput = oEvent.getSource();
        
            // Destroy existing dialog if present
            if (this.oValueHelpDialog) {
                this.oValueHelpDialog.destroy();
            }
        
            // Create Value Help Dialog for single selection
            this.oValueHelpDialog = new sap.ui.comp.valuehelpdialog.ValueHelpDialog({
                title: "Select Batch Number",
                supportMultiselect: false,
                key: 'batchNumber',
                ok: function (oEvent) {
                    var aSelectedItems = oEvent.getParameter("tokens");
                    if (aSelectedItems && aSelectedItems.length) {
                        var sSelectedBatch = aSelectedItems[0].getKey();
                        this._onBatchNumberSelection(sSelectedBatch);  // Correct function call
                        oInput.setValue(sSelectedBatch);  // Set selected batch to input field
                    }
                    this.oValueHelpDialog.close();
                }.bind(this),
                cancel: function () {
                    this.oValueHelpDialog.close();
                }.bind(this)
            });
        
            // Create Filter Bar
            var oFilterBar = new sap.ui.comp.filterbar.FilterBar({
                advancedMode: false,
                search: this.onSearch.bind(this),
                filterGroupItems: [
                    new sap.ui.comp.filterbar.FilterGroupItem({
                        groupName: "group1",
                        name: "batchNumber",
                        label: "Batch Number",
                        control: new sap.m.Input({
                            placeholder: "Search for batchNumber..."
                        })
                    })
                ]
            });
        
            // Create the table for displaying batches
            this.oTable = new sap.ui.table.Table(this.createId("orderTable"), {
                visibleRowCount: 4,
                selectionMode: "Single" // Set to single selection
            });
        
            // Add columns to the table
            this.oTable.addColumn(new sap.ui.table.Column({
                label: new sap.m.Text({ text: "Batch Number" }),
                template: new sap.m.Text({ text: "{data>batchNumber}" }),
                width: "150px"
            }));
        
            this.oTable.addColumn(new sap.ui.table.Column({
                label: new sap.m.Text({ text: "Shelf Life Expiration Date" }),
                template: new sap.m.Text({ text: "{data>shelfLifeExpirationDate}" }),
                width: "200px"
            }));
        
            this.oTable.addColumn(new sap.ui.table.Column({
                label: new sap.m.Text({ text: "Production Date" }),
                template: new sap.m.Text({ text: "{data>productionDate}" }),
                width: "150px"
            }));
        
            // Bind data to the table
            this.oTable.setModel(this.getView().getModel("data"), "data");
            this.oTable.bindRows("data>/batches");
        
            // Set Filter Bar and Table to the Value Help Dialog
            this.oValueHelpDialog.setFilterBar(oFilterBar);
            this.oValueHelpDialog.setTable(this.oTable);
            this.oValueHelpDialog.setContentWidth("800px");
        
            // Check if batch data is available and open the dialog
            var aBatchData = this.getView().getModel("data").getProperty("/batches");
            console.log("Batch data on dialog open:", aBatchData);
            if (aBatchData && aBatchData.length) {
                this.oValueHelpDialog.open();
            } else {
                sap.m.MessageToast.show("No batch data available for the selected material");
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

        // onSubmit: function() {
        //     var sUrl = this.getPublicApiRestDataSourceUri() + 'https://dm-integration-test-e2xcyaot.it-cpi023-rt.cfapps.eu20-001.hana.ondemand.com/http/batchexpirydate';
        onSubmit: function () {
            var sUrl = this.getPublicApiRestDataSourceUri() + '/pe/api/v1/process/processDefinitions/start?key=REG_925fdf75-b56d-4c23-a734-ed5d38b2b97e';

            var oView = this.getView(),
                oMaterialInput = oView.byId('inputOrder'),  // Assuming this is the ID of the material MultiInput field
                oBatchInput = oView.byId('inputbatch'),    // Assuming this is the ID of the batch MultiInput field
                sExpDateNew = oView.byId('myDatePicker').getValue();
            sBatchNo = oView.byId('inputbatch').getValue()    // Assuming this is the ID of the batch MultiInput field


            // Retrieve material and batchNumber tokens from VHD
            var aMaterialTokens = oMaterialInput.getTokens(),
                aBatchTokens = oBatchInput.getTokens();

            // Log tokens to debug
            console.log("Material Tokens:", aMaterialTokens);
            console.log("Batch Tokens:", aBatchTokens);

            // Validation: Ensure material and batch number are not empty
            if (aMaterialTokens.length === 0) {
                sap.m.MessageToast.show("Please enter a material.");
                return; // Prevent form submission
            }
            // if (!sBatchNo) {
            //     sap.m.MessageToast.show("Please enter a batch number.");
            //     return; // Prevent form submission
            // }

            // if (aBatchTokens.length === 0) {
            //     sap.m.MessageToast.show("Please enter a batch number.");
            //     return; // Prevent form submission
            // }

            // Assuming you are selecting a single material and batch number
            var sMaterial = aMaterialTokens[0].getKey(),  // Get the key of the first selected material token
                sBatchNo = aBatchTokens[0].getKey();      // Get the key of the first selected batch token

            var oPayload = {
                plant: "M206",
                material: sMaterial,
                batch: sBatchNo,
                expiryCurr: "",
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
