sap.ui.define([

    'jquery.sap.global',

    "sap/dm/dme/podfoundation/controller/PluginViewController",

    "sap/ui/model/json/JSONModel",

    "sap/ui/model/Filter",

    "sap/ui/model/FilterOperator",

    "sap/m/MessageBox",

    "sap/ui/comp/valuehelpdialog/ValueHelpDialog",

    "sap/m/MessageToast",

    "sap/ui/comp/filterbar/FilterBar",

    "sap/m/Input",   // Import the Input control

    "sap/m/Text",

    "sap/ui/table/Table",

    "sap/ui/table/Column"





], function (jQuery, PluginViewController, JSONModel, Filter, FilterOperator, MessageBox, ValueHelpDialog, MessageToast, FilterBar, Input, Text, Table, Column) {

    "use strict";



    return PluginViewController.extend("company.custom.plugins.stockrequestPlugin.stockrequestPlugin.controller.MainView", {

        onInit: function () {

            PluginViewController.prototype.onInit.apply(this, arguments);

            var oModel = new JSONModel();

            this.getView().setModel(oModel, "data");

            // this.getView().byId("RequestButton").setEnabled(false);





            // Fetch data from APIs

            this._fetchData();

            // this._updateRequestButtonState();



        },

     



        onSearch: function (oEvent) {

            var oFilterBar = oEvent.getSource(),

                aFilterGroupItems = oFilterBar.getFilterGroupItems(),

                aFiltersMaterials = [],

                aFiltersTabItems = [],

                oView = this.getView(),

                oValueHelpDialog = oView.byId("inputOrder");  // Replace with your ValueHelpDialog ID

       

            // Assuming you store selected items using tokens in the ValueHelpDialog

            var aSelectedTokens = oValueHelpDialog.getTokens();  // Fetch tokens (selected items)

           

            // Iterate over filter group items to create filters

            aFilterGroupItems.forEach(function (oFGI) {

                var oControl = oFGI.getControl();

                var sPath = oFGI.getName();

       

                if (oControl && aSelectedTokens.length > 0) {  // Handle ValueHelpDialog token selection

                    // For each selected token in ValueHelpDialog

                    var aItemFilters = aSelectedTokens.map(function (oToken) {

                        return new Filter({

                            path: sPath,

                            operator: FilterOperator.EQ,

                            value1: oToken.getKey()  // Assuming the token key is used for filtering

                        });

                    });

       

             

               // Determine which model the filter belongs to

                        if (sPath === "material" || sPath === "description" || sPath === "unit") {

                            aFiltersMaterials.push(new Filter({

                                filters: aItemFilters,

                                and: false  // OR condition between selected items

                            }));

                        } else {

                            aFiltersTabItems.push(new Filter({

                                filters: aItemFilters,

                                and: false

                            }));

                        }

                    }

                 else if (oControl && oControl.getSelectedItem) {  // Handle other controls like ComboBox

                    var oSelectedItem = oControl.getSelectedItem();

                    if (oSelectedItem) {

                        var oFilter = new Filter({

                            path: sPath,

                            operator: FilterOperator.EQ,

                            value1: oSelectedItem.getText()

                        });



                        // Determine which model the filter belongs to

                        if (sPath === "material" || sPath === "description" || sPath === "unit") {

                            aFiltersMaterials.push(oFilter);

                        } else {

                            aFiltersTabItems.push(oFilter);

                        }

                    }

                }

            });



     

       

            var oTable = this.getView().byId('table');

            var oItemsTemplate = this.getView().byId('idTableListItem');

       

          // Apply filters for the /materials model

            if (aFiltersMaterials.length > 0) {

                var oFiltersMaterials = new Filter({

                    filters: aFiltersMaterials,

                    and: true  // AND condition between different fields in /materials

                });



                // Bind the items with the filters applied for /materials

                oTable.bindItems({

                    path: '/materials',

                    model: 'data',

                    filters: oFiltersMaterials,

                    template: oItemsTemplate,

                    templateShareable: true

                });

            }



            // Apply filters for the /tabItems model

            if (aFiltersTabItems.length > 0) {

                var oFiltersTabItems = new Filter({

                    filters: aFiltersTabItems,

                    and: true  // AND condition between different fields in /tabItems

                });



                // Bind the items with the filters applied for /tabItems

                oTable.bindItems({

                    path: '/tabItems',

                    model: 'data',

                    filters: oFiltersTabItems,

                    template: oItemsTemplate,

                    templateShareable: true

                });

            }

        },



        onValueHelpRequest: function (oEvent) {

            var oInput = oEvent.getSource();
                // oModel = this.getView().getModel("data");



            // Destroy existing dialog if it exists

            if (this.oValueHelpDialog) {

                this.oValueHelpDialog.destroy();

            }



            // Create Value Help Dialog

            this.oValueHelpDialog = new ValueHelpDialog({

                title: "Select Materials",

                supportMultiselect: true, // Allow multiple selection

                key: 'material',

                ok: function (oEvent) {

                    var aSelectedItems = oEvent.getParameter("tokens");

                    if (aSelectedItems && aSelectedItems.length) {

                        var aSelectedOrders = aSelectedItems.map(function (token) {

                            return token.getKey(); // Get selected order keys

                        });

                        // Fetch the data for the selected orders

                        // this._populateMultipleOrderData(aSelectedOrders);

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

                search: this.onSearchVHD.bind(this),

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

                selectionMode: "MultiToggle" // Multiple selection mode

            });



            // Add columns to the table

            this.oTable.addColumn(new Column({

                label: new Text({ text: "Material" }),

                template: new Text({ text: "{data>material}" }),

                width: "200px"

            }));



            this.oTable.addColumn(new Column({

                label: new Text({ text: "Description" }),

                template: new Text({ text: "{data>description}" }),

                width: "250px"

            }));



            this.oTable.addColumn(new Column({

                label: new Text({ text: "Version" }),

                template: new Text({ text: "{data>version}" }),

                width: "150px"

            }));







            // Bind data to the table

            this.oTable.setModel(this.getView().getModel("data"), "data");

            this.oTable.bindRows("data>/materials");



            // Set Filter Bar and Table to the Value Help Dialog

            this.oValueHelpDialog.setFilterBar(oFilterBar);

            this.oValueHelpDialog.setTable(this.oTable);

            this.oValueHelpDialog.setContentWidth("700px");



            // Open the dialog if order data is available

            // if (this.getView().getModel("data").getProperty("/materials")) {

                this.oValueHelpDialog.open();

            // }

        },
        onSearchVHD: function (oEvent) {
            var oFilterBar = oEvent.getSource(),
                aFilterGroupItems = oFilterBar.getFilterGroupItems(),
                aFiltersMaterials = [],
                oView = this.getView(),
                oTable = oView.byId("orderTable"), // The ID of the table in VHD
                sSearchText = ""; // Variable to hold the search text
        
            // Iterate over filter group items to create filters
            aFilterGroupItems.forEach(function (oFGI) {
                var oControl = oFGI.getControl();
        
                if (oControl instanceof sap.m.Input) {
                    sSearchText = oControl.getValue(); // Get the value from the input field
                }
            });
        
            // Create filter based on the search text
            if (sSearchText) {
                var oFilter = new sap.ui.model.Filter("material", sap.ui.model.FilterOperator.Contains, sSearchText);
                aFiltersMaterials.push(oFilter);
            }
        
            // Apply filters to the table in the VHD
            var oBinding = oTable.getBinding("rows");
            if (oBinding) {
                oBinding.filter(aFiltersMaterials); // Apply the filter for the material column
            }
        },
        



        _fetchData: function () {

            var that = this;

            var oParameters = {

                plant: 'M206',

                page: '1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30',

                size: '1000'

            };



            // Fetch data from Material API

            var sMaterialUrl = this.getPublicApiRestDataSourceUri() + '/material/v2/materials';

            this.ajaxGetRequest(sMaterialUrl, oParameters, function (oMaterialResponseData) {

                that.setMaterialData(oMaterialResponseData); // Only set materials here



                // Now fetch data from Inventory API

                var sInventoryUrl = that.getPublicApiRestDataSourceUri() + '/inventory/v1/storageLocations';

                that.ajaxGetRequest(sInventoryUrl, oParameters, function (oInventoryResponseData) {

                    that.combineData(oMaterialResponseData, oInventoryResponseData);

                }, function (oError, sHttpErrorMessage) {

                    that.handleErrorMessage(oError, sHttpErrorMessage);

                });

            }, function (oError, sHttpErrorMessage) {

                that.handleErrorMessage(oError, sHttpErrorMessage);

            });

        },



        setMaterialData: function (oMaterialResponseData) {

            var materialData = oMaterialResponseData.content.map(function (material) {

                return {

                    material: material.material, // Only include material for the MultiComboBox

                    description: material.description,

                    unitOfMeasure: material.unitOfMeasure // Only include material for the MultiComboBox





                };

            });



            var oModel = this.getView().getModel("data");

            oModel.setProperty("/materials", materialData);

            console.log(materialData);

        },



        combineData: function (oMaterialResponseData, oInventoryResponseData) {

            var combinedData = [];



            oMaterialResponseData.content.forEach(function (material) {

                var matchingStorageLocations = oInventoryResponseData.content.filter(function (location) {

                    return location.plant === material.plant;

                });



                // Create a separate entry for each storage location

                matchingStorageLocations.forEach(function (location) {

                    var item = {

                        // material: material.material,

                        // description: material.description,

                        // unitOfMeasure: material.unitOfMeasure,

                        issueStorageLocation: location.storageLocation,

                        receiveStorageLocation: location.storageLocation

                    };

                    combinedData.push(item);

                });

            });



            var oModel = this.getView().getModel("data");

            oModel.setProperty("/tabItems", combinedData);

            console.log(combinedData);

        },

        handleErrorMessage: function (oError, sHttpErrorMessage) {

            var err = oError || sHttpErrorMessage;

            this.showErrorMessage(err, true, true);

        },


        onDeleteRows: function() {
            var oTable = this.oTable;
            var aSelectedIndices = oTable.getSelectedIndices();
            if(aSelectedIndices.length > 0) {
                //Remove the seleced rows
                for(var i = aSelectedIndices.length - 1; i >=0; i--) {
                    var iIndex = aSelectedIndices[i];
                    oTable.getModel("data").getData().materials.splice(iIndex, 1);
                }
                oTable.getModel("data").refresh(true);
                
            }
        },










        // onClearFilters: function () {

        //     var oFilterBar = this.getView().byId("filterbar");



        //     // Clear all selections in the FilterBar

        //     oFilterBar.getFilterGroupItems().forEach(function (oFGI) {

        //         var oControl = oFGI.getControl();

        //         if (oControl && oControl.getTokens) {  // Handle Multitoggle of valueHelpDialog

        //             oControl.setSelectedItems([]);

        //         } else if (oControl && oControl.setSelectedKey) { // Handle other controls like ComboBox

        //             oControl.setSelectedKey("");

        //         }

        //     });

        // },
        onClearFilters: function () {
            var oFilterBar = this.getView().byId("filterbar");
            var oValueHelpDialog = this.getView().byId("inputOrder"); // Your VHD ID
        
            // Clear all selections in the FilterBar
            oFilterBar.getFilterGroupItems().forEach(function (oFGI) {
                var oControl = oFGI.getControl();
                if (oControl && oControl.getTokens) {  // Handle token-based controls
                    oControl.setTokens([]); // Clear tokens for VHD
                } else if (oControl && oControl.setSelectedKey) { // Handle other controls like ComboBox
                    oControl.setSelectedKey("");
                }
            });
        
            // Clear the selected tokens in the Value Help Dialog
            if (oValueHelpDialog && oValueHelpDialog.getTokens) {
                oValueHelpDialog.setTokens([]); // Clear tokens in the VHD
            }
        },
        



        // onDeleteRows: function(oEvent){

        //     var oTable = this.getView().byId("table");

        //     var aSelectedItems = oTable.getSelectedItems();

        //     aSelectedItems.forEach(function(oItem) {

        //         oTable.removeItem(oItem);

        //     });

        // },



        onSubmit: function () {

            var oTable = this.getView().byId("table");

            var aSelectedItems = oTable.getSelectedItems();



            if (aSelectedItems.length === 0) {

                MessageBox.warning("Please select at least one row.");

                return;

            }



            var sUrl = this.getPublicApiRestDataSourceUri() + '/pe/api/v1/process/processDefinitions/start?key=REG_641eeae5-3c79-437c-b261-bac828001293';



            var aValidItems = [];

            var bValidationError = false;

            var aErrorMessages = [];



            // Flags to track error types

            var bQtyError = false;

            var bLocationError = false;

            var bSameLocationError = false;



            // Iterate through selected items to validate them

            aSelectedItems.forEach(function (oItem) {

                var oContext = oItem.getBindingContext("data");



                if (!oContext) {

                    aErrorMessages.push("Context not found for selected item.");

                    bValidationError = true;

                    return;

                }



                // Get values from the input fields

                var sIssueSloc = oItem.getCells()[3].getValue();

                var sRecSloc = oItem.getCells()[4].getValue();

                var sReqQuantity = oItem.getCells()[2].getValue();



                // Check for required quantity

                if (!sReqQuantity && !bQtyError) {

                    aErrorMessages.push("Please ensure Required Quantity is filled for all selected rows.");

                    bValidationError = true;

                    bQtyError = true; // Set flag to avoid duplicate messages

                }



                // Check for empty storage locations

                if ((!sIssueSloc || !sRecSloc) && !bLocationError) {

                    aErrorMessages.push("Please ensure both Issue and Receive Storage Locations are filled for all selected rows.");

                    bValidationError = true;

                    bLocationError = true;

                }



                // Check if issue and receive storage locations are the same

                if (sIssueSloc === sRecSloc && !bSameLocationError) {

                    aErrorMessages.push("Issue and Receive Storage Locations must not be the same for all selected rows.");

                    bValidationError = true;

                    bSameLocationError = true;

                }



                // If validation is successful, add item to valid list

                if (!bValidationError) {

                    aValidItems.push({

                        // "material": oContext.getProperty("material"),

                        // "reqQty": sReqQuantity,

                        // "unit": oContext.getProperty("unitOfMeasure"),

                        // "issuePlant": "M206",

                        // "issueSloc": sIssueSloc,

                        // "receivingPlant": "M206",

                        // "receivingSloc": sRecSloc
                        
                        "plant": "M206",
                        "stocklist": JSON.stringify([
                            {
                                "material": oContext.getProperty("material"),
                                "reqQty": sReqQuantity,
                                "unit": oContext.getProperty("unitOfMeasure"),
                                "issueSloc": sIssueSloc,
                                "receivingSloc": sRecSloc
                            },
                            {
                                "material": oContext.getProperty("material"),
                                "reqQty": sReqQuantity,
                                "unit": oContext.getProperty("unitOfMeasure"),
                                "issueSloc": sIssueSloc,
                                "receivingSloc": sRecSloc
                            }
                        ])
                    
                
                    });

                }

            });



            // If validation errors exist, show all messages at once

            if (bValidationError) {

                MessageBox.error(aErrorMessages.join("\n"));

                return;

            }



            // Only proceed if no validation errors

            var aPostPromises = aValidItems.map(function (oJsonPayload) {

                return new Promise(function (resolve, reject) {

                    this.ajaxPostRequest(sUrl, oJsonPayload, function (oResponseData) {

                        console.log('POST service success', oJsonPayload, oResponseData);

                        resolve(oResponseData);

                    }, function (oError, sHttpErrorMessage) {

                        // Check the status code and show an appropriate message

                        if (oError.status === 500) {

                            sap.m.MessageBox.error("Internal Server Error: Please contact the administrator.");

                        } else {

                            sap.m.MessageBox.error("Error: " + (oError.responseText || sHttpErrorMessage));

                        }

                        reject(oError);

                    }.bind(this));

                }.bind(this));

            }.bind(this));



            // After all POST requests are completed

            Promise.all(aPostPromises)

                .then(function (aResponses) {

                    // Here, aResponses can be processed as needed

                    aResponses.forEach(function (response) {

                        console.log('Response from server:', response);

                        // Optionally, you can display each response in a message box or handle accordingly

                    });

                    MessageBox.success("All requests have been successfully submitted.");

                    // Optionally clear the input fields or reset state here

                })

                .catch(function (sHttpErrorMessage) {

                    MessageBox.error("An error occurred during submission: " + sHttpErrorMessage);

                });

        },



        onAfterRendering: function () {



            // this.getView().byId("backButton").setVisible(this.getConfiguration().backButtonVisible);

            // this.getView().byId("closeButton").setVisible(this.getConfiguration().closeButtonVisible);



            // this.getView().byId("headerTitle").setText(this.getConfiguration().title);

            // this.getView().byId("textPlugin").setText(this.getConfiguration().text);



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