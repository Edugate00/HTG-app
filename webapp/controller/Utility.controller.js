sap.ui.define(
  [
    "lrlpapp/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/ui/core/HTML",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
  ],
  function (BaseController, JSONModel, Fragment, Dialog, Button, HTML, Filter, FilterOperator) {
    "use strict";

    const widthWindow = window.screen.width;
    const oBilling = JSON.parse(sessionStorage.getItem("BILLING_ZUTL"));

    return BaseController.extend("lrlpapp.controller.Utility", 
    {
      onInit: function () {

        //Read oData for setting tagihan utilities List

        console.log(oBilling);
        this.getView().setModel(
          new JSONModel({ utilityList: oBilling }),
          "utilities"
        );

        //Create tenant List
        const tenant = oBilling.map(el => el.CustomerDesc);
          
          const listTenant = tenant.filter((el, index) => tenant.indexOf(el) === index);
          const fixTenant = listTenant.map((CustomerDesc) => ({
            name: CustomerDesc,
            id: CustomerDesc
          }));

          let defaultItem = {name: 'Semua Tenant', id: '*'};
          fixTenant.push(defaultItem);
          
          this.getView().setModel(
            new JSONModel({ tenantList: fixTenant }),
            "Tenant"
          );

        //Tiles Event
        const tilePemakaianListrik = this.getView().byId(
          "tilePemakaianListrik"
        );
        const tilePindaiMeteran = this.getView().byId("tilePindaiMeteran");
        const tileAirBulanan = this.getView().byId("tileAirBulanan");
        const tileTagihanAir = this.getView().byId("tileTagihanAir");

        tilePemakaianListrik.attachBrowserEvent(
          "click",
          this._onPemakaianListrik,
          this
        );
        tilePindaiMeteran.attachBrowserEvent(
          "click",
          this._onPindaiMeteran,
          this
        );
        tileAirBulanan.attachBrowserEvent("click", this._onReportAir, this);
        tileTagihanAir.attachBrowserEvent(
          "click",
          this._onTagihanAirClick,
          this
        );
      },
      _onPemakaianListrik: function (oEvent) {
        console.log("Pemakaian Listrik");
      },
      _onPindaiMeteran: function (oEvent) {
        this.getRouter().navTo("meteran");
      },
      _onReportAir: function (oEvent) {
        this.getRouter().navTo("reportair");
      },
      

      _onTagihanAirClick: function (oEvent) {
        console.log("Perhitungan Tagihan Air");
        const oView = this.getView();

        var oHtml2 = new sap.ui.core.HTML({
          content:
            '<iframe src="https://lrna.edugate.web.id:8080/sap/bc/se/m/index.html?~transaction=ZAIR&sap-personas-flavor=D0374502C7081EDDAB89ADB78698441C&sap-se-hide-splashscreen=X&sap-client=116&sap-language=EN&sap-accessibility=X" width="100%" height="450px"></iframe>',
        });

        let width = null;
        console.log(widthWindow);

        if (widthWindow < 576 || widthWindow > 1400) {
          width = "100%";
        } else {
          width = "70%";
        }

        if (!this.oFixedSizeDialog) {
          this.oFixedSizeDialog = new Dialog({
            title: "Perhitungan Tagihan Air",
            contentWidth: width,
            contentHeight: "450px",
            content: oHtml2,
            endButton: new Button({
              text: "Close",
              press: function () {
                // this.oFixedSizeDialog.destroyContent();
                this.oFixedSizeDialog.close();
              }.bind(this),
            }),
          });

          //to get access to the controller's model
          this.getView().addDependent(this.oFixedSizeDialog);
        }

        this.oFixedSizeDialog.open();
      },

      onTagihanTenantSelected: function (oEvent) {
        let oFilter1, oFilter2, oFilter3, oFilters;
        const oComboBoxTenant = oEvent.getSource();
        const oComboBoxStatus = this.getView().byId("ComboBoxTagihanStatus");
        const oComboBoxMonth = this.getView().byId("ComboBoxFilterMonth");
        const tenantSelected = oComboBoxTenant.getSelectedKey();
        const statuSelected = oComboBoxStatus.getSelectedKey();
        const monthSelected = oComboBoxMonth.getSelectedKey();

        const tagihanList = this.byId("tagihanList");
        if (tenantSelected !== "*") {
          oFilter1 = new Filter("CustomerDesc", FilterOperator.EQ, tenantSelected);
        } else {
          oFilter1 = [];
        }

        if (statuSelected === "paid") {
          oFilter2 = new Filter("Status", FilterOperator.EQ, "Sudah dibayar");
        } else if (statuSelected === "unpaid") {
          oFilter2 = new Filter("Status", FilterOperator.EQ, "Belum dibayar");
        } else {
          oFilter2 = [];
        }

        if (monthSelected !== "*") {
          oFilter3 = new Filter("BillingDate", FilterOperator.Contains, monthSelected);
        } else {
          oFilter3 = [];
        }

        oFilters = new Filter({ filters: [oFilter1, oFilter2, oFilter3], and: true });
        tagihanList.getBinding("items").filter(oFilters);
      },

      onStatusSelect: function (oEvent) {
        let oFilter1, oFilter2, oFilter3, oFilters;
        const oComboBoxStatus = oEvent.getSource();
        const oComboBoxTenant = this.getView().byId("ComboBoxTagihanTenant");
        const oComboBoxMonth = this.getView().byId("ComboBoxFilterMonth");
        const statuSelected = oComboBoxStatus.getSelectedKey();
        const tenantSelected = oComboBoxTenant.getSelectedKey();
        const monthSelected = oComboBoxMonth.getSelectedKey();

        const tagihanList = this.byId("tagihanList");

        if (statuSelected === "paid") {
          oFilter1 = new Filter("Status", FilterOperator.EQ, "Sudah dibayar");
        } else if (statuSelected === "unpaid") {
          oFilter1 = new Filter("Status", FilterOperator.EQ, "Belum dibayar");
        } else {
          oFilter1 = [];
        }

        if (tenantSelected !== "*") {
          oFilter2 = new Filter("CustomerDesc", FilterOperator.EQ, tenantSelected);
        } else {
          oFilter2 = [];
        }

        if (monthSelected !== "*") {
          oFilter3 = new Filter("BillingDate", FilterOperator.Contains, monthSelected);
        } else {
          oFilter3 = [];
        }
        

        oFilters = new Filter({ filters: [oFilter1, oFilter2, oFilter3], and: true });
        tagihanList.getBinding("items").filter(oFilters);
      },

      onMonthSelect: function(oEvent) {
        let oFilter1, oFilter2, oFilter3, oFilters;
        const oComboBoxMonth = oEvent.getSource();
        const oComboBoxTenant = this.getView().byId("ComboBoxTagihanTenant");
        const oComboBoxStatus = this.getView().byId("ComboBoxTagihanStatus");
        const monthSelected = oComboBoxMonth.getSelectedKey();
        const tenantSelected = oComboBoxTenant.getSelectedKey();
        const statusSelected = oComboBoxStatus.getSelectedKey();
        const tagihanList = this.byId("tagihanList");

        if (monthSelected !== "*") {
          oFilter1 = new Filter("BillingDate", FilterOperator.Contains, monthSelected);
        } else {
          oFilter1 = [];
        }

        if (tenantSelected !== "*") {
          oFilter2 = new Filter("CustomerDesc", FilterOperator.EQ, tenantSelected);
        } else {
          oFilter2 = [];
        }

        if (statusSelected === "paid") {
          oFilter3 = new Filter("Status", FilterOperator.EQ, "Sudah dibayar");
        } else if (statusSelected === "unpaid") {
          oFilter3 = new Filter("Status", FilterOperator.EQ, "Belum dibayar");
        } else {
          oFilter3 = [];
        }
        console.log(oFilter3)
        console.log(monthSelected)
        oFilters = new Filter({ filters: [oFilter1, oFilter2, oFilter3], and: true });
        tagihanList.getBinding("items").filter(oFilters);
      },

      // Dialogs Close
      onClose: function () {
        // oDialog.destroyContent(oHtml);
        this.byId("tagihanAirReportDialog").close();
      },
    });
  }
);
