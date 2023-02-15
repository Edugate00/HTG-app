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
      console.log("Meteran Air Bulanan")
      window.location.href = "https://lrna.edugate.web.id:8080/sap/bc/se/m/index.html?~transaction=ZAIR&sap-personas-flavor=D0374502C7081EDDAB85EF75B7A3841C&sap-client=116&sap-language=EN&sap-accessibility=X";
    },
    _onTagihanAirClick: function (oEvent) {
      console.log("Perhitungan Tagihan Air")
      const oView = this.getView();
      
        var oHtml = new sap.ui.core.HTML({
                    content: '<iframe src="https://lrna.edugate.web.id:8080/sap/bc/se/m/index.html?~transaction=ZAIR&sap-personas-flavor=D0374502C7081EDDAB85EF75B7A3841C&sap-client=116&sap-language=EN&sap-accessibility=X" width="100%" height="425px"></iframe>'
                    });


      if (!this.oFixedSizeDialog) {
				this.oFixedSizeDialog = new Dialog({
					title: "Perhitungan Tagihan Air",
					contentWidth: "100%",
					contentHeight: "425px",
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
