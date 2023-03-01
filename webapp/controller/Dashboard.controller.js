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

    let oModel;

    return BaseController.extend("lrlpapp.controller.Dashboard", {
      onInit: async function () {

        // sessionStorage.setItem("wkwkw", "WODKAODKWA")
        let billingHeadToItem;
        let oTagihan = [];
        let BILLING_FV = [];
        let BILLING_ZUTL = [];

        const oBilling = await this.readOdataService("/billingHeaderSet", "BillingHeaderToItem");
        billingHeadToItem = oBilling.results.map(el => el.BillingHeadToItem.results)

        const oBillingItem = this.flattenedArr(billingHeadToItem)

        oBilling.results.forEach(el => {
            let year = el.BillingDate.substr(0, 4);
            let month = el.BillingDate.substr(4, 2) - 1;
            let day = el.BillingDate.substr(6, 2);
            
            el.Timestamp = new Date(year, month, day).getTime();
            el.BillingDate = this.getFormattedDate(el.BillingDate)

            if (el.PaymentStatus === "X"){
                el["Status"] = "Sudah dibayar"
                el["TipeStatus"] = "Success"
            } else {
                el["Status"] = "Belum dibayar"
                el["TipeStatus"] = "Error"
            }

            if (el.ReleasedStatus === "X") {
                oTagihan.push(el);
            }

            if (el.BillingType === "FV"){
                BILLING_FV.push(el);
            } else {
                BILLING_ZUTL.push(el);
            }
        })

        const isDueDate = []
        BILLING_FV.forEach(el => {
            if (el.ReleasedStatus !== "X") {
                if (this.isDueDate(el.Timestamp)) {
                    isDueDate.push(el)
                }
            }
        })

        const hasPassed = []
        BILLING_FV.forEach(el => {
            if (el.ReleasedStatus !== "X") {
                if (this.hasPassed(el.Timestamp)) {
                    hasPassed.push(el)
                }
            }
        })
        console.log("passed", hasPassed);

        const notifCounter = new JSONModel({ notif : [
            {tagihanSewa      : String(isDueDate.length)},
            {tagihanTerlambat : String(hasPassed.length)}
        ]})
        this.getView().setModel(notifCounter, "notif");

        this.getView().setModel(
          new JSONModel({ tagihan: oTagihan }),
          "tagihan"
        );

        // Storing data to Session Storage based on billing type
        // sessionStorage.setItem("ALL_BILLING", JSON.stringify(oBilling))
        sessionStorage.setItem("BILLING_FV", JSON.stringify(BILLING_FV))
        sessionStorage.setItem("BILLING_ZUTL", JSON.stringify(BILLING_ZUTL))
        sessionStorage.setItem("NOTIF_TAGIHAN_SEWA", JSON.stringify(isDueDate.sort((a, b) => a.Timestamp - b.Timestamp)))
        sessionStorage.setItem("NOTIF_TAGIHAN_TERLAMBAT", JSON.stringify(hasPassed.sort((a, b) => a.Timestamp - b.Timestamp)))

        // console.log(BILLING_FV);
        // console.log(oBillingItem);
        // console.log("OTAGIHAN", oTagihan);

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

        const penggunaanAir = this.getOwnerComponent() .getModel("penggunaanAir").getData();
        const penggunaanListrik = this.getOwnerComponent().getModel("penggunaanListrik").getData();
        const oPenggunaanListrik = [];

        penggunaanListrik.data.forEach(el => {
          let month = el.date.split(".")[1];
          let year = el.date.split(".")[0];
          switch (month) {
            case "01":
              el.month = `Jan ${year}`
              break;
            case "02":
              el.month = `Feb ${year}`
              break;
            case "03":
              el.month = `Mar ${year}`
              break;
            case "04":
              el.month = `Apr ${year}`
              break;
            case "05":
              el.month = `Mei ${year}`
              break;
            case "06":
              el.month = `Jun ${year}`
              break;
            case "07":
              el.month = `Jul ${year}`
              break;
            case "08":
              el.month = `Agu ${year}`
              break;
            case "09":
              el.month = `Sep ${year}`
              break;
            case "10":
              el.month = `Okt ${year}`
              break;
            case "11":
              el.month = `Nov ${year}`
              break;
            case "12":
              el.month = `Des ${year}`
              break;
          }

		  el.timeStamp = new Date(el.date).getTime();
          oPenggunaanListrik.push(el);
        })

        const penggunaanAirModel = new JSONModel(penggunaanAir);
        const penggunaanListrikModel = new JSONModel({data: oPenggunaanListrik});

        const oComboBoxTenant = this.getView().byId("ComboBoxTenant");
        const oComboBoxListrikTimestamp = this.getView().byId("ListrikTimestampFilter");

        const tilePindaiMeteran = this.getView().byId("tilePindaiMeteran");
        const tileTagihanAir = this.getView().byId("tileTagihanAir");
        const tileTagihanSewa = this.getView().byId("tileTagihanSewa");
        const tileTagihanTerlambat = this.getView().byId("tileTagihanTerlambat");

        tilePindaiMeteran.attachBrowserEvent( "click", this._onPindaiMeteranClick, this );
        tileTagihanAir.attachBrowserEvent( "click", this._onTagihanAirClick, this );
        tileTagihanSewa.attachBrowserEvent( "click", this._onTagihanSewaClick, this );
        tileTagihanTerlambat.attachBrowserEvent( "click", this._onTagihanTerlambatClick, this );

        vizAir.setModel(penggunaanAirModel, "penggunaanAir");
        vizListrik.setModel(penggunaanListrikModel, "penggunaanListrik");
		
        oComboBoxTenant.fireSelectionChange();
        oComboBoxListrikTimestamp.fireSelectionChange();
      },

      _onPindaiMeteranClick: function () {
        this.getRouter().navTo("meteran");
        window.location.reload();
      },

      _onTagihanAirClick: function (oEvent) {
        const oView = this.getView();
        const oTagihanAirModel = [
          { nama: "Tenant A", noTagihan: "90046015", dueDate: "09 Feb, 2023" },
          { nama: "Tenant B", noTagihan: "90046016", dueDate: "09 Feb, 2023" },
          { nama: "Tenant C", noTagihan: "90046017", dueDate: "09 Feb, 2023" },
          { nama: "Tenant D", noTagihan: "90046018", dueDate: "09 Feb, 2023" },
          { nama: "Tenant E", noTagihan: "90046019", dueDate: "09 Feb, 2023" },
        ];

        if (!this.tagihanAirDialog) {
          this.tagihanAirDialog = Fragment.load({
            id: oView.getId(),
            name: "lrlpapp.view.fragments.TagihanAirDialog",
            controller: this,
          }).then(function (oDialog) {
            oDialog.setModel(oView.getModel());
            oDialog.setModel(
              new JSONModel({
                tagihanAir: oTagihanAirModel,
              }),
              "tagihanAir"
            );
            return oDialog;
          });
        }

        this.tagihanAirDialog.then(function (oDialog) {
          oDialog.setModel(oView.getModel());
          oDialog.setModel(
            new JSONModel({
              tagihanAir: oTagihanAirModel,
            }),
            "tagihanAir"
          );

          oDialog.open();
        });
      },

      _onTagihanSewaClick: function (oEvent) {
        const oView = this.getView();
        const tagihanSewa = JSON.parse(sessionStorage.getItem("NOTIF_TAGIHAN_SEWA"));
        

        const oModel = { tagihanSewa : tagihanSewa }

        if (!this.tagihanSewaDialog) {
          this.tagihanSewaDialog = Fragment.load({
            id: oView.getId(),
            name: "lrlpapp.view.fragments.TagihanSewaDialog",
            controller: this,
          }).then(function (oDialog) {
            oDialog.setModel(oView.getModel());
            oDialog.setModel( new JSONModel(oModel), "tagihanSewa" );
            return oDialog;
          });
        }

        this.tagihanSewaDialog.then(function (oDialog) {
          oDialog.setModel(oView.getModel());
          oDialog.setModel( new JSONModel(oModel), "tagihanSewa" );

          oDialog.open();
        });
      },

      _onTagihanTerlambatClick: function (oEvent) {
        const oView = this.getView();
        const tagihanTerlambat = JSON.parse(sessionStorage.getItem("NOTIF_TAGIHAN_TERLAMBAT"));
        

        const oModel = { tagihanTerlambat : tagihanTerlambat }

        if (!this.tagihanTerlambatDialog) {
          this.tagihanTerlambatDialog = Fragment.load({
            id: oView.getId(),
            name: "lrlpapp.view.fragments.TagihanTerlambatDialog",
            controller: this,
          }).then(function (oDialog) {
            oDialog.setModel(oView.getModel());
            oDialog.setModel( new JSONModel(oModel), "tagihanTerlambat" );
            return oDialog;
          });
        }

        this.tagihanTerlambatDialog.then(function (oDialog) {
          oDialog.setModel(oView.getModel());
          oDialog.setModel( new JSONModel(oModel), "tagihanTerlambat" );

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
          oFilter1 = new Filter("CustomerDesc", FilterOperator.Contains, tenantSelected);
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
          oFilter2 = new Filter("CustomerDesc", FilterOperator.Contains, tenantSelected);
        } else {
          oFilter2 = [];
        }

        oFilters = new Filter({ filters: [oFilter1, oFilter2], and: true });
        tagihanList.getBinding("items").filter(oFilters);
      },

      onSelectListTagihan: function (oEvent) {
        const oContext = oEvent.getSource().getBindingContext("tagihan").getPath().slice(9);
        const listTagihan = this.getView().byId("tagihanList").getBinding("items").oList;
        const selectedList = listTagihan[oContext]
        
        const oView = this.getView();
        const oModel = { detailTagihan : [ {...selectedList} ]}

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

        const oVizFrame = this.getView().byId("vizPenggunaanAir");
        const oDataset = oVizFrame.getDataset();
        const oDimension = oDataset.getDimensions()[0];

        const oComboBoxTenant = oEvent.getSource();
        const oComboBoxMonth = this.getView().byId("ComboBoxMonth");
        const tenantSelected = oComboBoxTenant.getSelectedKey();

        oFilterTenant = new Filter("tenant", FilterOperator.EQ, tenantSelected);
        oFilterMonth = new Filter("month", FilterOperator.EQ, "Februari");

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
            title: { visible: true, text: "Semua Tenant bulan Februari" },
          });

          oComboBoxMonth.destroyItems();
          itemsForAllTenants.forEach((el) => {
            oComboBoxMonth.addItem(new Item(el));
          });
          oComboBoxMonth.setSelectedKey("Februari");
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
		let oFilterTenant, oFilterMonth, filters;
		const oVizFrame = this.getView().byId("vizPenggunaanAir");
		const oDataset = oVizFrame.getDataset().getBinding("data");

		const oComboBoxMonth = oEvent.getSource();
		const oComboBoxTenant = this.getView().byId("ComboBoxTenant");
		const monthSelected = oComboBoxMonth.getSelectedKey();
		const tenantSelected = oComboBoxTenant.getSelectedKey();

		if (tenantSelected !== '*') {
			oFilterTenant = new Filter("tenant", FilterOperator.EQ, tenantSelected);
			oFilterMonth = new Filter("month", FilterOperator.EQ, monthSelected);
		} else {
			oFilterTenant = [];
			oFilterMonth = new Filter("month", FilterOperator.EQ, monthSelected);
		}

		filters = new Filter({ filters: [oFilterTenant, oFilterMonth], and: true });
		
		oDataset.filter(filters);
		console.log(monthSelected)
	  },

	  onListrikChartTimestamp: function (oEvent) {
		let toDateTimestamp, oFilter;
		const oComboBoxTimestamp = oEvent.getSource();
		const timeStampSelected = oComboBoxTimestamp.getSelectedKey();

		const oVizFrame = this.getView().byId("vizPenggunaanListrik");
		const oDataset = oVizFrame.getDataset().getBinding("data");

		const currentDate = new Date();

		if (timeStampSelected === "6months") {
			toDateTimestamp = new Date(currentDate.getFullYear(), currentDate.getMonth() - 6, currentDate.getDate()).getTime()
			oFilter = new Filter("timeStamp", FilterOperator.BT, toDateTimestamp, currentDate.getTime());
		} else if (timeStampSelected === "1year"){
			toDateTimestamp = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), currentDate.getDate()).getTime()
			oFilter = new Filter("timeStamp", FilterOperator.BT, toDateTimestamp, currentDate.getTime());
		} else {
			toDateTimestamp = new Date(currentDate.getFullYear() - 9999, currentDate.getMonth(), currentDate.getDate()).getTime()
			oFilter = new Filter("timeStamp", FilterOperator.BT, toDateTimestamp, currentDate.getTime());
		}

		oDataset.filter(oFilter);
	  },

      onTagihanSewaDialogRelease: function () {
        let selectedList = [];

        const listTagihanSewa = this.getView().byId("listTagihanSewa").getSelectedItems();
        listTagihanSewa.forEach(el => {
            selectedList.push(el.getBindingContext("tagihanSewa").getObject());
        })

        console.log(selectedList);
      },

      // Dialogs Close
      onTagihanAirDialogClose: function () {
        this.byId("tagihanAirDialog").close();
      },

      onTagihanSewaDialogClose: function () {
        this.byId("tagihanSewaDialog").close();
      },

      onTagihanTerlambatDialogClose: function () {
        this.byId("tagihanTerlambatDialog").close();
      },

      onDetailTagihanClose: function () {
        this.byId("detailListTagihan").close()
      }
    });
  }
);
