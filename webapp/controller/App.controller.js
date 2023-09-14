sap.ui.define(
    [
        "lrlpapp/controller/BaseController",
        "sap/ui/core/Fragment",
        "sap/m/Button",
        "sap/ui/model/json/JSONModel",
        "sap/m/MessageToast",
        "sap/m/MenuItem",
        "sap/m/Dialog",
        "sap/ui/core/HTML",
    ],
    function (
        BaseController,
        Fragment,
        Button,
        JSONModel,
        MessageToast,
        MenuItem,
        Dialog,
        HTML
    ) {
        "use strict";

        const widthWindow = window.screen.width;
        const PNL_DEV =
            "https://lrna.edugate.web.id:8080/sap/bc/se/m/index.html?~transaction=F.01&sap-personas-flavor=D037450CC64D1EDE92DFA751C23B4427&sap-se-hide-splashscreen=X&sap-client=116&sap-language=EN&sap-accessibility=X";
        const PNL_QAS =
            "https://lrna.edugate.web.id:8090/sap/bc/se/m/index.html?~transaction=F.01&sap-personas-flavor=D037450CC64D1EDE92DFA751C23B4427&sap-se-hide-splashscreen=X&sap-client=400&sap-language=EN&sap-accessibility=X";
        const PNL_PRD =
            "https://lrna.edugate.web.id:80/sap/bc/se/m/index.html?~transaction=F.01&sap-personas-flavor=D037450CC64D1EDE92DFA751C23B4427&sap-se-hide-splashscreen=X&sap-client=366&sap-language=EN&sap-accessibility=X";

        const CF_DEV =
            "https://lrna.edugate.web.id:8080/sap/bc/se/m/index.html?~transaction=FAGLB03&sap-personas-flavor=D037450CC64D1EDE92F0DEBDBE000427&sap-se-hide-splashscreen=X&sap-client=116&sap-language=EN&sap-accessibility=X";
        const CF_QAS =
            "https://lrna.edugate.web.id:8090/sap/bc/se/m/index.html?~transaction=FAGLB03&sap-personas-flavor=D037450CC64D1EDE92F0DEBDBE000427&sap-se-hide-splashscreen=X&sap-client=400&sap-language=EN&sap-accessibility=X";
        const CF_PRD =
            "https://lrna.edugate.web.id:80/sap/bc/se/m/index.html?~transaction=FAGLB03&sap-personas-flavor=D037450CC64D1EDE92F0DEBDBE000427&sap-se-hide-splashscreen=X&sap-client=366&sap-language=EN&sap-accessibility=X";

        return BaseController.extend("lrlpapp.controller.App", {
            onInit: async function () {
                const userName = this.getView().byId("userName");
                const userImg = this.getView().byId("userImg");

                let oModel = this.getOwnerComponent().getModel();
                const user = await new Promise(function (resolve, reject) {
                    oModel.read("/userSet(User='sy-uname')", {
                        success: function (oData) {
                            resolve(oData);
                        },
                        error: function (oResult) {
                            reject(oResult);
                        },
                    });
                });

                userName.setText(user.Name);
                if (user.Image) {
                    userImg.setSrc(user.Image);
                } else {
                    userImg.setSrc("sap-icon://person-placeholder");
                }

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
                        navMobileDashboard.addStyleClass(
                            "navMobile-link-active"
                        );
                        navMobileUtility.removeStyleClass(
                            "navMobile-link-active"
                        );
                        navMobileRental.removeStyleClass(
                            "navMobile-link-active"
                        );
                    },
                    this
                );

                // Utility
                navMobileUtility.attachBrowserEvent(
                    "click",
                    () => {
                        this.getRouter().navTo("utility");
                        navMobileDashboard.removeStyleClass(
                            "navMobile-link-active"
                        );
                        navMobileUtility.addStyleClass("navMobile-link-active");
                        navMobileRental.removeStyleClass(
                            "navMobile-link-active"
                        );
                    },
                    this
                );

                // Rental
                navMobileRental.attachBrowserEvent(
                    "click",
                    () => {
                        this.getRouter().navTo("rental");
                        navMobileDashboard.removeStyleClass(
                            "navMobile-link-active"
                        );
                        navMobileUtility.removeStyleClass(
                            "navMobile-link-active"
                        );
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

            onReportPress: function () {
                var oView = this.getView(),
                    oButton = oView.byId("report");

                if (!this._oMenuFragment) {
                    this._oMenuFragment = Fragment.load({
                        id: oView.getId(),
                        name: "lrlpapp.view.fragments.ReportMenu",
                        controller: this,
                    }).then(
                        function (oMenu) {
                            oMenu.openBy(oButton);
                            this._oMenuFragment = oMenu;
                            return this._oMenuFragment;
                        }.bind(this)
                    );
                } else {
                    this._oMenuFragment.openBy(oButton);
                }
            },

            onMenuAction: function (oEvent) {
                const oItems = oEvent.getParameter("item");
                const itemSelected = oItems.getText();

                if (itemSelected == "Profit & Lost") {
                    this._getActiveNav("pnl");
                    this.getRouter().navTo("pnl");
                } else if (itemSelected == "Cash Flow"){
                    this._getActiveNav("cashflow");
                  this.getRouter().navTo("cashflow");
                } else if (itemSelected == "Tenant AR"){
                    this._getActiveNav("TenantAR");
                    this.getRouter().navTo("TenantAR");
                }
  

                
                // sItemPath = sItemPath.substr(0, sItemPath.lastIndexOf(" > "));

                // MessageToast.show("Action triggered on item: " + sItemPath);
                // if (sItemPath == "Profit & Lost") {
                //     console.log("PNL");
                //     this.getRouter().navTo("pnl");
                    // const oView = this.getView();

                    // let zInvoiceUrl;
                    // const portURL = window.location.port;

                    // if (portURL === "8080") {
                    //     zInvoiceUrl = `<iframe src="${PNL_DEV}" width="100%" height="500px"></iframe>`;
                    // }
                    // if (portURL === "8090") {
                    //     zInvoiceUrl = `<iframe src="${PNL_QAS}" width="100%" height="500px"></iframe>`;
                    // }
                    // if (portURL === "80") {
                    //     zInvoiceUrl = `<iframe src="${PNL_PRD}" width="100%" height="500px"></iframe>`;
                    // }

                    // const oHtml2 = new HTML({
                    //     content: zInvoiceUrl,
                    // });

                    // let width = null;
                    // // console.log(widthWindow);

                    // if (widthWindow < 576 || widthWindow > 1400) {
                    //     width = "100%";
                    // } else {
                    //     width = "70%";
                    // }

                    // if (!this.oPNLreportDialog) {
                    //     this.oPNLreportDialog = new Dialog({
                    //         title: "Profit and Lost Report",
                    //         contentWidth: width,
                    //         contentHeight: "450px",
                    //         content: oHtml2,
                    //         endButton: new Button({
                    //             text: "Tutup",
                    //             press: function () {
                    //                 // this.oPNLreportDialog.destroyContent();
                    //                 this.oPNLreportDialog.close();
                    //             }.bind(this),
                    //         }),
                    //     });

                    //     //to get access to the controller's model
                    //     this.getView().addDependent(this.oPNLreportDialog);
                    // }

                    // this.oPNLreportDialog.open();
                // } else if (sItemPath == "Cash Flow") {
                //     console.log("Cash flow");
                //     this.getRouter().navTo("cashflow");

                    // const oView = this.getView();

                    // let zInvoiceUrl;
                    // const portURL = window.location.port;

                    // if (portURL === "8080") {
                    //     zInvoiceUrl = `<iframe src="${CF_DEV}" width="100%" height="500px"></iframe>`;
                    // }
                    // if (portURL === "8090") {
                    //     zInvoiceUrl = `<iframe src="${CF_QAS}" width="100%" height="500px"></iframe>`;
                    // }
                    // if (portURL === "80") {
                    //     zInvoiceUrl = `<iframe src="${CF_PRD}" width="100%" height="500px"></iframe>`;
                    // }

                    // const oHtml2 = new HTML({
                    //     content: zInvoiceUrl,
                    // });

                    // let width = null;
                    // // console.log(widthWindow);

                    // if (widthWindow < 576 || widthWindow > 1400) {
                    //     width = "100%";
                    // } else {
                    //     width = "70%";
                    // }

                    // if (!this.oCFreportDialog) {
                    //     this.oCFreportDialog = new Dialog({
                    //         title: "Cash Flow Report",
                    //         contentWidth: width,
                    //         contentHeight: "450px",
                    //         content: oHtml2,
                    //         endButton: new Button({
                    //             text: "Tutup",
                    //             press: function () {
                    //                 // this.oCFreportDialog.destroyContent();
                    //                 this.oCFreportDialog.close();
                    //             }.bind(this),
                    //         }),
                    //     });

                    //     //to get access to the controller's model
                    //     this.getView().addDependent(this.oCFreportDialog);
                    // }

                    // this.oCFreportDialog.open();
                // } else if (sItemPath == "Balance Sheet") {
                //     console.log("Balance Sheet");
                // }
            },

            _getActiveNav: function (page) {
                const dashboardLink = this.getView().byId("dashbaord");
                const utilityLink = this.getView().byId("utility");
                const rentalLink = this.getView().byId("rental");
                const report = this.getView().byId("report")
                switch (page) {
                    case "dashboard":
                        dashboardLink.addStyleClass("nav-link-active");
                        utilityLink.removeStyleClass("nav-link-active");
                        rentalLink.removeStyleClass("nav-link-active");
                        report.removeStyleClass("nav-link-active");
                        break;

                    case "utility":
                        dashboardLink.removeStyleClass("nav-link-active");
                        utilityLink.addStyleClass("nav-link-active");
                        rentalLink.removeStyleClass("nav-link-active");
                        report.removeStyleClass("nav-link-active");
                        break;

                    case "rental":
                        dashboardLink.removeStyleClass("nav-link-active");
                        utilityLink.removeStyleClass("nav-link-active");
                        rentalLink.addStyleClass("nav-link-active");
                        report.removeStyleClass("nav-link-active");
                        break;

                    case "pnl":
                        dashboardLink.removeStyleClass("nav-link-active");
                        utilityLink.removeStyleClass("nav-link-active");
                        rentalLink.removeStyleClass("nav-link-active");
                        report.addStyleClass("nav-link-active");
                        break;

                    case "cashflow":
                        dashboardLink.removeStyleClass("nav-link-active");
                        utilityLink.removeStyleClass("nav-link-active");
                        rentalLink.removeStyleClass("nav-link-active");
                        report.addStyleClass("nav-link-active");
                    break

                    case "TenantAR":
                        dashboardLink.removeStyleClass("nav-link-active");
                        utilityLink.removeStyleClass("nav-link-active");
                        rentalLink.removeStyleClass("nav-link-active");
                        report.addStyleClass("nav-link-active");
                    break;
                }
            },

            OnSetting: function () {
                this.getRouter().navTo("settings");
            },

            OnRefresh: function () {
                window.location.reload();
            },
        });
    }
);
