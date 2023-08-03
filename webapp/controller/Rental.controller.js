sap.ui.define(
  ["lrlpapp/controller/BaseController", "sap/m/MessageToast", "sap/ui/Device", "sap/ui/core/Fragment", "sap/ui/model/json/JSONModel"],
  function (BaseController, MessageToast, Device, Fragment, JSONModel) {
    "use strict";

    return BaseController.extend("lrlpapp.controller.Rental", {
      onAfterRendering: async function () {
        this.getSplitAppObj().setHomeIcon({
          phone: "phone-icon.png",
          tablet: "tablet-icon.png",
          icon: "desktop.ico",
        });

        let rentalMaster = [];

        const oRentalMaster = await this.readOdataService("/rentalMasterSet", "RentalMasterToDetail");

        oRentalMaster.results.forEach((el) => {
          const rentalDetail = el.RentalMasterToDetail.results[0];
          if (rentalDetail) {
            const biayaMaintenance = Number(rentalDetail.BiayaPemeliharaanPerBln);
            const biayaSewa = Number(rentalDetail.NilaiSewaPerBln);

            rentalDetail.BiayaPemeliharaanPerBln = `${biayaMaintenance.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}`;
            rentalDetail.NilaiSewaPerBln = `${biayaSewa.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}`;

            el.KontrakEnd = this.getShortFormattedDate(el.KontrakEnd);
            el.KontrakStart = this.getShortFormattedDate(el.KontrakStart);

            rentalMaster.push(el);
          }
        });

        // console.log(oRentalMaster);

        // console.log(rentalMaster);
        this.getView().setModel(new JSONModel({ rentalMaster: rentalMaster }), "rentalMaster");

        Device.orientation.attachHandler(this.onOrientationChange, this);
      },

      onTagihanRentalSelect: async function (oEvent) {
        let tagihanSewa = [];
        let tagihanPengelolaan = [];
        let tagihanAir = [];

        const BILLING_FV = JSON.parse(sessionStorage.getItem("BILLING_FV"));
        const BILLING_ZUTL = JSON.parse(sessionStorage.getItem("BILLING_ZUTL"));

        const oContext = oEvent.getParameter("listItem").getBindingContext("rentalMaster");
        const oSelectedData = oContext.getObject();
        const rentalDetail = oSelectedData.RentalMasterToDetail.results[0];
        const noKontrak = oSelectedData.NomorKontrak;
        const kodeTenant = oSelectedData.KodeTenant;

        BILLING_FV.forEach((el) => {
          const billItem = el.BillingHeadToItem.results[0];
          const salesDocument = billItem.SalesDocument;
          const material = billItem.Material.toLowerCase();

          billItem.NetValue = Number(billItem.NetValue).toLocaleString("id-ID", { style: "currency", currency: "IDR" });

          if (el.ReleasedStatus === "") {
            billItem.StatusTagihan = "Belum dirilis";
          } else {
            billItem.StatusTagihan = el.Status;
            billItem.StatusType = el.TipeStatus;
          }

          billItem.PaymentDate = el.PaymentDate;
          billItem.PaymentStatus = el.Status;
          billItem.Periode = el.PriceListDesc;

          if (salesDocument === noKontrak) {
            if (material === "maintenance" || material === "pengelolaan") {
              tagihanPengelolaan.push(billItem);
            } else {
              tagihanSewa.push(billItem);
            }
          }
        });

        BILLING_ZUTL.forEach((el) => {
          if (el.Customer === kodeTenant) {
            const billItem = el.BillingHeadToItem.results[0];
            const salesDocument = billItem.SalesDocument;

            billItem.NetValue = Number(el.NetValue.replace(/,/g, "")).toLocaleString("id-ID", { style: "currency", currency: "IDR" });
            billItem.PaymentDate = el.PaymentDate;
            billItem.PaymentStatus = el.Status;
            billItem.StatusType = el.TipeStatus;
            billItem.Periode = el.PriceListDesc;
            tagihanAir.push(billItem);
          }
        });

        // console.log(tagihanSewa)
        // console.log(tagihanPengelolaan)
        // console.log(tagihanAir);

        rentalDetail.Kontainer = oSelectedData.Kontainer;
        rentalDetail.KontainerDesc = oSelectedData.KontainerDesc;
        rentalDetail.KontrakStart = oSelectedData.KontrakStart;
        rentalDetail.KontrakEnd = oSelectedData.KontrakEnd;

        // console.log(rentalDetail);

        this.getView().setModel(new JSONModel(rentalDetail), "rentalDetail");
        this.getView().setModel(new JSONModel({ listTagihanSewa: tagihanSewa }), "listTagihanSewa");
        this.getView().setModel(new JSONModel({ listTagihanPengelolaan: tagihanPengelolaan }), "listTagihanPengelolaan");
        this.getView().setModel(new JSONModel({ listTagihanAir: tagihanAir }), "listTagihanAir");

        const sToPageId = oEvent.getParameter("listItem").getCustomData()[0].getValue();
        this.getSplitAppObj().toDetail(this.createId(sToPageId));
      },

      onSelectListTagihan: function (oEvent) {
        let oPath,
          oListTagihan,
          oSelectedList,
          oSelectedListFinal,
          isRent = false;

        const BILLING_FV = JSON.parse(sessionStorage.getItem("BILLING_FV"));
        const BILLING_ZUTL = JSON.parse(sessionStorage.getItem("BILLING_ZUTL"));
        const oSewaContext = oEvent.getSource().getBindingContext("listTagihanSewa");
        const oPengelolaanContext = oEvent.getSource().getBindingContext("listTagihanPengelolaan");
        const oAirContext = oEvent.getSource().getBindingContext("listTagihanAir");

        if (oSewaContext) {
          oPath = oSewaContext.getPath().slice(17);
          oListTagihan = this.getView().byId("listTagihanSewa").getBinding("items").oList;
          isRent = true;
        } else if (oPengelolaanContext) {
          oPath = oPengelolaanContext.getPath().slice(24);
          oListTagihan = this.getView().byId("listTagihanPengelolaan").getBinding("items").oList;
          isRent = true;
        } else if (oAirContext) {
          oPath = oAirContext.getPath().slice(16);
          oListTagihan = this.getView().byId("listTagihanAir").getBinding("items").oList;
          console.log(oPath);
        }

        oSelectedList = oListTagihan[oPath];

        if (isRent) {
          BILLING_FV.forEach((el) => {
            if (el.BillingNumber === oSelectedList.BillingNumber) {
              oSelectedListFinal = el;
            }
          });
        } else {
          BILLING_ZUTL.forEach((el) => {
            if (el.BillingNumber === oSelectedList.BillingNumber) {
              oSelectedListFinal = el;
            }
          });
        }

        const oView = this.getView();
        const oModel = { detailTagihan: [{ ...oSelectedListFinal }] };

        if (!this.dialogName) {
          this.dialogName = Fragment.load({
            id: oView.getId(),
            name: `lrlpapp.view.fragments.DetailListTagihanInRental`,
            controller: this,
          }).then(function (oDialog) {
            oDialog.setModel(oView.getModel());
            oDialog.setModel(new JSONModel(oModel), "tagihan");
            return oDialog;
          });
        }

        this.dialogName.then(function (oDialog) {
          oDialog.setModel(oView.getModel());
          oDialog.setModel(new JSONModel(oModel), "tagihan");
          oDialog.open();
        });
        // console.log(oContext)
        // const listTagihan = this.getView().byId("tagihanList").getBinding("items").oList;
        // const selectedList = listTagihan[oContext];
      },

      onNavBackToMaster: function () {
        this.getSplitAppObj().toMaster(this.createId("master"));
      },

      onOrientationChange: function (mParams) {
        const sMsg = "Orientation now is " + (mParams.landscape ? "Landscape" : "Potrait");
        MessageToast.show(sMsg, { duration: 5000 });
      },

      getSplitAppObj: function () {
        const result = this.byId("rentalBills");
        if (!result) {
          MessageToast.show("SplitApp object can't be found!", { duration: 3000 });
        }
        return result;
      },

      onDetailTagihanClose: function () {
        this.byId("detailListTagihan").close();
      },
    });
  }
);
