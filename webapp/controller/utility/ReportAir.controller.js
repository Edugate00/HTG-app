sap.ui.define([
	"lrlpapp/controller/BaseController",
    "sap/ui/model/json/JSONModel"
], function(
	BaseController,
    JSONModel
) {
	"use strict";

    let dataMeasPoint = null;
    let measDocEntity = {};
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
        });

        console.log(FinalDataMeasDoc);

        this.getView().setModel(
          new JSONModel({ measPointList: FinalDataMeasDoc }),
          "MeasPoint"
        );

        },

        onListItemPress: async function (oEvent) {
            const oContext = oEvent
            .getParameter("listItem")
            .getBindingContext("MeasDoc");
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