sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "lrlpapp/utils/BoldTextFormatter",
  ],
  function (Controller, JSONModel) {
    "use strict";

    return Controller.extend("lrlpapp.controller.laporan.Cashflow", {
      onInit: function () {
        var oData = {
          Title: "Cashflow Report Year 2023",
          CashFlow: [
            {
              "Account Description": "Bank balance brought forward",
              Value: "Rp 5.000.000",
              IsBold: true,
            },
            {
              "Account Description": "Add : Cash Inflows",
              Value: null,
              IsBold: true,
            },
            {
              "Account Description": "Citiwalk Rent Revenue",
              Value: "Rp 1.000.000",
              IsBold: false,
            },
            {
              "Account Description": "Transferred from SIBO",
              Value: "Rp 500.000",
              IsBold: false,
            },
            {
              "Account Description":
                "Incoming Payment of Accounts Receivable Intercompany",
              Value: "Rp 1.500.000",
              IsBold: false,
            },
            {
              "Account Description": "Parking Income",
              Value: "Rp 750.000",
              IsBold: false,
            },
            {
              "Account Description": "Bank's Interest Income",
              Value: "Rp 6.000.000",
              IsBold: "false",
            },
            {
              "Account Description": "Total Cash Inflows",
              Value: "Rp 4.750.000",
              IsBold: true,
            },
            {
              "Account Description": "Less: Cash Outflows",
              Value: null,
              IsBold: true,
            },
            {
              "Account Description":
                "Outgoing Payment to AP Vendor Third Party",
              Value: "Rp 200.000",
              IsBold: false,
            },
            {
              "Account Description": "Outgoing Payment to AP Related Party",
              Value: "Rp 660.000",
              IsBold: false,
            },
            {
              "Account Description": "Outgoing Payment to Share Holder Payable",
              Value: "Rp 1.300.000",
              IsBold: false,
            },
            {
              "Account Description": "Owner Expense",
              Value: "Rp 300.000",
              IsBold: false,
            },
            {
              "Account Description": "Tax Payment",
              Value: "Rp 220.000",
              IsBold: false,
            },
            {
              "Account Description": "Utilities",
              Value: "Rp 350.000",
              IsBold: false,
            },
            {
              "Account Description": "Bank Administration",
              Value: "Rp 300.000",
              IsBold: false,
            },
            {
              "Account Description": "Total Cash Outflows",
              Value: "Rp 4.000.000",
              IsBold: true,
            },
            {
              "Account Description": "Surplus/Deficit",
              Value: "Rp 2.000.000",
              IsBold: true,
            },
          ],
        };

        var oModel = new JSONModel(oData);
        this.getView().setModel(oModel, "cashFlowModel");
      },
      onAfterRendering: function () {
        // var oTable = this.getView().byId("cashFlowTable");
        // var aItems = oTable.getItems();
        // aItems.forEach(function (oItem) {
        //   var oCells = oItem.getCells();
        //   if (oCells[0].getText().includes("Add : Cash Inflows")) {
        //     oCells[0].addStyleClass("BoldText"); // Apply the custom CSS class
        //     oCells[1].addStyleClass("BoldText"); // Apply the custom CSS class
        //   }
        // });
      },
      onClickNext: function (oEvent) {
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("cashflow2");
      },

      // Custom formatter for row styling
      BoldRowFormatter: function (isBold) {
        if (isBold) {
          this.getView().addStyleClass("BoldText");
        }
      },


      onClickBack: function (oEvent) {
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("cashflow");
      },
    });
  }
);
