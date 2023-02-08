sap.ui.define(["lrlpapp/controller/BaseController"], function (BaseController) {
  "use strict";

  return BaseController.extend("lrlpapp.controller.controller.App", {
    onInit() {
      this._getActiveNav("dashboard");
    },

    onDashboardPress: function () {
      this._getActiveNav("dashboard");
      this.getRouter().navTo("dashboard");
    },

    onUtilityPress: function () {
      this._getActiveNav("utility");
      this.getRouter().navTo("utility");
    },

    onRentalPress: function () {
      this._getActiveNav("rental");
      this.getRouter().navTo("rental");
    },

    onMaintenancePress: function () {
      this._getActiveNav("maintenance");
      this.getRouter().navTo("maintenance");
    },

    _getActiveNav: function (page) {
      const dashboardLink = this.getView().byId("dashbaord");
      const utilityLink = this.getView().byId("utility");
      const rentalLink = this.getView().byId("rental");
      const maintenanceLink = this.getView().byId("maintenance");

      switch (page) {
        case "dashboard":
          dashboardLink.addStyleClass("nav-link-active");
          utilityLink.removeStyleClass("nav-link-active");
          rentalLink.removeStyleClass("nav-link-active");
          maintenanceLink.removeStyleClass("nav-link-active");
          break;

        case "utility":
          dashboardLink.removeStyleClass("nav-link-active");
          utilityLink.addStyleClass("nav-link-active");
          rentalLink.removeStyleClass("nav-link-active");
          maintenanceLink.removeStyleClass("nav-link-active");
          break;

        case "rental":
          dashboardLink.removeStyleClass("nav-link-active");
          utilityLink.removeStyleClass("nav-link-active");
          rentalLink.addStyleClass("nav-link-active");
          maintenanceLink.removeStyleClass("nav-link-active");
          break;

        case "maintenance":
          dashboardLink.removeStyleClass("nav-link-active");
          utilityLink.removeStyleClass("nav-link-active");
          rentalLink.removeStyleClass("nav-link-active");
          maintenanceLink.addStyleClass("nav-link-active");
          break;
      }
    },
  });
});
