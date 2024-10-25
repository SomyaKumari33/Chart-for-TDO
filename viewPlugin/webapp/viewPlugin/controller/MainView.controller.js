sap.ui.define([
    'jquery.sap.global',
	"sap/dm/dme/podfoundation/controller/PluginViewController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",               // Import the Filter class
    "sap/ui/model/FilterOperator"
	
], function (jQuery, PluginViewController, JSONModel, MessageBox, Filter, FilterOperator) {
	"use strict";

	return PluginViewController.extend("company.custom.plugins.viewPlugin.viewPlugin.controller.MainView", {
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
            // Get the filter bar control
            var oFilterBar = this.getView().byId("filterbar");
        
            if (oFilterBar) {
                // Iterate through all filter items and clear their values
                oFilterBar.getAllFilterItems(true).forEach(function (oItem) {
                    var oControl = oItem.getControl();
                    
                    // Clear MultiComboBox selected keys
                    if (oControl && oControl.setSelectedKeys) {
                        oControl.setSelectedKeys([]);  // Use an empty array to clear selections
                    }
                    
                    // Clear DateRangeSelection values
                    else if (oControl && oControl.setDateValue) {
                        oControl.setDateValue(null);
                        oControl.setSecondDateValue(null);
                    }
                });
            } else {
                console.error("Filter bar control not found!");
            }
        
            // Clear all filters applied to the table
            var oTable = this.getView().byId("table");
            var oBinding = oTable.getBinding("items");
            if (oBinding) {
                oBinding.filter([]);  // Remove all filters
            }
        },
        
        
      
        // onEdit: function () {
        //     var oView = this.getView();
        //     var oViewModel = oView.getModel("data");
        //     var bEditMode = oViewModel.getProperty("/editMode");
        
        //     var oTable = oView.byId("table");
        //     var aSelectedItems = oTable.getSelectedItems();
        
        //     if (aSelectedItems.length === 0) {
        //         MessageBox.error("No rows selected");
        //         return;
        //     }
        
        //     // Toggle edit mode
        //     oViewModel.setProperty("/editMode", !bEditMode);
        
        //     // Refresh the table binding to reflect changes
        //     oTable.getBinding("items").refresh();
        // },
        onEdit: function () {
            var oView = this.getView();
            var oViewModel = oView.getModel("data");
            var oTable = oView.byId("table");
            var aSelectedItems = oTable.getSelectedItems();
        
            if (aSelectedItems.length === 0) {
                MessageBox.error("No rows selected");
                return;
            }
        
            // Set editMode to false for all rows first
            var aItems = oViewModel.getProperty("/tabItems");
            aItems.forEach(function (item) {
                item.editMode = false;
            });
        
            // Get the path of the selected item and set its edit mode to true
            aSelectedItems.forEach(function (oItem) {
                var sPath = oItem.getBindingContext("data").getPath();
                oViewModel.setProperty(sPath + "/editMode", true);
            });
        
            // Refresh the table binding to reflect changes
            oViewModel.refresh();
        },
        
        onSave: function () {
            var oView = this.getView();
            var oModel = oView.getModel("data");
            var oTable = oView.byId("table");
            var aSelectedItems = oTable.getSelectedItems();
            
            if (aSelectedItems.length === 0) {
                MessageBox.error("No rows selected");
                return;
            }
        
            // Iterate through selected items and remove them from the model
            aSelectedItems.forEach(function (oItem) {
                var sPath = oItem.getBindingContext("data").getPath();
                var iIndex = parseInt(sPath.split("/").pop(), 10);
                
                // Get the current data
                var aData = oModel.getProperty("/tabItems");
                
                // Remove the item from the data array
                aData.splice(iIndex, 1);
                
                // Update the model with the modified data
                oModel.setProperty("/tabItems", aData);
            });
            
            // Set table back to non-editable mode
            oModel.setProperty("/editMode", false);
        
            // Refresh the table binding to reflect changes
            oTable.getBinding("items").refresh();
        },
        
        // onEdit: function () {
        //     var oModel = this.getView().getModel("data");
        //     oModel.setProperty("/editMode", true); // Set table to editable mode
        // },

        // onSave: function () {
        //     var oModel = this.getView().getModel("data");
        //     // Implement your save logic here to update data in the model
        //     oModel.setProperty("/editMode", false); // Set table back to non-editable mode
        // },
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