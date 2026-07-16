sap.ui.define(
  [
    "lrlpapp/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/ui/core/HTML",
    "sap/ui/model/Sorter",
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
    Sorter,
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

    const widthWindow = window.screen.width;
    const fromDashboard = sessionStorage.getItem("TAGIHAN_AIR_FROM_DASHBOARD");
    const oBilling = JSON.parse(sessionStorage.getItem("BILLING_ZUTL"));
    const MEASPOINT = JSON.parse(sessionStorage.getItem("MEASPOINT"));

    const currentDate = new Date().getDate();

    return BaseController.extend("lrlpapp.controller.Utility", {
      onAfterRendering: function () {
        const needToScan = [];
        let needToScanDesc = "";

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
            if (el.Text !== '') {
              needToScan.push(el);
              needToScanDesc = `${needToScanDesc}` + `${el.Description.split(' ')[0]}, `;
            }
          }
        })

        needToScanDesc = needToScanDesc.slice(0, needToScanDesc.length - 2)

        // this code below is for the Dynamic Number of Tiles in Dashboard
        const notif = [];
        notif.push({ pindaiMeteran: `${needToScan.length}` })
        notif.push({ pindaiMeteranDesc: `${needToScanDesc}` })

        const notifCounter = new JSONModel({ notif });
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


        if (fromDashboard) {
          this._onTagihanAirClick();
          setTimeout(() => {
            sessionStorage.removeItem("TAGIHAN_AIR_FROM_DASHBOARD");
          }, 5000);
        }

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

      _onTagihanAirClick: function () {
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

      openFilterDialog: function () {
        const oView = this.getView();
        if (!this.filterDialog) {
          this.filterDialog = Fragment.load({
            id: oView.getId(),
            name: "lrlpapp.view.fragments.FilterDialog",
            controller: this,
          }).then(function (oDialog) {
            oDialog.setModel(oView.getModel());
            // oDialog.setModel(new JSONModel(oModel), "filter")
            return oDialog
          })
        }

        this.filterDialog.then(function (oDialog) {
          oDialog.setModel(oView.getModel());
          // oDialog.setModel(new JSONModel(oModel), "filter")
          oDialog.open()
        })
      },

      onApplyFIlter: function () {
        let oFilter1, oFilter2, oFilter3, oFilters, oSort;

        const rbg1 = this.getView().byId("rbg1");
        const rbg2 = this.getView().byId("rbg2");
        const rbg3 = this.getView().byId("rbg3");
        const comboBoxPeriode = this.getView().byId("filterPeriod");
        const tagihanList = this.byId("tagihanList");

        const selectedTenant = rbg1.getSelectedButton().getText()
        const selectedStatus = rbg2.getSelectedButton().getText()
        const selectedPeriod = comboBoxPeriode.getValue();
        const selectedSort = rbg3.getSelectedButton().getText()

        if (selectedTenant !== "Semua Tenant") {
          oFilter1 = new Filter("CustomerDesc", FilterOperator.Contains, selectedTenant);
        } else {
          oFilter1 = [];
        }

        if (selectedStatus === "Sudah dibayar") {
          oFilter2 = new Filter("Status", FilterOperator.EQ, selectedStatus);
        } else if (selectedStatus === "Belum dibayar") {
          oFilter2 = new Filter("Status", FilterOperator.EQ, selectedStatus);
        } else {
          oFilter2 = [];
        }

        if (selectedPeriod !== "Semua Periode") {
          oFilter3 = new Filter("BillingDate", FilterOperator.Contains, selectedPeriod);
        } else {
          oFilter3 = [];
        }

        oFilters = new Filter({ filters: [oFilter1, oFilter2, oFilter3], and: true });

        if (selectedSort === "Tertinggi") {
          oSort = new Sorter("BillingNumber", true);
        } else {
          oSort = new Sorter("BillingNumber", false);
        }

        tagihanList.getBinding("items").filter(oFilters);
        tagihanList.getBinding("items").sort(oSort);
        this.onFilterDialogClose();
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

      onFilterDialogClose: function () {
        this.byId("filterDialog").close();
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
