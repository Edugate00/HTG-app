sap.ui.define(
  ["lrlpapp/controller/BaseController",
  "sap/ui/model/json/JSONModel",
"sap/ui/core/Fragment",
"sap/m/Dialog",
"sap/m/Button",
"sap/ui/core/HTML"
], function (BaseController, JSONModel, Fragment, Dialog, Button, HTML) {
  "use strict";

  return BaseController.extend("lrlpapp.controller.Utility", 
  {
    onInit: function () {
      const tilePemakaianListrik = this.getView().byId("tilePemakaianListrik");
        const tilePindaiMeteran = this.getView().byId("tilePindaiMeteran");
        const tileAirBulanan = this.getView().byId("tileAirBulanan");
        const tileTagihanAir = this.getView().byId("tileTagihanAir");

        tilePemakaianListrik.attachBrowserEvent(
          "click",
          this._onPemakaianListrik,
          this
        );
        tilePindaiMeteran.attachBrowserEvent(
          "click",
          this._onPindaiMeteran,
          this
        );
        tileAirBulanan.attachBrowserEvent(
          "click",
          this._onAirBulanan,
          this
        );
        tileTagihanAir.attachBrowserEvent(
          "click",
          this._onTagihanAirClick,
          this
        );
    },
    _onPemakaianListrik: function (oEvent) {
      console.log("Pemakaian Listrik")
    },
    _onPindaiMeteran: function (oEvent) {
      console.log("Pindai Meteran")
    },
    _onAirBulanan: function (oEvent) {
      const oView = this.getView();
      
        var oHtml = new sap.ui.core.HTML({
                    content: '<iframe src="https://lrna.edugate.web.id:8080/sap/bc/se/m/index.html?~transaction=ZAIR&sap-personas-flavor=D0374502C7081EDDAB9F7DE0B43CE41C&sap-se-hide-splashscreen=X&sap-client=116&sap-language=EN&sap-accessibility=X" width="100%" height="450px"></iframe>'
                    });


      if (!this.oFixedSizeDialog) {
				this.oFixedSizeDialog = new Dialog({
					title: "Meteran Air Bulanan",
					contentWidth: "100%",
					contentHeight: "450px",
					content: oHtml,
					endButton: new Button({
						text: "Close",
						press: function () {
							this.oFixedSizeDialog.close();
						}.bind(this)
					})
				});

				//to get access to the controller's model
				this.getView().addDependent(this.oFixedSizeDialog);
			}

			this.oFixedSizeDialog.open();
    },

    _onTagihanAirClick: function (oEvent) {
      console.log("Perhitungan Tagihan Air")
      const oView = this.getView();
      
        var oHtml = new sap.ui.core.HTML({
                    content: '<iframe src="https://lrna.edugate.web.id:8080/sap/bc/se/m/index.html?~transaction=ZAIR&sap-personas-flavor=D0374502C7081EDDAB89ADB78698441C&sap-se-hide-splashscreen=X&sap-client=116&sap-language=EN&sap-accessibility=X" width="100%" height="450px"></iframe>'
                    });


      if (!this.oFixedSizeDialog) {
				this.oFixedSizeDialog = new Dialog({
					title: "Perhitungan Tagihan Air",
					contentWidth: "100%",
					contentHeight: "450px",
					content: oHtml,
					endButton: new Button({
						text: "Close",
						press: function () {
							this.oFixedSizeDialog.close();
						}.bind(this)
					})
				});

				//to get access to the controller's model
				this.getView().addDependent(this.oFixedSizeDialog);
			}

			this.oFixedSizeDialog.open();

    },

    // Dialogs Close
    onClose: function () {
      // oDialog.destroyContent(oHtml);
      this.byId("tagihanAirReportDialog").close();
    },
  });
});
