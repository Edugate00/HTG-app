sap.ui.define(
  [
    "lrlpapp/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/viz/ui5/data/DimensionDefinition",
    "sap/ui/core/Item",
	"sap/ui/core/Fragment"
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
      {key: "3bulan", text: "3 Bulan"},
      {key: "6bulan", text: "6 Bulan"},
      {key: "1tahun", text: "1 Tahun"},
      {key: "*", text: "Semua"},
    ];

    const itemsForAllTenants = [
      {key: "1", text: "Januari"},
      {key: "2", text: "Februari"},
      {key: "3", text: "Maret"},
      {key: "4", text: "April"},
      {key: "5", text: "Mei"},
      {key: "6", text: "Juni"},
      {key: "7", text: "Juli"},
      {key: "8", text: "Agustus"},
      {key: "9", text: "September"},
      {key: "10", text: "Oktober"},
      {key: "11", text: "November"},
      {key: "12", text: "Desember"},
    ];

    return BaseController.extend("lrlpapp.controller.Dashboard", {
      onInit: function () {
        const oTitle = new JSONModel({
          pageTitle: "<h2 style='color: #fff'>Dashboard</h2>",
        });
        this.getView().setModel(oTitle);
        const oTagihan = [];
        const tagihan = this.getOwnerComponent().getModel("tagihan").getData();
        tagihan.data.forEach(el => {
            if (el.status === "paid"){
              el.status = "Sudah dibayar";
              el.tipeStatus = "Success";
            } else {
              el. status = "Belum dibayar";
              el.tipeStatus = "Error";
            }
            oTagihan.push(el)
        })

        this.getView().setModel(new JSONModel({ tagihan: oTagihan }), "tagihan");

        // Vizframe chart for Penggunaan Air
        const vizAir = this.getView().byId("vizPenggunaanAir");
        const vizListrik = this.byId("vizPenggunaanListrik")
        

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

        const penggunaanAir = this.getOwnerComponent().getModel("penggunaanAir").getData();
        const penggunaanAirModel = new JSONModel(penggunaanAir);
        const oComboBoxTenant = this.getView().byId("ComboBoxTenant");

        const tileTagihanAir = this.getView().byId("tileTagihanAir");
        const tileTagihanSewa = this.getView().byId("tileTagihanSewa");

        tileTagihanAir.attachBrowserEvent("click", this._onTagihanAirClick, this);
        tileTagihanSewa.attachBrowserEvent("click", this._onTagihanSewaClick, this);

        vizListrik.setVisible(false);
        vizAir.setModel(penggunaanAirModel, "penggunaanAir");
        // oComboBoxTenant.fireSelectionChange();
      },

      _onTagihanAirClick: function (oEvent) {
        const oView = this.getView();
        const oTagihanAirModel = [
          {nama: "Tenant A", noTagihan: "90046015", dueDate: "09 Feb, 2023"},
          {nama: "Tenant B", noTagihan: "90046016", dueDate: "09 Feb, 2023"},
          {nama: "Tenant C", noTagihan: "90046017", dueDate: "09 Feb, 2023"},
          {nama: "Tenant D", noTagihan: "90046018", dueDate: "09 Feb, 2023"},
          {nama: "Tenant E", noTagihan: "90046019", dueDate: "09 Feb, 2023"}
        ];

        if (!this.tagihanAirDialog) {
          this.tagihanAirDialog = Fragment.load({
              id: oView.getId(),
              name: "lrlpapp.view.fragments.TagihanAirDialog",
              controller: this,
          }).then(function (oDialog) {
            oDialog.setModel(oView.getModel());
            oDialog.setModel(new JSONModel({ 
              tagihanAir: oTagihanAirModel
            }), "tagihanAir");
            return oDialog;
          })
        }

        this.tagihanAirDialog.then(function(oDialog) {
          oDialog.setModel(oView.getModel());
            oDialog.setModel(new JSONModel({ 
              tagihanAir: oTagihanAirModel
            }), "tagihanAir");
            
            oDialog.open();
        })
      },

      _onTagihanSewaClick: function (oEvent) {
        const oView = this.getView();
        const oTagihanSewaModel = [
          {nama: "Tenant A", noTagihan: "90046015", dueDate: "09 Feb, 2023"},
          {nama: "Tenant B", noTagihan: "90046016", dueDate: "09 Feb, 2023"},
          {nama: "Tenant C", noTagihan: "90046017", dueDate: "09 Feb, 2023"}
        ];

        if (!this.tagihanSewaDialog) {
          this.tagihanSewaDialog = Fragment.load({
              id: oView.getId(),
              name: "lrlpapp.view.fragments.TagihanSewaDialog",
              controller: this,
          }).then(function (oDialog) {
            oDialog.setModel(oView.getModel());
            oDialog.setModel(new JSONModel({ 
              tagihanAir: oTagihanSewaModel
            }), "tagihanAir");
            return oDialog;
          })
        }

        this.tagihanSewaDialog.then(function(oDialog) {
          oDialog.setModel(oView.getModel());
            oDialog.setModel(new JSONModel({ 
              tagihanAir: oTagihanSewaModel
            }), "tagihanAir");
            
            oDialog.open();
        })
      },

      onTagihanTenantSelected: function (oEvent) {
        let oFilter1, oFilter2, oFilters;
        const oComboBoxTenant = oEvent.getSource();
        const oComboBoxStatus = this.getView().byId("ComboBoxTagihanStatus");
        const tenantSelected = oComboBoxTenant.getSelectedKey();
        const statuSelected = oComboBoxStatus.getSelectedKey();

        const tagihanList = this.byId("tagihanList");

        if (tenantSelected !== "*") {
          oFilter1 = new Filter("tenant", FilterOperator.EQ, tenantSelected);
        } else {
          oFilter1 = []
        }

        if (statuSelected === "paid") {
          oFilter2 = new Filter("status", FilterOperator.EQ, "Sudah dibayar");
        } else if (statuSelected === "unpaid") {
          oFilter2 = new Filter("status", FilterOperator.EQ, "Belum dibayar")
        } else {
          oFilter2 = [];
        }

        oFilters = new Filter({filters: [oFilter1, oFilter2], and: true})
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
          oFilter1 = new Filter("status", FilterOperator.EQ, "Sudah dibayar");
        } else if (statuSelected === "unpaid") {
          oFilter1 = new Filter("status", FilterOperator.EQ, "Belum dibayar")
        } else {
          oFilter1 = [];
        }

        if (tenantSelected !== "*") {
          oFilter2 = new Filter("tenant", FilterOperator.EQ, tenantSelected);
        } else {
          oFilter2 = []
        }

        oFilters = new Filter({filters: [oFilter1, oFilter2], and: true})
        tagihanList.getBinding("items").filter(oFilters);
      },

      onUtilitiSelected: function(oEvent) {
        const oComboBoxUtility = oEvent.getSource();
        const utilitySelected = oComboBoxUtility.getSelectedKey();
        const vizAir = this.byId("vizPenggunaanAir")
        const vizListrik = this.byId("vizPenggunaanListrik")

        const utilityCardTitle = this.byId("utilityTitle");

        if (utilitySelected === "air") {
          utilityCardTitle.setText("Penggunaan Air")
          vizAir.setVisible(true);
          vizListrik.setVisible(false);
        } else {
          utilityCardTitle.setText("Penggunaan Listirk")
          vizAir.setVisible(false);
          vizListrik.setVisible(true);
        }
      },

      onTenantSelected: function (oEvent) {
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
          itemsForTenant.forEach(el => {
            oComboBoxMonth.addItem(new Item(el));
          })
          oComboBoxMonth.setSelectedKey("3bulan")
          oDataset.removeDimension(oDimension);

          const oNewDimension = new DimensionDefinition({
            name: "Category", value: "{penggunaanAir>month}"
          });

          oDataset.addDimension(oNewDimension);
          oDataset.getBinding("data").filter(oFilterTenant);

        } else {
          oVizFrame.setVizType("column");
          oVizFrame.setVizProperties({
            title: { visible: true, text: "Semua Tenant bulan Februari" },
          });

          oComboBoxMonth.destroyItems();
          itemsForAllTenants.forEach(el => {
            oComboBoxMonth.addItem(new Item(el));
          })
          oComboBoxMonth.setSelectedKey("2")
          oDataset.removeDimension(oDimension);

          oDataset.removeDimension(oDimension);
          const oNewDimension = new DimensionDefinition({
            name: "Category", value: "{penggunaanAir>tenant}"
          });
          oDataset.addDimension(oNewDimension);
          oDataset.getBinding("data").filter(oFilterMonth);
        }
      },

      // Dialogs Close
      onTagihanAirDialogClose: function() {
        this.byId("tagihanAirDialog").close()
      },
      onTagihanSewaDialogClose: function() {
        this.byId("tagihanSewaDialog").close()
      }
    });
  }
);
