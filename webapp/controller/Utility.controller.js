sap.ui.define(
  ["lrlpapp/controller/BaseController",
  "sap/ui/model/json/JSONModel",
"sap/ui/core/Fragment",
"sap/m/Dialog",
"sap/m/Button",
"sap/ui/core/HTML"
], function (BaseController, JSONModel, Fragment, Dialog, Button, HTML) {
  "use strict";

  const widthWindow = window.screen.width;

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
      this.getRouter().navTo("meteran");
    },
    _onAirBulanan: function (oEvent) {
      const oView = this.getView();
      
        var oHtml1 = new sap.ui.core.HTML({
                    content: '<iframe src="https://lrna.edugate.web.id:8080/sap/bc/se/m/index.html?~transaction=ZAIR&sap-personas-flavor=D0374502C7081EDDAB85EF75B7A3841C&sap-se-hide-splashscreen=X&sap-client=116&sap-language=EN&sap-accessibility=X" width="100%" height="450px"></iframe>'
                    });

      let width = null;
      if(widthWindow < 1400 ){
          width = "35%";
        }else {
          width = "50%";
        }

      if (!this.oFixedDialog) {
				this.oFixedDialog = new Dialog({
					title: "Pemakaian Air Bulanan",
					contentWidth: width,
					contentHeight: "400px",
					content: oHtml1,
					endButton: new Button({
						text: "Close",
						press: function () {
              // this.oFixedDialog.destroyContent();
							this.oFixedDialog.close();
						}.bind(this)
					})
				});

				//to get access to the controller's model
				this.getView().addDependent(this.oFixedDialog);
			}

			this.oFixedDialog.open();
    },

    _onTagihanAirClick: function (oEvent) {
      console.log("Perhitungan Tagihan Air")
      const oView = this.getView();
      
        var oHtml2 = new sap.ui.core.HTML({
                    content: '<iframe src="https://lrna.edugate.web.id:8080/sap/bc/se/m/index.html?~transaction=ZAIR&sap-personas-flavor=D0374502C7081EDDAB89ADB78698441C&sap-se-hide-splashscreen=X&sap-client=116&sap-language=EN&sap-accessibility=X" width="100%" height="450px"></iframe>'
                    });

        let width = null;
        console.log(widthWindow)
        if(widthWindow < 1400 ){
          width = "70%";
        }else {
          width = "100%";
        }

      if (!this.oFixedSizeDialog) {
        
				this.oFixedSizeDialog = new Dialog({
					title: "Perhitungan Tagihan Air",
					contentWidth: width,
					contentHeight: "400px",
					content: oHtml2,
					endButton: new Button({
						text: "Close",
						press: function () {
              // this.oFixedSizeDialog.destroyContent();
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
