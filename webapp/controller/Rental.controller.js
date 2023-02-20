sap.ui.define([
	 "lrlpapp/controller/BaseController",
	 "sap/m/MessageToast",
	 "sap/ui/Device",
	 "sap/ui/model/json/JSONModel",
], function (BaseController, MessageToast, Device, JSONModel) {
	"use strict";

	return BaseController.extend("lrlpapp.controller.Rental", {
		onInit: async function () {
			this.getSplitAppObj().setHomeIcon({
					'phone': 'phone-icon.png',
					'tablet': 'tablet-icon.png',
					'icon': 'desktop.ico'
			})

			Device.orientation.attachHandler(this.onOrientationChange, this);
		},

		onTagihanRentalSelect: async function (oEvent) {
			const sToPageId = oEvent.getParameter("listItem").getCustomData()[0].getValue();
			console.log(sToPageId);
            this.getSplitAppObj().toDetail(this.createId(sToPageId));
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
