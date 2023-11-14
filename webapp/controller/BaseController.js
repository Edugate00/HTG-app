sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/ui/core/BusyIndicator",
    "sap/m/MessageBox",
  ],
  function (Controller, History, UIComponent, JSONModel, Fragment, BusyIndicator, MessageBox) {
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
        const arr = originalTime.split("");
        const h = `${arr[0]}${arr[1]}`;
        const m = `${arr[2]}${arr[3]}`;
        const s = `${arr[4]}${arr[5]}`;

        return `${h}:${m}`;
      },

      getFormattedDate: function (originalDate) {
        let year, month, day;
        const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

        if (Number(originalDate.substring(4, 6)) <= 9) {
          month = months[originalDate.substring(5, 6) - 1];
        } else {
          month = months[originalDate.substring(4, 6) - 1];
        }

        year = originalDate.substring(0, 4);
        day = originalDate.substring(6, 8);

        return `${day} ${month}, ${year}`;
      },

      getShortFormattedDate: function (originalDate) {
        let year, month, day;
        const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

        if (Number(originalDate.substring(4, 6)) <= 9) {
          month = months[originalDate.substring(5, 6) - 1];
        } else {
          month = months[originalDate.substring(4, 6) - 1];
        }

        year = originalDate.substring(0, 4);
        day = originalDate.substring(6, 8);

        return `${day} ${month}, ${year}`;
      },

      getMonth: function (month) {
        const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

        if (!month) return months;
        return months[month];
      },

      readOdataService: function (path, url) {
        // BusyIndicator.setText("...Tunggu bos");
        BusyIndicator.show();
        oModel = this.getOwnerComponent().getModel();
        return new Promise(function (resolve, reject) {
          oModel.read(path, {
            urlParameters: {
              $expand: url,
            },
            success: function (oData) {
              resolve(oData);
              BusyIndicator.hide();
            },
            error: function (oResult) {
              reject(oResult);
              BusyIndicator.hide();
            },
          });
        });
      },

      errorMessageBox: function (msg, title, fnOnClose) {
        MessageBox.show(msg, {
          icon: MessageBox.Icon.ERROR,
          title: title,
          actions: [MessageBox.Action.CLOSE],
          emphasizedAction: MessageBox.Action.CLOSE,
          onClose: fnOnClose,
        });
      },

      successMessageBox: function (msg, title, fnOnClose) {
        MessageBox.show(msg, {
          icon: MessageBox.Icon.SUCCESS,
          title: title,
          actions: [MessageBox.Action.CLOSE, MessageBox.Action],
          emphasizedAction: MessageBox.Action.CLOSE,
          onClose: fnOnClose,
        });
      },

      createOdataService: function (path, entry) {
        BusyIndicator.show();
        oModel = this.getOwnerComponent().getModel();
        return new Promise(function (resolve, reject) {
          oModel.create(path, entry, {
            success: function (oData) {
              resolve(oData);
              BusyIndicator.hide();
            },
            error: function (oResult) {
              reject(oResult);
              BusyIndicator.hide();
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

      isDueDate: function (timeStamp) {
        const now = Date.now();
        const tenDaysFromNow = now + 10 * 24 * 60 * 60 * 1000;

        return timeStamp >= now && timeStamp < tenDaysFromNow;
      },

      hasPassed: function (timeStamp) {
        const now = Date.now();
        return timeStamp < now;
      },

      getDueDate: function (dateString, days) {
        // Parse the input date string into a Date object
        const date = new Date(dateString.substr(0, 4), parseInt(dateString.substr(4, 2)) - 1, dateString.substr(6, 2));

        // Add the specified number of days to the date
        date.setDate(date.getDate() + days);

        // Format the new date as a string in the format YYYYMMDD
        const year = date.getFullYear().toString();
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");
        return year + month + day;
      },

      openFragment: function (dialogName, fragmentName, model, modelAlias) {
        const oView = this.getView();

        if (!this.dialogName) {
          this.dialogName = Fragment.load({
            id: oView.getId(),
            name: `lrlpapp.view.fragments.${fragmentName}`,
            controller: this,
          }).then(function (oDialog) {
            oDialog.setModel(oView.getModel());
            oDialog.setModel(new JSONModel(model), modelAlias);
            return oDialog;
          });
        }

        this.dialogName.then(function (oDialog) {
          oDialog.setModel(oView.getModel());
          oDialog.setModel(new JSONModel(model), modelAlias);
          oDialog.open();
        });
      },

      RequestReadWithOutExpanded: function (path) {
        const oModel = this.getOwnerComponent().getModel();

        BusyIndicator.show();

        return new Promise(function (resolve, reject) {
          oModel.read(path, {
            success: function (oData) {
              resolve(oData);
              BusyIndicator.hide();
            },
            error: function (oResult) {
              reject(oResult);
              BusyIndicator.hide();
            },
          });
        });
      },

      RequestReadWithFilter: function (path, url) {
        const oModel = this.getOwnerComponent().getModel();

        return new Promise(function (resolve, reject) {
          oModel.read(path, {
            urlParameters: {
              $filter: url,
            },
            success: function (oData) {
              resolve(oData);
            },
            error: function (oResult) {
              reject(oResult);
            },
          });
        });
      },
    });
  }
);
