sap.ui.define(
  ["lrlpapp/controller/BaseController",
"sap/ui/core/Fragment",
], function (BaseController, Fragment) {
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
      window.location.href = "https://lrna.edugate.web.id:8080/sap/bc/se/m/index.html?~transaction=ZAIR&sap-personas-flavor=D0374502C7081EDDAB85EF75B7A3841C&sap-se-hide-splashscreen=X&sap-client=116&sap-language=EN&sap-accessibility=X";
    },
    _onTagihanAirClick: function (oEvent) {
      console.log("Perhitungan Tagihan Air")
      // window.location.href = "https://lrna.edugate.web.id:8080/sap/bc/se/m/index.html?~transaction=ZAIR&sap-personas-flavor=D0374502C7081EDDAB89ADB78698441C&sap-se-hide-splashscreen=X&sap-client=116&sap-language=EN&sap-accessibility=X";
      const oView = this.getView();

      const oTagihanAirModel = [];

      if (!this.tagihanAirDialog) {
        this.tagihanAirDialog = Fragment.load({
          id: oView.getId(),
          name: "lrlpapp.view.fragments.ReportTagihanAir",
          controller: this,
        }).then(function (oDialog) {
          oDialog.setModel(oView.getModel());
          
          return oDialog;
        });
      }

      this.tagihanAirDialog.then(function (oDialog) {
        oDialog.setModel(oView.getModel());
        

        oDialog.open();
      });

    },

    // Dialogs Close
    onClose: function () {
      this.byId("tagihanAirReportDialog").close();
    },
  });
});
