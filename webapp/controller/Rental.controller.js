sap.ui.define([
	 "lrlpapp/controller/BaseController",
	 "sap/m/MessageToast",
	 "sap/ui/Device",
	 "sap/ui/model/json/JSONModel",
], function (BaseController,
	MessageToast,
	Device,
	JSONModel) {
	"use strict";

	return BaseController.extend("lrlpapp.controller.Rental", {
		onAfterRendering: async function () {
			this.getSplitAppObj().setHomeIcon({
					'phone': 'phone-icon.png',
					'tablet': 'tablet-icon.png',
					'icon': 'desktop.ico'
			})

            let rentalMaster = []

            const oRentalMaster = await this.readOdataService("/rentalMasterSet", "RentalMasterToDetail");

            oRentalMaster.results.forEach(el => {
                const rentalDetail = el.RentalMasterToDetail.results[0];
                const biayaMaintenance = Number(rentalDetail.BiayaPemeliharaanPerBln)
                const biayaSewa = Number(rentalDetail.NilaiSewaPerBln)

                rentalDetail.BiayaPemeliharaanPerBln = `${biayaMaintenance.toLocaleString("id-ID", {style:"currency", currency:"IDR"})}`
                rentalDetail.NilaiSewaPerBln = `${biayaSewa.toLocaleString("id-ID", {style:"currency", currency:"IDR"})}`

                el.KontrakEnd = this.getShortFormattedDate(el.KontrakEnd)
                el.KontrakStart = this.getShortFormattedDate(el.KontrakStart)

                rentalMaster.push(el)
            })

            // console.log(rentalMaster);
            this.getView().setModel(new JSONModel({rentalMaster: rentalMaster}), "rentalMaster");

			Device.orientation.attachHandler(this.onOrientationChange, this);
		},

		onTagihanRentalSelect: async function (oEvent) {
            const oContext = oEvent.getParameter("listItem").getBindingContext("rentalMaster");
            const oSelectedData = oContext.getObject();
            const rentalDetail = oSelectedData.RentalMasterToDetail.results[0]

            rentalDetail.Kontainer = oSelectedData.Kontainer
            rentalDetail.KontainerDesc = oSelectedData.KontainerDesc
            rentalDetail.KontrakStart = oSelectedData.KontrakStart
            rentalDetail.KontrakEnd = oSelectedData.KontrakEnd
            this.getView().setModel(new JSONModel(rentalDetail), "rentalDetail")

			const sToPageId = oEvent.getParameter("listItem").getCustomData()[0].getValue();
            this.getSplitAppObj().toDetail(this.createId(sToPageId));
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
		}
	});
});
