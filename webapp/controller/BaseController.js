sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/ui/core/UIComponent",
  ],
  function (Controller, History, UIComponent) {
    "use strict";
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
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Des",
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
        return new Promise(function (resolve, reject) {
            oData.read(path, {
                urlParameters: {
                    $expand: url,
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
        return new Promise(function (resolve, reject) {
            oData.create(path, entry, {
                success: function (oData) {
                    resolve(oData);
                },
                error: function (oResult) {
                    reject(oResult);
                }
            })
        })
      }
    });
  }
);
