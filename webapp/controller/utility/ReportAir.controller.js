sap.ui.define([
	"lrlpapp/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
], function(
	BaseController,
    JSONModel,
    Filter,
    FilterOperator
) {
	"use strict";

    let dataMeasPoint = null;
    let oModel = null;

	return BaseController.extend("lrlpapp.controller.utility.ReportAir", 
    {
        onInit: async function () {
          let measDoc1, measDoc=[];

          oModel = this.getOwnerComponent().getModel();
          const response = await this.ReadOdataMeasDocument();
          dataMeasPoint = response.result.results;
          
          measDoc1 = dataMeasPoint.map((el) => el.MeasPointToMeasDoc.results);
          measDoc = this.flattenedArr(measDoc1);
          let DataMeasDoc = [];

          let FinalDataMeasDoc = measDoc.map(targetItem => {
            const sourceItem = dataMeasPoint.find(source => source.Point === targetItem.Point);
            if (sourceItem) {
              return { ...targetItem, Description: sourceItem.Description,
                                      Position: sourceItem.Position,
                                      Text: sourceItem.Text, };
            }
            return targetItem;
          });

          FinalDataMeasDoc.forEach((el) => {
            el.Point = el.Point.slice(6);
            el.Document = el.Document.slice(14);
            el.Date = this.getFormattedDate(el.Date);
            el.Time = this.getFormattedTime(el.Time);
          });
          
          console.log(FinalDataMeasDoc);

          this.getView().setModel(
            new JSONModel({ measPointList: FinalDataMeasDoc }),
            "MeasPoint"
          );

          const tenant = FinalDataMeasDoc.map(el => el.Text);
          const listTenant = tenant.filter((el, index) => tenant.indexOf(el) === index);
          const fixTenant = listTenant.map((text, index) => ({
            name: text,
            id: text
          }));

          let defaultItem = {name: 'Semua Tenant', id: '*'};
          fixTenant.push(defaultItem);
          
          this.getView().setModel(new JSONModel({ tenantList: fixTenant }), "Tenant");
        },

        onListItemPress: async function (oEvent) {
            const oContext = oEvent.getParameter("listItem").getBindingContext("MeasDoc");
        },

        openFilterDialog: function() {
          const oView = this.getView();
          let oDialog = oView.byId("filterDialog");

          // Create dialog lazily
          if (!oDialog) {
              // create dialog via fragment factory
              oDialog = sap.ui.xmlfragment(oView.getId(), "lrlpapp.view.fragments.Filter", this);
              oView.addDependent(oDialog);
          }
          oDialog.open();
        },

        onTenantFilter: function(oEvent) {
          let oFilter1, oFilter2, oFilters;
          const oComboBoxTenant = oEvent.getSource();
          const oComboBoxMonth = this.getView().byId("ComboBoxFilterMonth");
          const tenantSelected = oComboBoxTenant.getSelectedKey();
          const monthSelected = oComboBoxMonth.getSelectedKey();
          const measDocList = this.byId("measdocList");

          if (tenantSelected !== "*") {
            oFilter1 = new Filter("Text", FilterOperator.EQ, tenantSelected);
          } else {
            oFilter1 = [];
          }

          if (monthSelected !== "*") {
            oFilter2 = new Filter("Date", FilterOperator.Contains, monthSelected);
          } else {
            oFilter2 = [];
          }

          oFilters = new Filter({ filters: [oFilter1, oFilter2], and: true });
          measDocList.getBinding("items").filter(oFilters);
        },

        onMonthFilter: function(oEvent) {
          let oFilter1, oFilter2, oFilters;
          const oComboBoxMonth = oEvent.getSource();
          const oComboBoxTenant = this.getView().byId("ComboBoxFilterTenant");
          const monthSelected = oComboBoxMonth.getSelectedKey();
          const tenantSelected = oComboBoxTenant.getSelectedKey();
          const measDocList = this.byId("measdocList");

          if (monthSelected !== "*") {
            oFilter1 = new Filter("Date", FilterOperator.Contains, monthSelected);
          } else {
            oFilter1 = [];
          }

          if (tenantSelected !== "*") {
            oFilter2 = new Filter("Text", FilterOperator.EQ, tenantSelected);
          } else {
            oFilter2 = [];
          }

          oFilters = new Filter({ filters: [oFilter1, oFilter2], and: true });
          measDocList.getBinding("items").filter(oFilters);
        },


        ReadOdataMeasDocument: function () {
            return new Promise(function (resolve) {
                oModel.read(`/measurementPointSet`, {
                  urlParameters: {
                    $expand: "MeasPointToMeasDoc",
                  },
                  success: function (oResponse) {
                    console.log("Call answered by server");
                    resolve({ result: oResponse });
                  },
                  error: function (error) {
                    resolve({ result: error });
                  },
              });
            });
        },
        
        flattenedArr: function (arr) {
          let flat = [];
          for (let i = 0; i < arr.length; i++) {
            flat = flat.concat(arr[i]);
          }
          return flat;
        },

	});
});