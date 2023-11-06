sap.ui.define(
  [
    "lrlpapp/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "lrlpapp/utils/BoldTextFormatter",
  ],
  function (BaseController, JSONModel, BoldTextFormatter) {
    "use strict";

    return BaseController.extend("lrlpapp.controller.laporan.Cashflow", {
      onAfterRendering: async function () {
        const cashflowData = await this.RequestReadWithFilter(
          "/cashflowSet",
          `CompanyCode eq 'LRLP'and PeriodeFrom eq '01'and PeriodeTo eq '12'and Year eq '2023'`
        );

        const cashflowPropsName = Object.keys(cashflowData.results[0]);
        const cashflowValue = Object.values(cashflowData.results[0]);
        const cashflow = [];
		let bankBalance = null;
		let totalIn = null;
		let totalOut = null;

        cashflowPropsName.forEach((el, i) => {
          if (
            el !== "__metadata" &&
            el !== "CompanyCode" &&
            el !== "PeriodeFrom" &&
            el !== "PeriodeTo" &&
            el !== "Year"
          ) {
            // cash in flows key
            if (el == "CfInBankBalance") {
              el = "Bank Balance brought forward";
			  bankBalance = Number(cashflowValue[i]);
            }
            if (el == "CfInCitiwalkRentRevenue") {
              el = "Citiwalk Rent Payment";
            }
            if (el == "CfInTransferredFromSibo") {
              el = "Transferred from SIBO";
            }
            if (el == "CfInIncomingPayment") {
              el = "Incoming Payment of Accounts Receivable Intercompany";
            }
			if (el == "CfInParkingIncome") {
				el = "Profit Sharing Parking";
			  }
            if (el == "CfInBankInterest") {
              el = "Bank's Interest";
            }
            if (el == "TotalCashin") {
              el = "Total Cash Inflows";
			  totalIn = Number(cashflowValue[i]);
            }
            // cashout flows key
            if (el == "CfOutThirdParty") {
              el = "Payment to Third Party Vendors";
            }
            if (el == "CfOutRelatedParty") {
              el = "Payment to Intercompanies";
            }
            if (el == "CfOutShareHolder") {
              el = "Payment to Share Holder";
            }
            if (el == "CfOutOwnerExpense") {
              el = "Owner Expense";
            }
            if (el == "CfOutTaxPayment") {
              el = "Tax Payment";
            }
            if (el == "CfOutUtilities") {
              el = "Utilities";
            }
            if (el == "CfOutBankAdmin") {
              el = "Bank Administration";
            }
            if (el == "TotalCashout") {
              el = "Total Cash Outflows";
			  totalOut = Number(cashflowValue[i]);
            }

            cashflow.push({
              account: el,
              value: Number(cashflowValue[i]).toLocaleString("id-ID", {
                style: "currency",
                currency: "IDR",
              }),
            });
          }
        });
		//Add surplus/deficit
		let surplusDeficit = bankBalance + totalIn - totalOut;

		cashflow.push({
			account: "Surplus/Deficit",
			value: surplusDeficit.toLocaleString("id-ID", {
			  style: "currency",
			  currency: "IDR",
			}),
		  });

		console.log(surplusDeficit)
		console.log(cashflow)

        const oModel = new JSONModel({ cashflow: cashflow });
        this.getView().setModel(oModel, "cashFlowModel");
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
