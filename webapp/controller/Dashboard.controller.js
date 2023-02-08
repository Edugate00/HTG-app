sap.ui.define(
  [
    "lrlpapp/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/viz/ui5/data/DimensionDefinition",
  ],
  function (
    BaseController,
    JSONModel,
    Filter,
    FilterOperator,
    DimensionDefinition
  ) {
    "use strict";

    const dataPenggunaanAir = null;

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

        const penggunaanAir = {
          data: [
            {
              tenant: "Tenant A",
              value: Math.floor(Math.random() * 201),
              month: "January",
            },
            {
              tenant: "Tenant A",
              value: Math.floor(Math.random() * 201),
              month: "Februari",
            },
            {
              tenant: "Tenant A",
              value: Math.floor(Math.random() * 201),
              month: "Maret",
            },
            {
              tenant: "Tenant A",
              value: Math.floor(Math.random() * 201),
              month: "April",
            },
            {
              tenant: "Tenant A",
              value: Math.floor(Math.random() * 201),
              month: "Mei",
            },
            {
              tenant: "Tenant A",
              value: Math.floor(Math.random() * 201),
              month: "Juni",
            },
            {
              tenant: "Tenant A",
              value: Math.floor(Math.random() * 201),
              month: "Juli",
            },
            {
              tenant: "Tenant A",
              value: Math.floor(Math.random() * 201),
              month: "Agustus",
            },
            {
              tenant: "Tenant A",
              value: Math.floor(Math.random() * 201),
              month: "September",
            },
            {
              tenant: "Tenant A",
              value: Math.floor(Math.random() * 201),
              month: "Oktober",
            },
            {
              tenant: "Tenant A",
              value: Math.floor(Math.random() * 201),
              month: "November",
            },
            {
              tenant: "Tenant A",
              value: Math.floor(Math.random() * 201),
              month: "Desember",
            },
            {
              tenant: "Tenant B",
              value: Math.floor(Math.random() * 201),
              month: "January",
            },
            {
              tenant: "Tenant B",
              value: Math.floor(Math.random() * 201),
              month: "Februari",
            },
            {
              tenant: "Tenant B",
              value: Math.floor(Math.random() * 201),
              month: "Maret",
            },
            {
              tenant: "Tenant B",
              value: Math.floor(Math.random() * 201),
              month: "April",
            },
            {
              tenant: "Tenant B",
              value: Math.floor(Math.random() * 201),
              month: "Mei",
            },
            {
              tenant: "Tenant B",
              value: Math.floor(Math.random() * 201),
              month: "Juni",
            },
            {
              tenant: "Tenant B",
              value: Math.floor(Math.random() * 201),
              month: "Juli",
            },
            {
              tenant: "Tenant B",
              value: Math.floor(Math.random() * 201),
              month: "Agustus",
            },
            {
              tenant: "Tenant B",
              value: Math.floor(Math.random() * 201),
              month: "September",
            },
            {
              tenant: "Tenant B",
              value: Math.floor(Math.random() * 201),
              month: "Oktober",
            },
            {
              tenant: "Tenant B",
              value: Math.floor(Math.random() * 201),
              month: "November",
            },
            {
              tenant: "Tenant B",
              value: Math.floor(Math.random() * 201),
              month: "Desember",
            },
            {
              tenant: "Tenant C",
              value: Math.floor(Math.random() * 201),
              month: "January",
            },
            {
              tenant: "Tenant C",
              value: Math.floor(Math.random() * 201),
              month: "Februari",
            },
            {
              tenant: "Tenant C",
              value: Math.floor(Math.random() * 201),
              month: "Maret",
            },
            {
              tenant: "Tenant C",
              value: Math.floor(Math.random() * 201),
              month: "April",
            },
            {
              tenant: "Tenant C",
              value: Math.floor(Math.random() * 201),
              month: "Mei",
            },
            {
              tenant: "Tenant C",
              value: Math.floor(Math.random() * 201),
              month: "Juni",
            },
            {
              tenant: "Tenant C",
              value: Math.floor(Math.random() * 201),
              month: "Juli",
            },
            {
              tenant: "Tenant C",
              value: Math.floor(Math.random() * 201),
              month: "Agustus",
            },
            {
              tenant: "Tenant C",
              value: Math.floor(Math.random() * 201),
              month: "September",
            },
            {
              tenant: "Tenant C",
              value: Math.floor(Math.random() * 201),
              month: "Oktober",
            },
            {
              tenant: "Tenant C",
              value: Math.floor(Math.random() * 201),
              month: "November",
            },
            {
              tenant: "Tenant C",
              value: Math.floor(Math.random() * 201),
              month: "Desember",
            },
          ],
        };

        // const penggunaanAir = {data: [
        //     {tenant: "tenant1", value: "105", month: "January"},
        //     {tenant: "tenant2", value: "148", month: "January"},
        //     {tenant: "tenant3", value: "204", month: "January"},
        //     {tenant: "tenant4", value: "124", month: "January"},
        //     {tenant: "tenant5", value: "156", month: "January"},
        //     {tenant: "tenant6", value: "172", month: "January"}
        // ]}

        const penggunaanAirModel = new JSONModel(penggunaanAir);
        oVizFrame.setModel(penggunaanAirModel, "penggunaanAir");
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
