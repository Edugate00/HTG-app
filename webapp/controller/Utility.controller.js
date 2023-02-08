sap.ui.define(
  [
    "lrlpapp/controller/BaseController",
    "sap/m/MessageBox",
    "sap/ui/core/BusyIndicator",
  ],
  function (BaseController) {
    "use strict";

    let currentMeasPoint = null,
      currentMeasValue = null,
      currentMeasDateTime = null,
      currentMeasReader = null;

    let lastMeasPoint = null,
      lastMeasDoc = null,
      lastMeasValue = null,
      lastMeasDateTime = null,
      lastMeasRead = null,
      oModel = null;

    return BaseController.extend("lrlpapp.controller.Utility", {
      onInit: function () {
        // current kwh
        currentMeasPoint = this.getView().byId("CurrentMeasPoint");
        currentMeasValue = this.getView().byId("CurrentMeasValue");
        currentMeasDateTime = this.getView().byId("CurrentMeasDateTime");
        currentMeasReader = this.getView().byId("CurrentMeasReader");

        // last kwh
        lastMeasPoint = this.getView().byId("PreviousMeasPoint");
        lastMeasDoc = this.getView().byId("PreviousMeasDocument");
        lastMeasValue = this.getView().byId("PreviousMeasValue");
        lastMeasDateTime = this.getView().byId("PreviousMeasDateTime");
        lastMeasRead = this.getView().byId("PreviousMeasReading");

        // Retreive services Model
        oModel = this.getOwnerComponent().getModel();

        console.log(oModel);

        const timeInterval = 1000;

        setInterval(() => {
          let currentDate = this.GetCurrentDate(),
            date = currentDate.date,
            time = currentDate.time,
            fulltime = `${date} - ${time}`;

          // set current date and time
          currentMeasDateTime.setText(fulltime);
        }, timeInterval);
      },

      // onScanSuccess: async function (oEvent) {
      //   let result = oEvent.getParameter("text");

      //   if (result) {
      //     currentMeasPoint.setValue(result);
      //   } else {
      //     currentMeasPoint.setValue("");
      //   }

      //   // call odata request
      //   var response = await this.readOdataService(result);
      //   console.log(response);

      //   // check return value
      //   if (response.result.MeasurementDoc) {
      //     this.setLabelLastKwh(
      //       response.result.MeasurementPoint,
      //       response.result.MeasurementDoc,
      //       response.result.MeasurementValue,
      //       response.result.MeasurementUnit,
      //       `${response.result.ReadingDate} /`,
      //       response.result.ReadingTime,
      //       response.result.Reader
      //     );
      //   } else {
      //     this.setLabelLastKwh("", "", "", "", "", "", "");

      //     MessageBox.error("Measurement point not found.");
      //   }
      // },

      // onScanError: function (oEvent) {
      //   // show message
      //   MessageBox.error("Scan failed");
      // },

      // onButtonPress: async function () {
      //   // window.location.replace(
      //   //   "https://sap5.edugate.web.id:8028/sap/bc/ui5_ui5/sap/zik11/index.html?sap-client=388"
      //   // );

      //   let request = {},
      //     response = null;

      //   //  show busy indicator
      //   BusyIndicator.show();

      //   // create request
      //   request.MeasurementPoint = currentMeasPoint.getValue();
      //   request.MeasurementUnit = "KW";
      //   request.MeasurementValue = currentMeasValue
      //     .getValue()
      //     .replace(".", ",");
      //   request.Reader = currentMeasReader.getValue();
      //   request.ReadingDate = currentMeasDate
      //     .getValue()
      //     .split("-")
      //     .reverse()
      //     .join(".");
      //   request.ReadingTime = currentMeasTime.getValue();

      //   console.log(request);
      //   // call odata request
      //   response = await this.createOdataService(request);
      //   console.log(response);

      //   // hide busy indicator
      //   BusyIndicator.hide();

      //   // check return value
      //   if (response.result.ReturnCode) {
      //     if (response.result.ReturnCode == "0") {
      //       // show message
      //       MessageBox.success(
      //         `Measurement document : ${response.result.MeasurementDoc} created`,
      //         {
      //           onClose: function () {
      //             // clear current input
      //             currentMeasPoint.setValue("");
      //             currentMeasValue.setValue("");

      //             // clear last kwh
      //             lastMeasPoint.setValue("");
      //             lastMeasDoc.setValue("");
      //             lastMeasValue.setValue("");
      //             lastMeasDateTime.setValue("");
      //             lastMeasRead.setValue("");
      //           },
      //         }
      //       );
      //     } else if (response.result.ReturnCode !== "0") {
      //       // show message
      //       MessageBox.error(response.result.ReturnMessage);
      //     }
      //   } else {
      //     MessageBox.error(response.result.message);
      //   }
      // },

      // onAfterRendering: function () {
      //   var that = this;
      //   jQuery("input").on("keydown", function (evt) {
      //     if (evt.keyCode == 13) {
      //       evt.preventDefault();
      //       that.odataReadLastMeasDoc();
      //     }
      //   });
      // },

      // odataReadLastMeasDoc: async function () {
      //   let request = currentMeasPoint.getValue(),
      //     response = null;

      //   //  show busy indicator
      //   BusyIndicator.show();

      //   // call odata request
      //   response = await this.readOdataService(request);
      //   console.log(response);

      //   // hide busy indicator
      //   BusyIndicator.hide();

      //   // check return value
      //   if (response.result.MeasurementDoc) {
      //     this.setLabelLastKwh(
      //       response.result.MeasurementPoint,
      //       response.result.MeasurementDoc,
      //       response.result.MeasurementValue,
      //       response.result.MeasurementUnit,
      //       `${response.result.ReadingDate} /`,
      //       response.result.ReadingTime,
      //       response.result.Reader
      //     );
      //   } else {
      //     this.setLabelLastKwh("", "", "", "", "", "", "");

      //     MessageBox.error("Measurement point not found.");
      //   }
      // },

      // setLabelLastKwh: function (
      //   measPoint,
      //   measDoc,
      //   measValue,
      //   measUnit,
      //   readDate,
      //   readTime,
      //   reader
      // ) {
      //   lastMeasPoint.setValue(measPoint);
      //   lastMeasDoc.setValue(measDoc);
      //   lastMeasValue.setValue(`${measValue} ${measUnit}`);
      //   lastMeasDateTime.setValue(`${readDate} ${readTime}`);
      //   lastMeasRead.setValue(reader);
      // },

      OnPostMeasurement: async function () {
        console.log("response");

        // call odata request
        var response = await this.ReadOdataMeasDocument("000000011443");
        console.log(response);
      },

      CreateOdataMeasDocument: function (requestData) {
        return new Promise(function (resolve) {
          oModel.create("/measurementDocumentSet", requestData, {
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

      ReadOdataMeasDocument: function (requestData) {
        return new Promise(function (resolve) {
          oModel.read(`/measurementDocumentSet(Point='${requestData}')`, {
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

      GetCurrentDate: function () {
        let now = new Date(),
          year = now.getFullYear(),
          month = now.getMonth() + 1,
          day = now.getDate(),
          hour = now.getHours(),
          minute = now.getMinutes(),
          second = now.getSeconds();

        if (month.toString().length == 1) {
          month = "0" + month;
        }

        if (day.toString().length == 1) {
          day = "0" + day;
        }

        if (hour.toString().length == 1) {
          hour = "0" + hour;
        }

        if (minute.toString().length == 1) {
          minute = "0" + minute;
        }

        if (second.toString().length == 1) {
          second = "0" + second;
        }

        const date = `${day}-${month}-${year}`,
          time = `${hour}:${minute}:${second}`;

        return { date, time };
      },
    });
  }
);
