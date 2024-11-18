sap.ui.define([
    'jquery.sap.global',
	"sap/dm/dme/podfoundation/controller/PluginViewController",
	"sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
     "sap/viz/ui5/data/FlattenedDataset",
    "sap/viz/ui5/controls/common/feeds/FeedItem",
    "sap/viz/ui5/format/ChartFormatter"

], function (jQuery, PluginViewController, JSONModel, MessageToast, FlattenedDataset, FeedItem, ChartFormatter) {
	"use strict";

	return PluginViewController.extend("company.custom.plugins.vizPlugin.vizPlugin.controller.MainView", {
		onInit: function () {
      // Call the base controller's onInit
      PluginViewController.prototype.onInit.apply(this, arguments);
  
      // Initialize an empty model and set it to the view
      var oModel = new JSONModel();
      this.getView().setModel(oModel, "data");
  
      // Initialize the chart and fetch data
      this._initChart();
      this._fetchConsumptionData();
  },
  
  _fetchConsumptionData: function () {
      var sUrl = 'https://dbapicall.cfapps.eu20-001.hana.ondemand.com/api/get/consumptionData';
      var oPayload = { plant: "M206" };
  
      // Perform AJAX POST request
      $.ajax({
          url: sUrl,
          type: "POST",
          contentType: "application/json",
          data: JSON.stringify(oPayload),
          success: function (oResponseData) {
              // Log the response to debug its structure
              console.log(oResponseData);
  
              // Update the "data" model with the fetched data
              var oModel = this.getView().getModel("data");
              oModel.setData({ data: oResponseData });
  
              // Update the chart with the new data
              this._updateChart();
              sap.m.MessageToast.show("Data successfully fetched and bound to the chart!");
          }.bind(this),
          error: function (oError) {
              console.error("Error in API call:", oError);
              sap.m.MessageBox.error("Failed to fetch data from the server. Please try again.");
          }
      });
  },
  

_initChart: function () {
    var oVizFrame = this.getView().byId("idVizFrame");

    oVizFrame.destroyDataset();
    oVizFrame.destroyFeeds();

    oVizFrame.setVizProperties({
        plotArea: {
            dataLabel: { visible: true }
        },
        title: { visible: false },
        legend: { visible: true }
    });
},

_updateChart: function () {
    var oView = this.getView(),
    oModel = this.getOwnerComponent().getModel(),
    oVizFrame = oView.byId("idVizFrame");

  oVizFrame.destroyDataset();
  oVizFrame.destroyFeeds();

  oVizFrame.setModel(oModel);

  //Set VizFrame data set
  var oDataSet = {
    dimensions: [
      {
        name: "Date",
        value: "{data>CONSUMPTION_DATE}",
        dataType: "date"
      }
    ],
    measures: [
      {
        name: "Actual",
        value: "{data>QUANTITY}"
      },
      {
        name: "TargetUpper",
        value: "{data>UPPER_TOLERANCE}"
      }
    ],
    data: {
      path: "data>/data"
    }
  };
  var oDataset = new FlattenedDataset(oDataSet);
  oVizFrame.setDataset(oDataset);
  console.log("oDataset", oDataset);

  //Set VizFrame properties
  var oVizProperties = {
    plotArea: {
      window: {
        start: "firstDataPoint",
        end: "lastDataPoint"
      },
      dataLabel: {
        formatString: ChartFormatter.DefaultPattern.SHORTFLOAT_MFD2,
        visible: false
      }
    },
    valueAxis: {
      visible: true,
      title: {
        visible: false
      }
    },
    valueAxis2: {
      visible: true,
      label: {
        formatString: ChartFormatter.DefaultPattern.SHORTFLOAT
      },
      title: {
        visible: false
      }
    },
    timeAxis: {
      title: {
        visible: false
      },
      interval: {
        unit: ""
      },
      levels: ["second"]
    },
    title: {
      visible: false
    },
    interaction: {
      syncValueAxis: false
    }
  };
  oVizFrame.setVizProperties(oVizProperties);

  //Set data feeds for vizframe
  var feedActualValues = new FeedItem({
    uid: "actualValues",
    type: "Measure",
    values: ["Actual"]
  });

  var feedTargetValues = new FeedItem({
    uid: "targetValues",
    type: "Measure",
    values: ["TargetUpper"]
  });

  var feedTimeAxis = new FeedItem({
    uid: "timeAxis",
    type: "Dimension",
    values: ["Date"]
  });

  var feedValueAxis;

  oVizFrame.addFeed(feedActualValues);
  oVizFrame.addFeed(feedTargetValues);
  oVizFrame.addFeed(feedTimeAxis);
  oVizFrame.addFeed(feedValueAxis);

  var oPopOver = this.getView().byId("idPopOver");
  oPopOver.connect(oVizFrame.getVizUid());
  oPopOver.setFormatString({
    Date: "dd/MM/yyyy hh:mm:ss"
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