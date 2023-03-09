sap.ui.define(
  [
    "lrlpapp/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/viz/ui5/data/DimensionDefinition",
    "sap/ui/core/Item",
    "sap/ui/core/Fragment",
  ],
  function (
    BaseController,
    JSONModel,
    Filter,
    FilterOperator,
    DimensionDefinition,
    Item,
    Fragment
  ) {
    "use strict";

    const itemsForTenant = [
      { key: "3bulan", text: "3 Bulan" },
      { key: "6bulan", text: "6 Bulan" },
      { key: "1tahun", text: "1 Tahun" },
      { key: "*", text: "Semua" },
    ];

    const itemsForAllTenants = [
      { key: "Januari", text: "Januari" },
      { key: "Februari", text: "Februari" },
      { key: "Maret", text: "Maret" },
      { key: "April", text: "April" },
      { key: "Mei", text: "Mei" },
      { key: "Juni", text: "Juni" },
      { key: "Juli", text: "Juli" },
      { key: "Agustus", text: "Agustus" },
      { key: "September", text: "September" },
      { key: "Oktober", text: "Oktober" },
      { key: "November", text: "November" },
      { key: "Desember", text: "Desember" },
    ];

    const oPenggunaanAir = { data: [] };
    const oPenggunaanListrik = { data: [] };

    // let BILLING_FV = JSON.parse(sessionStorage.getItem("BILLING_FV"));
    // let BILLING_ZUTL = JSON.parse(sessionStorage.getItem("BILLING_ZUTL"));
    // let MEASPOINT = JSON.parse(sessionStorage.getItem("MEASPOINT"));
    // let needToPrint = JSON.parse(sessionStorage.getItem("TO_PRINT"))

    return BaseController.extend("lrlpapp.controller.Dashboard", {
      onInit: async function () {
        let billingHeadToItem;
        let oTagihan = [];
        const isDueDate = [];
        const hasPassed = [];
        const needToScan = [];
        const scanned = [];
        const tagihanAir = [];
        let tagihanAirToCreate;

        let MEASPOINT = [];
        let BILLING_FV = [];
        let BILLING_ZUTL = [];
        let needToPrint = [];

        // const request = {
        //   IT_VBRK: [
        //     {
        //       Vbeln: "90045602",
        //     },
        //   ],
        // };
        // const ReleaseBilling = await this.createOdataService(
        //   "/releaseBillingSet",
        //   request
        // );

        // console.log(ReleaseBilling);

        const oMeasPoint = await this.readOdataService(
          "/measurementPointSet",
          "MeasPointToMeasDoc"
        );
        oMeasPoint.results.forEach((el) => {
          MEASPOINT.push(el);
        });

        const oBilling = await this.readOdataService(
          "/billingHeaderSet",
          "BillingHeadToItem"
        );
        oBilling.results.forEach((el) => {
          let year = el.BillingDate.substr(0, 4);
          let month = el.BillingDate.substr(4, 2) - 1;
          let day = el.BillingDate.substr(6, 2);

          el.Timestamp = new Date(year, month, day).getTime();
          el.BillingDate = this.getFormattedDate(el.BillingDate);

          if (el.PaymentStatus === "X") {
            el["Status"] = "Sudah dibayar";
            el["TipeStatus"] = "Success";
          } else {
            el["Status"] = "Belum dibayar";
            el["TipeStatus"] = "Error";
          }

          if (el.ReleasedStatus === "X" && el.PrintedStatus === "X") {
            oTagihan.push(el);
          } else if (el.ReleasedStatus === "X" && el.PrintedStatus !== "X") {
            needToPrint.push(el);
          }

          if (el.BillingType === "FV") {
            BILLING_FV.push(el);
          } else {
            BILLING_ZUTL.push(el);
          }
        });

        // Storing data to Session Storage based on billing type
        // sessionStorage.setItem("ALL_BILLING", JSON.stringify(oBilling))
        sessionStorage.setItem("MEASPOINT", JSON.stringify(MEASPOINT));
        sessionStorage.setItem("BILLING_FV", JSON.stringify(BILLING_FV));
        sessionStorage.setItem("BILLING_ZUTL", JSON.stringify(BILLING_ZUTL));
        sessionStorage.setItem("TO_PRINT", JSON.stringify(needToPrint));
        console.log(needToPrint);

        MEASPOINT.forEach((el) => {
          const getMonth = new Date().getMonth() + 1;
          const stringMonth = getMonth <= 9 ? `0${getMonth}` : `${getMonth}`;
          const lastMeasDoc = el.MeasPointToMeasDoc.results[0];

          if (el.MeasPointToMeasDoc.results.length !== 0) {
            if (lastMeasDoc.Date.substr(4, 2) !== stringMonth) {
              needToScan.push(el);
            } else {
              scanned.push(el);
            }
          } else {
            needToScan.push(el);
          }

          if (el.Position === "CONTAINER") {
            el.MeasPointToMeasDoc.results.forEach((element) => {
              let year = element.Date.substr(0, 4);
              let month = element.Date.substr(4, 2);
              let day = element.Date.substr(6, 2);
              oPenggunaanAir.data.push({
                tenant: `${el.Text.split(" - ")[1]} ${
                  el.Description.split(" ")[0]
                }`,
                value: String(Number(element.Value)),
                period: this.getFormattedDate(element.Date)
                  .replace(",", "")
                  .split(" ")[1],
                date: `${year}.${month}.${day}`,
              });
            });
          } else if (el.Position === "METERAN_LISTRIK") {
            el.MeasPointToMeasDoc.results.forEach((element) => {
              let year = element.Date.substr(0, 4);
              let month = element.Date.substr(4, 2);
              let day = element.Date.substr(6, 2);
              oPenggunaanListrik.data.push({
                value: String(Number(element.Value)),
                date: `${year}.${month}.${day}`,
              });
            });
          }
        });

        if (needToScan.length !== 0) {
          const months = [
            "Januari",
            "Februari",
            "Maret",
            "April",
            "Mei",
            "Juni",
            "Juli",
            "Agustus",
            "September",
            "Oktober",
            "November",
            "Desember",
          ];

          const getMonth = new Date().getMonth();

          scanned.forEach((el_1, i) => {
            BILLING_ZUTL.forEach((el_2, j) => {
              const billingDate = el_2.BillingDate.split(" ")[1].replace(
                ",",
                ""
              );
              const customer = el_2.Customer.substr(6, 4);
              if (
                billingDate === months[getMonth] &&
                customer === scanned[i].Text.substr(0, 4)
              ) {
                tagihanAir.push(el_2);
              }
            });
          });
        }

        tagihanAirToCreate = scanned.length - tagihanAir.length;

        BILLING_FV.forEach((el) => {
          if (el.ReleasedStatus !== "X") {
            if (this.isDueDate(el.Timestamp)) {
              isDueDate.push(el);
            }
          } else {
            oTagihan.push(el);
          }
        });

        BILLING_FV.forEach((el) => {
          if (el.ReleasedStatus !== "X") {
            if (this.hasPassed(el.Timestamp)) {
              hasPassed.push(el);
            }
          } else {
            oTagihan.push(el);
          }
        });

        sessionStorage.setItem(
          "NOTIF_TAGIHAN_SEWA",
          JSON.stringify(isDueDate.sort((a, b) => a.Timestamp - b.Timestamp))
        );
        sessionStorage.setItem(
          "NOTIF_TAGIHAN_TERLAMBAT",
          JSON.stringify(hasPassed.sort((a, b) => a.Timestamp - b.Timestamp))
        );

        // this code below is for the Dynamic Number of Tiles in Dashboard
        const notifCounter = new JSONModel({
          notif: [
            { pindaiMeteran: `${needToScan.length}` },
            { tagihanAir: String(tagihanAirToCreate) },
            { tagihanSewa: String(isDueDate.length + hasPassed.length) },
            { belumCetak: String(needToPrint.length) },
          ],
        });
        this.getView().setModel(notifCounter, "notif");

        this.getView().setModel(
          new JSONModel({ tagihan: oTagihan }),
          "tagihan"
        );

        // Vizframe chart for Penggunaan Air
        const vizAir = this.getView().byId("vizPenggunaanAir");
        const vizListrik = this.byId("vizPenggunaanListrik");

        vizAir.setVizProperties({
          plotArea: {
            dataLabel: {
              visible: true,
            },
            colorPalette: ["#00925D"],
          },
          valueAxis: {
            title: {
              visible: false,
            },
          },
          categoryAxis: {
            title: {
              visible: false,
            },
          },
          title: {
            visible: false,
            text: "",
          },
        });

        vizListrik.setVizProperties({
          plotArea: {
            dataLabel: {
              visible: true,
            },
            colorPalette: ["#FF942E"],
          },
          valueAxis: {
            title: {
              visible: false,
            },
          },
          categoryAxis: {
            title: {
              visible: false,
            },
          },
          title: {
            visible: false,
            text: "",
          },
        });

        // const penggunaanAir = this.getOwnerComponent().getModel("penggunaanAir").getData();
        const penggunaanAir = this.formattedChartDateAndTimestamp(
          oPenggunaanAir.data
        );
        // const penggunaanAir = { data:
        //     oPenggunaanAir.data.sort((a, b) => {
        //         const months = this.getMonth(null);
        //         // Sort by month
        //         const monthComparison = months.indexOf(a.month) - months.indexOf(b.month)
        //         if (monthComparison !== 0) {
        //             return monthComparison;
        //         }
        //     })
        // }

        // const penggunaanListrik = this.getOwnerComponent().getModel("penggunaanListrik").getData();
        const dataFinalPenggunaanListrik = [];
        // const penggunaanListrik = oPenggunaanListrik;
        const penggunaanListrik = this.formattedChartDateAndTimestamp(
          oPenggunaanListrik.data
        );

        console.log(penggunaanAir);
        console.log(penggunaanListrik);

        // penggunaanListrik.data.forEach(el => {
        //   let month = el.date.split(".")[1];
        //   let year = el.date.split(".")[0];
        //   switch (month) {
        //     case "01":
        //       el.month = `Jan ${year}`
        //       break;
        //     case "02":
        //       el.month = `Feb ${year}`
        //       break;
        //     case "03":
        //       el.month = `Mar ${year}`
        //       break;
        //     case "04":
        //       el.month = `Apr ${year}`
        //       break;
        //     case "05":
        //       el.month = `Mei ${year}`
        //       break;
        //     case "06":
        //       el.month = `Jun ${year}`
        //       break;
        //     case "07":
        //       el.month = `Jul ${year}`
        //       break;
        //     case "08":
        //       el.month = `Agu ${year}`
        //       break;
        //     case "09":
        //       el.month = `Sep ${year}`
        //       break;
        //     case "10":
        //       el.month = `Okt ${year}`
        //       break;
        //     case "11":
        //       el.month = `Nov ${year}`
        //       break;
        //     case "12":
        //       el.month = `Des ${year}`
        //       break;
        //   }

        //   el.timeStamp = new Date(el.date).getTime();
        //   dataFinalPenggunaanListrik.push(el);
        // })

        const penggunaanAirModel = new JSONModel({
          data: penggunaanAir.sort((a, b) => a.timeStamp - b.timeStamp),
        });
        const penggunaanListrikModel = new JSONModel({
          data: penggunaanListrik.sort((a, b) => a.timeStamp - b.timeStamp),
        });
        console.log(penggunaanListrikModel);

        const oComboBoxTenant = this.getView().byId("ComboBoxTenant");
        const oComboBoxListrikTimestamp = this.getView().byId(
          "ListrikTimestampFilter"
        );

        const tilePindaiMeteran = this.getView().byId("tilePindaiMeteran");
        const tileTagihanAir = this.getView().byId("tileTagihanAir");
        const tileTagihanSewa = this.getView().byId("tileTagihanSewa");
        const tileBelumCetak = this.getView().byId("tileBelumCetak");

        tilePindaiMeteran.attachBrowserEvent(
          "click",
          this._onPindaiMeteranClick,
          this
        );
        tileTagihanAir.attachBrowserEvent(
          "click",
          this._onTagihanAirClick,
          this
        );
        tileTagihanSewa.attachBrowserEvent(
          "click",
          this._onTagihanSewaClick,
          this
        );
        tileBelumCetak.attachBrowserEvent("click", this._onBelumCetak, this);

        vizAir.setModel(penggunaanAirModel, "penggunaanAir");
        vizListrik.setModel(penggunaanListrikModel, "penggunaanListrik");

        oComboBoxTenant.destroyItems();
        oComboBoxTenant.addItem(new Item({ key: "*", text: "Semua Tenant" }));

        const uniqueTenants = [
          ...new Set(penggunaanAir.map((item) => item.tenant)),
        ];
        uniqueTenants.forEach((el) => {
          oComboBoxTenant.addItem(new Item({ key: el, text: el }));
        });
        oComboBoxTenant.setSelectedKey("*");

        oComboBoxTenant.fireSelectionChange();
        oComboBoxListrikTimestamp.fireSelectionChange();
      },

      _onPindaiMeteranClick: function () {
        this.getRouter().navTo("meteran");
        window.location.reload();
      },

      _onTagihanAirClick: function (oEvent) {
        this.getRouter().navTo("utility");
        window.location.reload();
      },

      _onTagihanSewaClick: function (oEvent) {
        const oView = this.getView();
        const tagihanSewa = JSON.parse(
          sessionStorage.getItem("NOTIF_TAGIHAN_SEWA")
        );
        const tagihanTerlambat = JSON.parse(
          sessionStorage.getItem("NOTIF_TAGIHAN_TERLAMBAT")
        );

        tagihanSewa.forEach((el) => {
          el.Info = "";
          el.InfoState = "Success";
        });
        tagihanTerlambat.forEach((el) => {
          el.Info = "Belum dirilis";
          el.InfoState = "Error";
        });

        const oTagihanSewa = tagihanSewa.concat(tagihanTerlambat);
        const oModel = { tagihanSewa: oTagihanSewa };

        if (!this.tagihanSewaDialog) {
          this.tagihanSewaDialog = Fragment.load({
            id: oView.getId(),
            name: "lrlpapp.view.fragments.TagihanSewaDialog",
            controller: this,
          }).then(function (oDialog) {
            oDialog.setModel(oView.getModel());
            oDialog.setModel(new JSONModel(oModel), "tagihanSewa");
            return oDialog;
          });
        }

        this.tagihanSewaDialog.then(function (oDialog) {
          oDialog.setModel(oView.getModel());
          oDialog.setModel(new JSONModel(oModel), "tagihanSewa");

          oDialog.open();
        });
      },

      _onBelumCetak: function (oEvent) {
        const oView = this.getView();
        const belumCetak = JSON.parse(sessionStorage.getItem("TO_PRINT"));

        const oModel = { belumCetak: belumCetak };

        if (!this.belumCetakDialog) {
          this.belumCetakDialog = Fragment.load({
            id: oView.getId(),
            name: "lrlpapp.view.fragments.BelumCetakDialog",
            controller: this,
          }).then(function (oDialog) {
            oDialog.setModel(oView.getModel());
            oDialog.setModel(new JSONModel(oModel), "belumCetak");
            return oDialog;
          });
        }

        this.belumCetakDialog.then(function (oDialog) {
          oDialog.setModel(oView.getModel());
          oDialog.setModel(new JSONModel(oModel), "belumCetak");

          oDialog.open();
        });
      },

      onTagihanTenantSelected: function (oEvent) {
        let oFilter1, oFilter2, oFilters;
        const oComboBoxTenant = oEvent.getSource();
        const oComboBoxStatus = this.getView().byId("ComboBoxTagihanStatus");
        const tenantSelected = oComboBoxTenant.getSelectedKey();
        const statuSelected = oComboBoxStatus.getSelectedKey();

        const tagihanList = this.byId("tagihanList");
        if (tenantSelected !== "*") {
          oFilter1 = new Filter(
            "CustomerDesc",
            FilterOperator.Contains,
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

        oFilters = new Filter({ filters: [oFilter1, oFilter2], and: true });
        tagihanList.getBinding("items").filter(oFilters);
      },

      onStatusSelect: function (oEvent) {
        let oFilter1, oFilter2, oFilters;
        const oComboBoxStatus = oEvent.getSource();
        const oComboBoxTenant = this.getView().byId("ComboBoxTagihanTenant");
        const statuSelected = oComboBoxStatus.getSelectedKey();
        const tenantSelected = oComboBoxTenant.getSelectedKey();

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
            FilterOperator.Contains,
            tenantSelected
          );
        } else {
          oFilter2 = [];
        }

        oFilters = new Filter({ filters: [oFilter1, oFilter2], and: true });
        tagihanList.getBinding("items").filter(oFilters);
      },

      onSelectListTagihan: function (oEvent) {
        const oContext = oEvent
          .getSource()
          .getBindingContext("tagihan")
          .getPath()
          .slice(9);
        const listTagihan = this.getView()
          .byId("tagihanList")
          .getBinding("items").oList;
        const selectedList = listTagihan[oContext];

        const oView = this.getView();
        const oModel = { detailTagihan: [{ ...selectedList }] };

        console.log(oModel);

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

      onChartTenantSelected: function (oEvent) {
        let oFilterTenant, oFilterMonth, filters;

        const currentMonth = this.getMonth(new Date().getMonth());

        const oVizFrame = this.getView().byId("vizPenggunaanAir");
        const oDataset = oVizFrame.getDataset();
        const oDimension = oDataset.getDimensions()[0];

        const oComboBoxTenant = oEvent.getSource();
        const oComboBoxMonth = this.getView().byId("ComboBoxMonth");
        const tenantSelected = oComboBoxTenant.getSelectedKey();

        oFilterTenant = new Filter(
          "tenant",
          FilterOperator.Contains,
          tenantSelected
        );
        oFilterMonth = new Filter("period", FilterOperator.EQ, currentMonth);

        if (tenantSelected !== "*") {
          oVizFrame.setVizType("line");
          oVizFrame.setVizProperties({
            title: { visible: true, text: `${tenantSelected}` },
          });

          oComboBoxMonth.destroyItems();
          itemsForTenant.forEach((el) => {
            oComboBoxMonth.addItem(new Item(el));
          });
          oComboBoxMonth.setSelectedKey("3bulan");
          oDataset.removeDimension(oDimension);

          const oNewDimension = new DimensionDefinition({
            name: "Category",
            value: "{penggunaanAir>month}",
          });

          oDataset.addDimension(oNewDimension);
          oDataset.getBinding("data").filter(oFilterTenant);
        } else {
          oVizFrame.setVizType("column");
          oVizFrame.setVizProperties({
            title: {
              visible: true,
              text: `Semua Tenant bulan ${currentMonth}`,
            },
          });

          oComboBoxMonth.destroyItems();
          itemsForAllTenants.forEach((el) => {
            oComboBoxMonth.addItem(new Item(el));
          });
          oComboBoxMonth.setSelectedKey(currentMonth);
          oDataset.removeDimension(oDimension);

          oDataset.removeDimension(oDimension);
          const oNewDimension = new DimensionDefinition({
            name: "Category",
            value: "{penggunaanAir>tenant}",
          });
          oDataset.addDimension(oNewDimension);
          oDataset.getBinding("data").filter(oFilterMonth);
        }
      },

      onChartMonthSelected: function (oEvent) {
        let oFilterTenant, oFilterMonth, filters, toDateTimestamp;
        const currentDate = new Date();

        const oVizFrame = this.getView().byId("vizPenggunaanAir");
        const oDataset = oVizFrame.getDataset().getBinding("data");

        const oComboBoxMonth = oEvent.getSource();
        const oComboBoxTenant = this.getView().byId("ComboBoxTenant");
        const monthSelected = oComboBoxMonth.getSelectedKey();
        const tenantSelected = oComboBoxTenant.getSelectedKey();

        if (tenantSelected !== "*") {
          oFilterTenant = new Filter(
            "tenant",
            FilterOperator.EQ,
            tenantSelected
          );
          // oFilterMonth = new Filter("period", FilterOperator.EQ, monthSelected);
          if (monthSelected === "6months") {
            toDateTimestamp = new Date(
              currentDate.getFullYear(),
              currentDate.getMonth() - 3,
              currentDate.getDate()
            ).getTime();
            oFilterMonth = new Filter(
              "timeStamp",
              FilterOperator.BT,
              toDateTimestamp,
              currentDate.getTime()
            );
          } else if (monthSelected === "6months") {
            toDateTimestamp = new Date(
              currentDate.getFullYear(),
              currentDate.getMonth() - 6,
              currentDate.getDate()
            ).getTime();
            oFilterMonth = new Filter(
              "timeStamp",
              FilterOperator.BT,
              toDateTimestamp,
              currentDate.getTime()
            );
          } else if (monthSelected === "1year") {
            toDateTimestamp = new Date(
              currentDate.getFullYear() - 1,
              currentDate.getMonth(),
              currentDate.getDate()
            ).getTime();
            oFilterMonth = new Filter(
              "timeStamp",
              FilterOperator.BT,
              toDateTimestamp,
              currentDate.getTime()
            );
          } else {
            toDateTimestamp = new Date(
              currentDate.getFullYear() - 9999,
              currentDate.getMonth(),
              currentDate.getDate()
            ).getTime();
            oFilterMonth = new Filter(
              "timeStamp",
              FilterOperator.BT,
              toDateTimestamp,
              currentDate.getTime()
            );
          }
        } else {
          oFilterTenant = [];
          oFilterMonth = new Filter("period", FilterOperator.EQ, monthSelected);

          oVizFrame.setVizProperties({
            title: {
              visible: true,
              text: `Semua Tenant bulan ${monthSelected}`,
            },
          });
        }

        filters = new Filter({
          filters: [oFilterTenant, oFilterMonth],
          and: true,
        });

        oDataset.filter(filters);
      },

      onListrikChartTimestamp: function (oEvent) {
        let toDateTimestamp, oFilter;
        const oComboBoxTimestamp = oEvent.getSource();
        const timeStampSelected = oComboBoxTimestamp.getSelectedKey();

        const oVizFrame = this.getView().byId("vizPenggunaanListrik");
        const oDataset = oVizFrame.getDataset().getBinding("data");

        const currentDate = new Date();

        if (timeStampSelected === "6months") {
          toDateTimestamp = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() - 6,
            currentDate.getDate()
          ).getTime();
          oFilter = new Filter(
            "timeStamp",
            FilterOperator.BT,
            toDateTimestamp,
            currentDate.getTime()
          );
        } else if (timeStampSelected === "1year") {
          toDateTimestamp = new Date(
            currentDate.getFullYear() - 1,
            currentDate.getMonth(),
            currentDate.getDate()
          ).getTime();
          oFilter = new Filter(
            "timeStamp",
            FilterOperator.BT,
            toDateTimestamp,
            currentDate.getTime()
          );
        } else {
          toDateTimestamp = new Date(
            currentDate.getFullYear() - 9999,
            currentDate.getMonth(),
            currentDate.getDate()
          ).getTime();
          oFilter = new Filter(
            "timeStamp",
            FilterOperator.BT,
            toDateTimestamp,
            currentDate.getTime()
          );
        }

        oDataset.filter(oFilter);
      },

      onTagihanSewaDialogRelease: function () {
        let selectedList = [];

        const listTagihanSewa = this.getView()
          .byId("listTagihanSewa")
          .getSelectedItems();
        listTagihanSewa.forEach((el) => {
          selectedList.push(el.getBindingContext("tagihanSewa").getObject());
        });

        console.log(selectedList);
      },

      onBelumCetakDialogCetak: function () {
        let selectedList = [];

        const listTagihanSewa = this.getView()
          .byId("listBelumCetak")
          .getSelectedItems();
        listTagihanSewa.forEach((el) => {
          selectedList.push(el.getBindingContext("belumCetak").getObject());
        });

        console.log(selectedList);
      },

      // Dialogs Close
      onTagihanAirDialogClose: function () {
        this.byId("tagihanAirDialog").close();
      },

      onTagihanSewaDialogClose: function () {
        this.byId("tagihanSewaDialog").close();
      },

      onBelumCetakDialogClose: function () {
        this.byId("belumCetakDialog").close();
      },

      onDetailTagihanClose: function () {
        this.byId("detailListTagihan").close();
      },

      formattedChartDateAndTimestamp: function (data) {
        const result = [];

        data.forEach((el) => {
          let month = el.date.split(".")[1];
          let year = el.date.split(".")[0];
          switch (month) {
            case "01":
              el.month = `Jan ${year}`;
              break;
            case "02":
              el.month = `Feb ${year}`;
              break;
            case "03":
              el.month = `Mar ${year}`;
              break;
            case "04":
              el.month = `Apr ${year}`;
              break;
            case "05":
              el.month = `Mei ${year}`;
              break;
            case "06":
              el.month = `Jun ${year}`;
              break;
            case "07":
              el.month = `Jul ${year}`;
              break;
            case "08":
              el.month = `Agu ${year}`;
              break;
            case "09":
              el.month = `Sep ${year}`;
              break;
            case "10":
              el.month = `Okt ${year}`;
              break;
            case "11":
              el.month = `Nov ${year}`;
              break;
            case "12":
              el.month = `Des ${year}`;
              break;
          }

          el.timeStamp = new Date(el.date).getTime();
          result.push(el);
        });

        return result;
      },
    });
  }
);
