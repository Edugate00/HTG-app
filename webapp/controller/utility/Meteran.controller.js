sap.ui.define(
  [
    "lrlpapp/controller/BaseController",
    "sap/ui/core/BusyIndicator",
    "sap/m/MessageBox",
  ],
  function (BaseController, BusyIndicator, MessageBox) {
    "use strict";

    let currentMeasurementPoint = null,
      currentMeasurementDateTime = null,
      currentMeasurementValue = null;

    let prevMeasurementDateTime = null,
      prevMeasurementValue = null,
      measurementDescription = null,
      titleTotalPemakaian = null,
      totalPemakaian = null;

    let dataMeasPoint = null,
      dataMeasDoc = null;

    let oModel = null;

    return BaseController.extend("lrlpapp.controller.utility.Meteran", {
      onInit: function () {
        // current measurement
        currentMeasurementPoint = this.getView().byId("CurrentMeasPoint");
        currentMeasurementValue = this.getView().byId("CurrentMeasValue");
        currentMeasurementDateTime = this.getView().byId("CurrentMeasDateTime");

        // prev measurement
        prevMeasurementValue = this.getView().byId("PrevMeasValue");
        prevMeasurementDateTime = this.getView().byId("PrevMeasDateTime");
        measurementDescription = this.getView().byId("MeasDescription");
        totalPemakaian = this.getView().byId("TotalPemakaian");
        titleTotalPemakaian = this.getView().byId("TitleTotalPemakaian");

        // Retreive services Model
        oModel = this.getOwnerComponent().getModel();

        // set width card
        const cardPindai = this.getView().byId("cardPindai");
        const widthWindow = window.screen.width;

        if (widthWindow > 576) {
          cardPindai.setWidth("30%");
        }

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
        dataMeasPoint = response.result;
        dataMeasDoc = dataMeasPoint.MeasPointToMeasDoc.results;

        console.log(response);

        let convert = "-",
          fullDate = "-",
          valueUnit = "-";

        if (dataMeasDoc.length > 0) {
          convert = this.ConvertDateTime(
            dataMeasDoc[0].Date,
            dataMeasDoc[0].Time
          );
          fullDate = `${convert.date} / ${convert.time}`;
          valueUnit = `${
            dataMeasDoc[0].Value
          } ${dataMeasDoc[0].Unit.toLowerCase()}`;
        }

        // check return value
        if (dataMeasPoint.Point) {
          // call function set text
          this.SetLabelPrevMeasurement(
            dataMeasPoint.Description,
            valueUnit,
            fullDate
          );

          // enable input value
          currentMeasurementValue.setEnabled(true);

          // change title text
          if (dataMeasPoint.Uom.toLowerCase() == "m3") {
            titleTotalPemakaian.setText("Total Pemakaian Air");
          } else {
            titleTotalPemakaian.setText("Total Pemakaian Listrik");
          }
        } else {
          // message
          MessageBox.error("Measurement point not found.", {
            onClose: function () {
              window.location.reload();
            },
          });

          // // call function set text
          // this.SetLabelPrevMeasurement("-", "-", "-");

          // // disable input value
          // currentMeasurementValue.setEnabled(false);

          // // change title text
          // titleTotalPemakaian.setText("Total Pemakaian");
        }

        // hide busy indicator
        BusyIndicator.hide();
      },

      onScanError: function (oEvent) {
        // show message
        MessageBox.error("Scan failed", {
          onClose: function () {
            window.location.reload();
          },
        });
      },

      OnPostMeasurement: async function () {
        console.log("post");
        class InputRequest {
          constructor(point, value, unit, date, time) {
            this.Point = point;
            this.Value = value;
            this.Unit = unit;
            this.Date = date;
            this.Time = time;
          }
        }

        //  show busy indicator
        BusyIndicator.show();

        const inputPoint = currentMeasurementPoint.getValue().padStart(12, "0");
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

        // cek input
        if (inputPoint && inputValue) {
          const inputUnit = dataMeasPoint.Uom.toLowerCase();

          const request = new InputRequest(
            inputPoint,
            inputValue,
            inputUnit,
            convertDate,
            convertTime
          );

          console.log(request);

          // call odata request
          const response = await this.CreateOdataMeasDocument(request);
          const data = response.result;

          console.log(response);
          console.log(data);

          if (!data.Document) {
            MessageBox.error(data.Message, {
              onClose: function () {
                window.location.reload();
              },
            });
          } else {
            MessageBox.success(
              `Dokumen pengukuran ${parseInt(data.Document)} terbuat.`,
              {
                onClose: function () {
                  window.location.reload();
                },
              }
            );
          }
        } else {
          MessageBox.error("Input tidak boleh kosong.");
        }

        // hide busy indicator
        BusyIndicator.hide();
      },

      SetLabelPrevMeasurement: function (description, valueUnit, dateTime) {
        // set text properties
        measurementDescription.setText(description);
        prevMeasurementValue.setText(valueUnit);
        prevMeasurementDateTime.setText(dateTime);
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
          oModel.read(`/measurementPointSet(Point='${requestData}')`, {
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

      onSubmitMeasPoint: async function (oEvent) {
        // show busy indicator
        BusyIndicator.show();

        const input = this.getView().byId("CurrentMeasPoint");

        // call function odata read
        const fullPoint = input.getValue().padStart(12, "0");

        const response = await this.ReadOdataMeasDocument(fullPoint);
        dataMeasPoint = response.result;
        dataMeasDoc = dataMeasPoint.MeasPointToMeasDoc.results;

        console.log(response);

        let convert = "-",
          fullDate = "-",
          valueUnit = "-";

        if (dataMeasDoc.length > 0) {
          convert = this.ConvertDateTime(
            dataMeasDoc[0].Date,
            dataMeasDoc[0].Time
          );
          fullDate = `${convert.date} / ${convert.time}`;
          valueUnit = `${
            dataMeasDoc[0].Value
          } ${dataMeasDoc[0].Unit.toLowerCase()}`;
        }

        // check return value
        if (dataMeasPoint.Point) {
          // call function set text
          this.SetLabelPrevMeasurement(
            dataMeasPoint.Description,
            valueUnit,
            fullDate
          );

          // enable input value
          currentMeasurementValue.setEnabled(true);

          // change title text
          if ((dataMeasPoint.Uom = "M3")) {
            titleTotalPemakaian.setText("Total Pemakaian Air");
          } else {
            titleTotalPemakaian.setText("Total Pemakaian Listrik");
          }
        } else {
          // message
          MessageBox.error("Measurement point not found.", {
            onClose: function () {
              window.location.reload();
            },
          });

          // // call function set text
          // this.SetLabelPrevMeasurement("-", "-", "-");

          // // disable input value
          // currentMeasurementValue.setEnabled(false);

          // // change title text
          // titleTotalPemakaian.setText("Total Pemakaian");
        }

        // hide busy indicator
        BusyIndicator.hide();
      },

      onSubmitMeasValue: function () {
        const currentMeasValue = currentMeasurementValue.getValue();
        let prevMeasValue = 0;

        if (dataMeasDoc.length > 0) {
          prevMeasValue = dataMeasDoc[0].Value;
        }

        const calculation = Number(currentMeasValue - prevMeasValue);
        const fixCalculation = calculation.toFixed(3);
        const value = `${fixCalculation} ${dataMeasPoint.Uom}`;

        totalPemakaian.setText(value);
      },
    });
  }
);
