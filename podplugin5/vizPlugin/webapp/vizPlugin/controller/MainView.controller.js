sap.ui.define([
    'jquery.sap.global',
	"sap/dm/dme/podfoundation/controller/PluginViewController",
	"sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
      "sap/viz/ui5/format/ChartFormatter",
    "sap/viz/ui5/api/env/Format"

], function (jQuery, PluginViewController, JSONModel, MessageToast, ChartFormatter, Format) {
	"use strict";

	return PluginViewController.extend("company.custom.plugins.vizPlugin.vizPlugin.controller.MainView", {
		onInit: function () {
			PluginViewController.prototype.onInit.apply(this, arguments);
            var oData = {
                chartData: [
                    { category: "Category 1", target: 150, red: 150, green: 0 },
                    { category: "Category 2", target: 220, red: 0, green: 220 },
                    { category: "Category 3", target: 180, red: 180, green: 0 },
                    { category: "Category 4", target: 240, red: 0, green: 240 },
                    { category: "Category 5", target: 130, red: 130, green: 0 }
                ]
            };
        
            var oModel = new sap.ui.model.json.JSONModel(oData);
            this.getView().setModel(oModel);
        
            var oVizFrame = this.byId("idVizFrame");
            
            oVizFrame.setVizProperties({
                plotArea: {
                    colorPalette: ["red", "green"], // Set colors for red and green
                    dataLabel: {
                        visible: true
                    }
                },
                title: {
                    text: "Red & Green Columns Based on Target"
                }
            });
        },
		onback: function(oEvent){
            this.navigateToMainPage();
 
        },
        onBackButtonPress:function(oEvent){
            this.navigateToMainPage();
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