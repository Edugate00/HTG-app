sap.ui.define(
  ["lrlpapp/controller/BaseController", "sap/ui/core/Fragment"],
  function (BaseController, Fragment) {
    "use strict";

    return BaseController.extend("lrlpapp.controller.controller.App", {
      onInit() {
        const urlHash = window.location.hash.split("/")[1];

        const navMobileDashboard = this.byId("navMobileDashboard");
        const navMobileUtility = this.byId("navMobileUtility");
        const navMobileRental = this.byId("navMobileRental");

        if (urlHash === "utility") {
          this._getActiveNav("utility");
          navMobileUtility.addStyleClass("navMobile-link-active");
        } else if (urlHash === "rental") {
          this._getActiveNav("rental");
          navMobileRental.addStyleClass("navMobile-link-active");
        } else {
          this._getActiveNav("dashboard");
          navMobileDashboard.addStyleClass("navMobile-link-active");
        }

        // Dashboard
        navMobileDashboard.attachBrowserEvent(
          "click",
          () => {
            this.getRouter().navTo("dashboard");
            navMobileDashboard.addStyleClass("navMobile-link-active");
            navMobileUtility.removeStyleClass("navMobile-link-active");
            navMobileRental.removeStyleClass("navMobile-link-active");
          },
          this
        );

        // Utility
        navMobileUtility.attachBrowserEvent(
          "click",
          () => {
            this.getRouter().navTo("utility");
            navMobileDashboard.removeStyleClass("navMobile-link-active");
            navMobileUtility.addStyleClass("navMobile-link-active");
            navMobileRental.removeStyleClass("navMobile-link-active");
          },
          this
        );

        // Rental
        navMobileRental.attachBrowserEvent(
          "click",
          () => {
            this.getRouter().navTo("rental");
            navMobileDashboard.removeStyleClass("navMobile-link-active");
            navMobileUtility.removeStyleClass("navMobile-link-active");
            navMobileRental.addStyleClass("navMobile-link-active");
          },
          this
        );
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

      _getActiveNav: function (page) {
        const dashboardLink = this.getView().byId("dashbaord");
        const utilityLink = this.getView().byId("utility");
        const rentalLink = this.getView().byId("rental");

        switch (page) {
          case "dashboard":
            dashboardLink.addStyleClass("nav-link-active");
            utilityLink.removeStyleClass("nav-link-active");
            rentalLink.removeStyleClass("nav-link-active");
            break;

          case "utility":
            dashboardLink.removeStyleClass("nav-link-active");
            utilityLink.addStyleClass("nav-link-active");
            rentalLink.removeStyleClass("nav-link-active");
            break;

          case "rental":
            dashboardLink.removeStyleClass("nav-link-active");
            utilityLink.removeStyleClass("nav-link-active");
            rentalLink.addStyleClass("nav-link-active");
            break;

          case "maintenance":
            dashboardLink.removeStyleClass("nav-link-active");
            utilityLink.removeStyleClass("nav-link-active");
            rentalLink.removeStyleClass("nav-link-active");
            break;
        }
      },

      OnPressLogOut: function (oEvent) {
        alert("on log out");
      },

      OnSetting: function () {
        this.getRouter().navTo("settings");
      },
    });
  }
);
