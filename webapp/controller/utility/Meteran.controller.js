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

    return BaseController.extend("lrlpapp.controller.utility.Meteran", {
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

        // set width card
        // const cardPindai = this.getView().byId("cardPindai");
        // const widthWindow = window.screen.width;

        // if (widthWindow > 576) {
        //   cardPindai.setWidth("30%");
        // }

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
        // show busy indicator
        BusyIndicator.show();

        let scanResult = oEvent.getParameter("text");

        if (scanResult) {
          currentMeasurementPoint.setValue(scanResult);
        } else {
          currentMeasurementPoint.setValue("");
        }

        // call function odata read
        const fullPoint = scanResult.padStart(12, "0");
        const response = await this.ReadOdataMeasDocument(fullPoint);
        const data = response.result;

        console.log(response);
        console.log(data);

        const convert = this.ConvertDateTime(data.Date, data.Time);
        const fullDate = `${convert.date} / ${convert.time}`;

        const intDocument = parseInt(data.Document);
        const intPoint = parseInt(data.Point);
        const valueUnit = `${data.Value} ${data.Unit}`;

        // check return value
        if (data.Document) {
          // call function set text
          this.SetLabelPrevMeasurement(
            intDocument,
            intPoint,
            // data.Description,
            valueUnit,
            fullDate,
            data.Reader
          );
        } else {
          MessageBox.error("Measurement point not found.");

          this.SetLabelPrevMeasurement("-", "-", "-", "-", "-");
        }

        // hide busy indicator
        BusyIndicator.hide();
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

      OnPostMeasurement: async function () {
        console.log("post");
        class InputRequest {
          constructor(point, value, unit, date, time, reader, text) {
            this.Point = point;
            this.Value = value;
            this.Unit = unit;
            this.Date = date;
            this.Time = time;
            this.Reader = reader;
            this.Text = text;
          }
        }

        //  show busy indicator
        BusyIndicator.show();

        const inputPoint = currentMeasurementPoint.getValue();
        const inputDateTime = currentMeasurementDateTime.getText();
        const splitDateTime = inputDateTime.split("/");
        const convertDate = splitDateTime[0]
          .split("-")
          .reverse()
          .join("")
          .replace(/\s/g, ""); // remove spaces
        const convertTime = splitDateTime[1]
          .split(":")
          .join("")
          .replace(/\s/g, ""); // remove spaces;
        const inputValue = currentMeasurementValue.getValue().replace(".", ",");
        const inputReader = currentMeasurementReader.getText();

        const request = new InputRequest(
          inputPoint,
          inputValue,
          "l",
          convertDate,
          convertTime,
          inputReader,
          "from ui5"
        );

        console.log(request);

        // call odata request
        const response = await this.CreateOdataMeasDocument(request);
        const data = response.result;

        console.log(response);
        console.log(data);

        // hide busy indicator
        BusyIndicator.hide();

        if (!data.Document) {
          MessageBox.error(data.Message);
        } else {
          MessageBox.success(
            `${data.Message}, Measurement Document ${parseInt(
              data.Document
            )} created.`
          );
        }
      },

      SetLabelPrevMeasurement: function (
        document,
        point,
        // description,
        valueUnit,
        dateTime,
        reader
      ) {
        // set text properties
        prevMeasurementDoc.setText(document);
        prevMeasurementPoint.setText(point);
        // prevMeasurementDescription.setText(description);
        prevMeasurementValue.setText(valueUnit);
        prevMeasurementDateTime.setText(dateTime);
        prevMeasurementReader.setText(reader);
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
          minute = now.getMinutes() - 1,
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
