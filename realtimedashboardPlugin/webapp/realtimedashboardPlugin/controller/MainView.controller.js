sap.ui.define([
    'jquery.sap.global',
    "sap/dm/dme/podfoundation/controller/PluginViewController",
    "sap/ui/model/json/JSONModel",
    "sap/m/ColumnListItem",
    "sap/m/Column",
    "sap/m/Text",
    'sap/m/Label',
    "sap/m/SelectDialog",
    "sap/m/StandardListItem",
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator',
    'sap/ui/comp/smartvariants/PersonalizableInfo',
    "sap/ui/core/Fragment",
    "sap/ui/core/Control",
    "sap/m/MessageBox",
    "sap/m/LoadState",
    "sap/viz/ui5/format/ChartFormatter",
    "sap/viz/ui5/api/env/Format",
    "sap/m/Popover",
    "sap/m/VBox",
    "sap/m/Dialog"
], function (jQuery, PluginViewController, JSONModel, ColumnListItem, Column, Text, Label, SelectDialog, StandardListItem, Filter, FilterOperator, PersonalizableInfo, Fragment, Control, MessageBox, LoadState, ChartFormatter, Format, Popover, VBox, Dialog) {
    "use strict";

    return PluginViewController.extend("company.custom.plugins.realtimedashboardPlugin.realtimedashboardPlugin.controller.MainView", {
        onInit: function () {
            PluginViewController.prototype.onInit.apply(this, arguments);
            var oModel = new JSONModel();
            this.getView().setModel(oModel, "data");

            // Fetch data from API
            this._fetchData();
        },

        _fetchData: function () {
            var that = this;
            var sUrl = this.getPublicApiRestDataSourceUri() + '/resource/v2/resources';
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
            console.log("Data received:", oResponseData);
            var oModel = this.getView().getModel("data");
            oModel.setData(oResponseData);
            console.log("Data set in model:", oModel.getData());

            this._applyCardStyles();

            //Apply filter to the tile container
            var oHBox = this.getView().byId('tileContainer');
            var oFilter = new sap.ui.model.Filter({
                path: 'types',
                test: function(oValue){
                    return oValue.find(value=> value.type === 'PORTIONING' || value.type === 'FORMULATION');
                }
            });
            oHBox.getBinding("items").filter([oFilter]);
        },
        

            // onAfterRendering: function () {
            //     this._applyCardStyles();
            // },
            
            _applyCardStyles: function () {
                // var aCards = this.getView().byId("tileContainer").getItems();
                // console.log("Cards retrieved:", aCards); // Debugging line
                
                // if (aCards.length === 0) {
                //     console.warn("No cards found in the tileContainer.");
                //     return; // Exit if no cards are found
                // }
            
                // aCards.forEach(function (oCard) {
                //     var oContext = oCard.getBindingContext("data");
                //     if (oContext) {
                //         var sStatus = oContext.getProperty("status");
                //         // var oCardDomRef = oCard.getDomRef();  //Full card
                //         var oCardDomRef = oCard.getHeader().getDomRef(); //Card header only
                        
                //         if (oCardDomRef) {
                //             // Apply colors based on status
                //             if (sStatus === 'ENABLED') {
                //                 oCardDomRef.style.backgroundColor = '#4caf50'; // Light Cyan
                //             } else if (sStatus === 'PRODUCTIVE') {
                //                 oCardDomRef.style.backgroundColor = '#f44336'; // Light Coral
                //             }
                //         } else {
                //             console.warn("DOM reference for the card is null:", oCard);
                //         }
                //     }
                // });
            },
            

        onCardTitlePress: function (oEvent) {
            this.navigateToPage('CHARTPAGE');
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