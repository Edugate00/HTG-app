sap.ui.define(
  [
    "lrlpapp/controller/BaseController",
    "sap/ui/core/BusyIndicator",
    "sap/m/MessageBox",
  ],
  function (BaseController, BusyIndicator, MessageBox) {
    "use strict";

    let currentMeasurementPoint = null,
      currentMeasurementDescription = null,
      currentMeasurementDateTime = null,
      currentMeasurementReader = null,
      currentMeasurementValue = null;

    let prevMeasurementDoc = null,
      prevMeasurementPoint = null,
      prevMeasurementDescription = null,
      prevMeasurementDateTime = null,
      prevMeasurementValue = null,
      prevMeasurementReader = null;

    let oModel = null;

    return BaseController.extend("lrlpapp.controller.Utility", {
      onInit: function () {
        // current kwh
        currentMeasurementPoint = this.getView().byId("CurrentMeasPoint");
        // currentMeasurementDescription = this.getView().byId("CurrentMeasDescription");
        currentMeasurementValue = this.getView().byId("CurrentMeasValue");
        currentMeasurementDateTime = this.getView().byId("CurrentMeasDateTime");
        currentMeasurementReader = this.getView().byId("CurrentMeasReader");

        // prev kwh
        prevMeasurementDoc = this.getView().byId("PrevMeasDocument");
        prevMeasurementPoint = this.getView().byId("PrevMeasPoint");
        // prevMeasurementDescription = this.getView().byId("PrevMeasDescription");
        prevMeasurementValue = this.getView().byId("PrevMeasValue");
        prevMeasurementDateTime = this.getView().byId("PrevMeasDateTime");
        prevMeasurementReader = this.getView().byId("PrevMeasReader");

        // Retreive services Model
        oModel = this.getOwnerComponent().getModel();

        console.log(oModel);

        const timeInterval = 1000;

        setInterval(() => {
          let currentDate = this.GetCurrentDate(),
            date = currentDate.date,
            time = currentDate.time,
            fulltime = `${date} / ${time}`;

          // set current date and time
          currentMeasurementDateTime.setText(fulltime);
        }, timeInterval);
      },

      onScanSuccess: async function (oEvent) {
        let scanResult = oEvent.getParameter("text");

        if (scanResult) {
          currentMeasurementPoint.setValue(scanResult);
        } else {
          currentMeasurementPoint.setValue("");
        }

        // call function odata read
        let response = await this.ReadOdataMeasDocument(scanResult),
          data = response.result;

        // check return value
        if (data.Document) {
          // call function set text
          this.SetLabelPrevMeasurement(
            data.Document,
            data.Point,
            // data.Description,
            data.Value,
            data.Unit,
            data.Date,
            data.Time,
            data.Reader
          );
        } else {
          MessageBox.error("Measurement point not found.");

          this.SetLabelPrevMeasurement("-", "-", "-", "-", "-", "-", "-");
        }
      },

      onScanError: function (oEvent) {
        // show message
        MessageBox.error("Scan failed");
      },

      // onAfterRendering: function () {
      //   var that = this;
      //   jQuery("input").on("keydown", function (evt) {
      //     if (evt.keyCode == 13) {
      //       evt.preventDefault();
      //       that.odataReadprevMeasDoc();
      //     }
      //   });
      // },

      // odataReadprevMeasDoc: async function () {
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
      //     this.setLabelprevKwh(
      //       response.result.MeasurementPoint,
      //       response.result.MeasurementDoc,
      //       response.result.MeasurementValue,
      //       response.result.MeasurementUnit,
      //       `${response.result.ReadingDate} /`,
      //       response.result.ReadingTime,
      //       response.result.Reader
      //     );
      //   } else {
      //     this.setLabelprevKwh("", "", "", "", "", "", "");

      //     MessageBox.error("Measurement point not found.");
      //   }
      // },

      OnPostMeasurement: async function () {
        console.log("post");

        let request = {};

        //  show busy indicator
        // BusyIndicator.show();

        // create request
        request.Point = "000000011443";
        request.Value = "18,412";
        request.Unit = "l";
        request.Date = "20230206";
        request.Time = "160116";
        request.Reader = "ABAP1";
        request.Text = "From ui5";

        console.log(request);

        // call odata request
        let response = await this.CreateOdataMeasDocument(request);
        console.log(response);

        // hide busy indicator
        // BusyIndicator.hide();
      },

      OnScanQR: async function () {
        // show busy indicator
        BusyIndicator.show();

        // call function odata read
        let response = await this.ReadOdataMeasDocument("000000011443"),
          data = response.result;

        console.log(response);
        console.log(data);

        // hide busy indicator
        BusyIndicator.hide();

        // call function set text
        this.SetLabelPrevMeasurement(
          data.Document,
          data.Point,
          // data.Description,
          data.Value,
          data.Unit,
          data.Date,
          data.Time,
          data.Reader
        );
      },

      SetLabelPrevMeasurement: function (
        document,
        point,
        // description,
        value,
        unit,
        date,
        time,
        reader
      ) {
        const convert = this.ConvertDateTime(date, time);
        console.log(convert);
        // set text properties
        prevMeasurementDoc.setText(parseInt(document));
        prevMeasurementPoint.setText(parseInt(point));
        // prevMeasurementDescription.setText(description);
        prevMeasurementValue.setText(`${value} ${unit}`);
        prevMeasurementDateTime.setText(`${convert.date} / ${convert.time}`);
        prevMeasurementReader.setText(reader);
      },

      CreateOdataMeasDocument: function (requestData) {
        return new Promise(function (resolve) {
          // oModel.setHeaders({
          //   "content-type": "application/json;odata.metadata=minimal",
          //   accept: "application/json",
          // });
          // oModel.create(
          //   "/measurementDocumentSet",
          //   requestData,
          //   null,
          //   function () {
          //     alert("Create successful");
          //   },
          //   function () {
          //     alert("Create failed");
          //   }
          // );

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

      ConvertDateTime: function (inputDate, inputTime) {
        // Convert YYYYMMDD to DD-MM-YYYY
        // Convert Time
        const year = inputDate.substring(0, 4),
          month = inputDate.substring(4, 6),
          day = inputDate.substring(6, 8);

        const hour = inputTime.substring(0, 2),
          minute = inputTime.substring(2, 4),
          second = inputTime.substring(4, 6);

        const date = `${day}-${month}-${year}`,
          time = `${hour}:${minute}:${second}`;

        return { date, time };
      },
    });
  }
);
