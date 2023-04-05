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
  function (
    BaseController,
    JSONModel,
    Fragment,
    Dialog,
    Button,
    HTML,
    Filter,
    FilterOperator
  ) {
    "use strict";
    

    const PRD_366 = "https://lrna.edugate.web.id:80/sap/bc/se/m/index.html?~transaction=ZAIR&sap-personas-flavor=D0374502C7081EDDAB89ADB78698441C&sap-se-hide-splashscreen=X&sap-client=366&sap-language=EN&sap-accessibility=X"
    const QAS_400 = "https://lrna.edugate.web.id:8090/sap/bc/se/m/index.html?~transaction=ZAIR&sap-personas-flavor=D0374502C7081EDDAB89ADB78698441C&sap-se-hide-splashscreen=X&sap-client=400&sap-language=EN&sap-accessibility=X"
    const DEV_116 = "https://lrna.edugate.web.id:8080/sap/bc/se/m/index.html?~transaction=ZAIR&sap-personas-flavor=D0374502C7081EDDAB89ADB78698441C&sap-se-hide-splashscreen=X&sap-client=116&sap-language=EN&sap-accessibility=X"
    
    const ZINVOICE_PRD_366 = "https://lrna.edugate.web.id:80/sap/bc/se/m/index.html?~transaction=ZINVOICE&sap-personas-flavor=D0374502C7081EDDADCD647C3260841C&sap-se-hide-splashscreen=X&sap-client=366&sap-language=EN&sap-accessibility=X"
    const ZINVOICE_QAS_400 = "https://lrna.edugate.web.id:8090/sap/bc/se/m/index.html?~transaction=ZINVOICE&sap-personas-flavor=D0374502C7081EDDADCD647C3260841C&sap-se-hide-splashscreen=X&sap-client=400&sap-language=EN&sap-accessibility=X"
    const ZINVOICE_DEV_116 = "https://lrna.edugate.web.id:8080/sap/bc/se/m/index.html?~transaction=ZINVOICE&sap-personas-flavor=D0374502C7081EDDADCD647C3260841C&sap-se-hide-splashscreen=X&sap-client=116&sap-language=EN&sap-accessibility=X"

    return BaseController.extend("lrlpapp.controller.Utility", {
      onAfterRendering: async function () {
        const widthWindow = window.screen.width;
        const oBilling = JSON.parse(sessionStorage.getItem("BILLING_ZUTL"));
        const fromDashboard = sessionStorage.getItem("TAGIHAN_AIR_FROM_DASHBOARD");
        
        const needToScan = [];
        let needToScanDesc = "";
        let MEASPOINT = [];

        const oMeasPoint = await this.readOdataService("/measurementPointSet", "MeasPointToMeasDoc" );
        oMeasPoint.results.forEach((el) => {
          MEASPOINT.push(el);
        });
        
        MEASPOINT.forEach((el) => {
          const getMonth = new Date().getMonth() + 1;
          const stringMonth = getMonth <= 9 ? `0${getMonth}` : `${getMonth}`;
          const lastMeasDoc = el.MeasPointToMeasDoc.results[0];

          if (el.MeasPointToMeasDoc.results.length !== 0) {
            if (lastMeasDoc.Date.substr(4, 2) !== stringMonth) {
              needToScan.push(el);
              needToScanDesc = `${needToScanDesc}` + `${el.Description.split(" ")[0]}, `;
            } 
          } else {
            if (el.Text !== "") { needToScan.push(el); }
          }
        })
        needToScanDesc = needToScanDesc.slice(0, needToScanDesc.length - 2)

        // this code below is for the Dynamic Number of Tiles in Dashboard
        const notifCounter = new JSONModel({
          notif: [
            { pindaiMeteran: `${needToScan.length}` },
            { pindaiMeteranDesc: `${needToScanDesc}` }
          ],
        });
        this.getView().setModel(notifCounter, "notif");
        
        //Read oData for setting tagihan utilities List
        let oTagihanUtility = [];

        // console.log(oBilling);

        oBilling.forEach((el) => {
          if (el.ReleasedStatus === "X") {
            oTagihanUtility.push(el);
          }
        });
        // console.log(oTagihanUtility);

        this.getView().setModel(
          new JSONModel({ utilityList: oTagihanUtility }),
          "utilities"
        );

        //Create tenant List
        const tenant = oBilling.map((el) => el.CustomerDesc);

        const listTenant = tenant.filter(
          (el, index) => tenant.indexOf(el) === index
        );
        const fixTenant = listTenant.map((CustomerDesc) => ({
          name: CustomerDesc,
          id: CustomerDesc,
        }));

        let defaultItem = { name: "Semua Tenant", id: "*" };
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

        if (fromDashboard) {
          this._onTagihanAirClick();
          setTimeout(() => {
            sessionStorage.removeItem("TAGIHAN_AIR_FROM_DASHBOARD");
          }, 5000);
        }
      },

      _onPemakaianListrik: function (oEvent) {
        // console.log("Pemakaian Listrik");
      },
      _onPindaiMeteran: function (oEvent) {
        this.getRouter().navTo("meteran");
      },
      _onReportAir: function (oEvent) {
        this.getRouter().navTo("reportair");
      },

      _onTagihanAirClick: function (oEvent) {
        // console.log("Perhitungan Tagihan Air");
        const oView = this.getView();

        let zInvoiceUrl;
        const portURL = window.location.port

        if (portURL === "8080") { zInvoiceUrl = `<iframe src="${DEV_116}" width="100%" height="500px"></iframe>` }
        if (portURL === "8090") { zInvoiceUrl = `<iframe src="${QAS_400}" width="100%" height="500px"></iframe>` }
        if (portURL === "80") { zInvoiceUrl = `<iframe src="${PRD_366}" width="100%" height="500px"></iframe>` }

        const oHtml2 = new HTML({
            content: zInvoiceUrl,
        })

        let width = null;
        // console.log(widthWindow);

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
              text: "Tutup",
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
          oFilter1 = new Filter(
            "CustomerDesc",
            FilterOperator.EQ,
            tenantSelected
          );
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
          oFilter3 = new Filter(
            "BillingDate",
            FilterOperator.Contains,
            monthSelected
          );
        } else {
          oFilter3 = [];
        }

        oFilters = new Filter({
          filters: [oFilter1, oFilter2, oFilter3],
          and: true,
        });
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
          oFilter2 = new Filter(
            "CustomerDesc",
            FilterOperator.EQ,
            tenantSelected
          );
        } else {
          oFilter2 = [];
        }

        if (monthSelected !== "*") {
          oFilter3 = new Filter(
            "BillingDate",
            FilterOperator.Contains,
            monthSelected
          );
        } else {
          oFilter3 = [];
        }

        oFilters = new Filter({
          filters: [oFilter1, oFilter2, oFilter3],
          and: true,
        });
        tagihanList.getBinding("items").filter(oFilters);
      },

      onMonthSelect: function (oEvent) {
        let oFilter1, oFilter2, oFilter3, oFilters;
        const oComboBoxMonth = oEvent.getSource();
        const oComboBoxTenant = this.getView().byId("ComboBoxTagihanTenant");
        const oComboBoxStatus = this.getView().byId("ComboBoxTagihanStatus");
        const monthSelected = oComboBoxMonth.getSelectedKey();
        const tenantSelected = oComboBoxTenant.getSelectedKey();
        const statusSelected = oComboBoxStatus.getSelectedKey();
        const tagihanList = this.byId("tagihanList");

        if (monthSelected !== "*") {
          oFilter1 = new Filter(
            "BillingDate",
            FilterOperator.Contains,
            monthSelected
          );
        } else {
          oFilter1 = [];
        }

        if (tenantSelected !== "*") {
          oFilter2 = new Filter(
            "CustomerDesc",
            FilterOperator.EQ,
            tenantSelected
          );
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
        // console.log(oFilter3);
        // console.log(monthSelected);
        oFilters = new Filter({
          filters: [oFilter1, oFilter2, oFilter3],
          and: true,
        });
        tagihanList.getBinding("items").filter(oFilters);
      },

      onSelectListTagihan: function (oEvent) {
        const oContext = oEvent
          .getSource()
          .getBindingContext("utilities")
          .getPath()
          .slice(13);
        const listTagihan = this.getView()
          .byId("tagihanList")
          .getBinding("items").oList;
        const selectedList = listTagihan[oContext];

        const oView = this.getView();
        const oModel = { detailTagihan: [{ ...selectedList }] };

        if (!this.dialogName) {
          this.dialogName = Fragment.load({
            id: oView.getId(),
            name: `lrlpapp.view.fragments.DetailListTagihan`,
            controller: this,
          }).then(function (oDialog) {
            oDialog.setModel(oView.getModel());
            oDialog.setModel(new JSONModel(oModel), "tagihan");
            return oDialog;
          });
        }

        this.dialogName.then(function (oDialog) {
          oDialog.setModel(oView.getModel());
          oDialog.setModel(new JSONModel(oModel), "tagihan");
          oDialog.open();
        });
      },

      // Dialogs Close
      onClose: function () {
        // oDialog.destroyContent(oHtml);
        this.byId("tagihanAirReportDialog").close();
      },

      onDetailTagihanClose: function () {
        // oDialog.destroyContent(oHtml);
        this.byId("detailListTagihan").close();
      },

      onDetailTagihanCetak: function () {
        const detailTagihan = this.getView().byId("detailListTagihan").getModel('tagihan');
        const oData = detailTagihan.oData.detailTagihan[0]

        // Set sessionStorage for ZInvoice Flavor
        sessionStorage.setItem("BILL_NUMBER", oData.BillingNumber);

        this.cetakTagihan();
        // console.log(oData);
      },

      cetakTagihan: function () {
        let zInvoiceUrl;
        const portURL = window.location.port

        if (portURL === "8080") { zInvoiceUrl = `<iframe src="${ZINVOICE_DEV_116}" width="100%" height="500px"></iframe>` }
        if (portURL === "8090") { zInvoiceUrl = `<iframe src="${ZINVOICE_QAS_400}" width="100%" height="500px"></iframe>` }
        if (portURL === "80") { zInvoiceUrl = `<iframe src="${ZINVOICE_PRD_366}" width="100%" height="500px"></iframe>` }

        const oHTML = new HTML({
            content: zInvoiceUrl,
        })

        let widthContent = null;
        let widthWindow = window.screen.width;

        if (widthWindow < 576 || widthWindow > 1400) {
            widthContent = "100%";
        } else {
            widthContent = "70%";
        };

        if (!this.oZInvoiceDialog) {
            this.oZInvoiceDialog = new Dialog({
                title: "Cetak tagihan",
                contentWidth: widthContent,
                contentHeight: "500px",
                content: oHTML,
                endButton: new Button({
                    text: "Tutup",
                    press: function () {
                        this.oZInvoiceDialog.close();
                    }.bind(this),
                })
            })

            this.getView().addDependent(this.oZInvoiceDialog);
        }
        this.oZInvoiceDialog.open();
      }
    });
  }
);
