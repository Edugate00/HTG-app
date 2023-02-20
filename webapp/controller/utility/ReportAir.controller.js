sap.ui.define([
	"lrlpapp/controller/BaseController",
    "sap/ui/model/json/JSONModel"
], function(
	BaseController,
    JSONModel
) {
	"use strict";

    let dataMeasDoc = null;

    let oModel = null;

	return BaseController.extend("lrlpapp.controller.utility.ReportAir", 
    {
        onInit: async function () {
        oModel = this.getOwnerComponent().getModel();
        const response = await this.ReadOdataMeasDocument();
        dataMeasDoc = response.result;
        const oMeasDoc = new JSONModel(dataMeasDoc);
        this.getView().setModel(oMeasDoc, "MeasDoc");
        
        console.log(oMeasDoc);
        console.log(dataMeasDoc);


        },

        ReadOdataMeasDocument: function () {
            return new Promise(function (resolve) {
                oModel.read(`/measurementDocumentSet`, {
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

	});
});