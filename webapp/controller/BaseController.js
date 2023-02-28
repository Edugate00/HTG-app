sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
  ],
  function (Controller,
	History,
	UIComponent,
	JSONModel,
	Fragment) {
    "use strict";

    let oModel = null;
    return Controller.extend("lrlpapp.controller.BaseController", {
      getRouter: function () {
        return UIComponent.getRouterFor(this);
      },

      onNavBack: function () {
        let oHistory, sPreviousHash;

        oHistory = History.getInstance();
        sPreviousHash = oHistory.getPreviousHash();

        if (sPreviousHash !== undefined) {
          window.history.go(-1);
        } else {
          this.getRouter().navTo("dashboard", {}, { true: true });
        }
      },

      getFormattedTime: function (originalTime) {
        // Original Time "170000"
        // Change to "17:00:00"
        const arr = originalTime.split("")
        const h = `${arr[0]}${arr[1]}`;
        const m = `${arr[2]}${arr[3]}`;
        const s = `${arr[4]}${arr[5]}`;

        return `${h}:${m}`;
      },

      getFormattedDate: function (originalDate) {
        let year, month, day;
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

        if (Number(originalDate.substring(4, 6)) <= 9) {
          month = months[originalDate.substring(5, 6) - 1];
        } else {
          month = months[originalDate.substring(4, 6) - 1];
        }

        year = originalDate.substring(0, 4);
        day = originalDate.substring(6, 8);

        return `${day} ${month}, ${year}`;
      },

      readOdataService: function (path, url) {
            oModel = this.getOwnerComponent().getModel();
            return new Promise(function (resolve, reject) {
                oModel.read("/billingHeaderSet", {
                    urlParameters: {
                        $expand: "BillingHeadToItem",
                    },
                    success: function (oData) {
                        resolve(oData)
                    },
                    error: function (oResult) {
                        reject(oResult)
                    }
                });
            })
      },

      createOdataService: function (path, entry) {
        oModel = this.getOwnerComponent().getModel();
            return new Promise(function (resolve, reject) {
                oModel.create(path, entry, {
                    success: function (oData) {
                        resolve(oData);
                    },
                    error: function (oResult) {
                        reject(oResult);
                    }
                })
            })
      },
      
        flattenedArr: function (arr) {
            let flat = [];
            for (let i = 0; i < arr.length; i++) {
                flat = flat.concat(arr[i]);
            }
            return flat;
        },

        openFragment: function (dialogName, fragmentName, model, modelAlias) {
            if (!dialogName) {
                dialogName = Fragment.load({
                    id: oView.getId(),
                    name: `lrlpapp.view.fragments.${fragmentName}`,
                    controller: this,
                }).then(function (oDialog) {
                    oDialog.setModel(oView.getModel());
                    oDialog.setModel(new JSONModel(model), modelAlias);
                    return oDialog;
                });
                }

                dialogName.then(function (oDialog) {
                oDialog.setModel(oView.getModel());
                oDialog.setModel(new JSONModel(model), modelAlias);
                oDialog.open();
            });
        }
    });
  }
);
