sap.ui.define(
  [
    "lrlpapp/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/viz/ui5/data/DimensionDefinition",
    "sap/ui/core/Item"
  ],
  function (
    BaseController,
	JSONModel,
	Filter,
	FilterOperator,
	DimensionDefinition,
	Item
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

        // Vizframe chart for Penggunaan Air
        const oVizFrame = this.getView().byId("vizPenggunaanAir");
        oVizFrame.setVizProperties({
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

        const penggunaanAir = this.getOwnerComponent().getModel("penggunaanAir").getData();

        const penggunaanAirModel = new JSONModel(penggunaanAir);
        const oComboBoxTenant = this.getView().byId("ComboBoxTenant");
        oVizFrame.setModel(penggunaanAirModel, "penggunaanAir");
        oComboBoxTenant.fireSelectionChange();
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
    });
  }
);
