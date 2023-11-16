sap.ui.define(
    [
        'lrlpapp/controller/BaseController',
        'sap/ui/core/Fragment',
        'sap/m/Button',
        'sap/ui/model/json/JSONModel',
        'sap/m/MessageToast',
        'sap/m/MenuItem',
        'sap/m/Dialog',
        'sap/ui/core/HTML',
        'sap/m/Popover',
        'sap/m/List',
        'sap/m/StandardListItem',
    ],
    function (
        BaseController,
        Fragment,
        Button,
        JSONModel,
        MessageToast,
        MenuItem,
        Dialog,
        HTML,
        Popover,
        List,
        StandardListItem,
    ) {
        'use strict';

        const widthWindow = window.screen.width;
        const PNL_DEV =
            'https://lrna.edugate.web.id:8080/sap/bc/se/m/index.html?~transaction=F.01&sap-personas-flavor=D037450CC64D1EDE92DFA751C23B4427&sap-se-hide-splashscreen=X&sap-client=116&sap-language=EN&sap-accessibility=X';
        const PNL_QAS =
            'https://lrna.edugate.web.id:8090/sap/bc/se/m/index.html?~transaction=F.01&sap-personas-flavor=D037450CC64D1EDE92DFA751C23B4427&sap-se-hide-splashscreen=X&sap-client=400&sap-language=EN&sap-accessibility=X';
        const PNL_PRD =
            'https://lrna.edugate.web.id:80/sap/bc/se/m/index.html?~transaction=F.01&sap-personas-flavor=D037450CC64D1EDE92DFA751C23B4427&sap-se-hide-splashscreen=X&sap-client=366&sap-language=EN&sap-accessibility=X';

        const CF_DEV =
            'https://lrna.edugate.web.id:8080/sap/bc/se/m/index.html?~transaction=FAGLB03&sap-personas-flavor=D037450CC64D1EDE92F0DEBDBE000427&sap-se-hide-splashscreen=X&sap-client=116&sap-language=EN&sap-accessibility=X';
        const CF_QAS =
            'https://lrna.edugate.web.id:8090/sap/bc/se/m/index.html?~transaction=FAGLB03&sap-personas-flavor=D037450CC64D1EDE92F0DEBDBE000427&sap-se-hide-splashscreen=X&sap-client=400&sap-language=EN&sap-accessibility=X';
        const CF_PRD =
            'https://lrna.edugate.web.id:80/sap/bc/se/m/index.html?~transaction=FAGLB03&sap-personas-flavor=D037450CC64D1EDE92F0DEBDBE000427&sap-se-hide-splashscreen=X&sap-client=366&sap-language=EN&sap-accessibility=X';

        return BaseController.extend('lrlpapp.controller.App', {
            onInit: async function () {
                const userName = this.getView().byId('userName');
                const userImg = this.getView().byId('userImg');
                var oPopover;

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
                    userImg.setSrc('sap-icon://person-placeholder');
                }

                const urlHash = window.location.hash.split('/')[window.location.hash.split('/').length - 1];
                console.log(urlHash);
                //Nav Mobile
                const navMobileDashboard = this.byId('navMobileDashboard');
                const navMobileUtility = this.byId('navMobileUtility');
                const navMobileRental = this.byId('navMobileRental');
                const navMobileLaporan = this.byId('navMobileLaporan');

                if (urlHash === 'utility') {
                    this._getActiveNav('utility');
                } else if (urlHash === 'rental') {
                    this._getActiveNav('rental');
                } else if (urlHash === 'pnl') {
                    this._getActiveNav('laporan');
                } else if (urlHash === 'cashflow') {
                    this._getActiveNav('laporan');
                } else {
                    this._getActiveNav('dashboard');
                }

                // Dashboard
                navMobileDashboard.attachBrowserEvent(
                    'click',
                    () => {
                        this.getRouter().navTo('dashboard');
                        this._getActiveNav('dashboard');
                    },
                    this,
                );

                // Utility
                navMobileUtility.attachBrowserEvent(
                    'click',
                    () => {
                        this.getRouter().navTo('utility');
                        this._getActiveNav('utility');
                    },
                    this,
                );

                // Rental
                navMobileRental.attachBrowserEvent(
                    'click',
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
                this._getActiveNav('dashboard');
                this.getRouter().navTo('dashboard');
            },

            onUtilityPress: function () {
                this._getActiveNav('utility');
                this.getRouter().navTo('utility');
            },

            onRentalPress: function () {
                this._getActiveNav('rental');
                this.getRouter().navTo('rental');
            },

            onReportPress: function () {
                var oView = this.getView(),
                    oButton = oView.byId('report');

                if (!this._oMenuFragment) {
                    this._oMenuFragment = Fragment.load({
                        id: oView.getId(),
                        name: 'lrlpapp.view.fragments.ReportMenu',
                        controller: this,
                    }).then(
                        function (oMenu) {
                            oMenu.openBy(oButton);
                            this._oMenuFragment = oMenu;
                            return this._oMenuFragment;
                        }.bind(this),
                    );
                } else {
                    this._oMenuFragment.openBy(oButton);
                }
            },

            onMenuAction: function (oEvent) {
                const oItems = oEvent.getParameter('item');
                const itemSelected = oItems.getText();
                const controllerPNL = sap.ui.controller('lrlpapp.controller.laporan.pnl');
                const controllerCF = sap.ui.controller('lrlpapp.controller.laporan.cashflow');

                if (itemSelected == 'Profit & Lost') {
                    console.log('Click PNL');
                    this._getActiveNav('laporan');
                    this.getRouter().navTo('pnl');

                    controllerPNL.onAfterRendering();
                } else if (itemSelected == 'Cash Flow') {
                    this._getActiveNav('laporan');
                    this.getRouter().navTo('cashflow');
                    controllerCF.onAfterRendering();
                }
            },

            _getActiveNav: function (page) {
                //Nav Web
                const dashboardLink = this.getView().byId('dashbaord');
                const utilityLink = this.getView().byId('utility');
                const rentalLink = this.getView().byId('rental');
                const report = this.getView().byId('report');

                //Nav Mobile
                const navMobileDashboard = this.byId('navMobileDashboard');
                const navMobileUtility = this.byId('navMobileUtility');
                const navMobileRental = this.byId('navMobileRental');
                const navMobileLaporan = this.byId('navMobileLaporan');

                switch (page) {
                    case 'dashboard':
                        //Menu Nav Web
                        dashboardLink.addStyleClass('nav-link-active');
                        utilityLink.removeStyleClass('nav-link-active');
                        rentalLink.removeStyleClass('nav-link-active');
                        report.removeStyleClass('nav-link-active');
                        //Menu Nav Mobile
                        navMobileDashboard.addStyleClass('navMobile-link-active');
                        navMobileUtility.removeStyleClass('navMobile-link-active');
                        navMobileRental.removeStyleClass('navMobile-link-active');
                        navMobileLaporan.removeStyleClass('navMobile-link-active');
                        break;

                    case 'utility':
                        //Menu Nav Web
                        dashboardLink.removeStyleClass('nav-link-active');
                        utilityLink.addStyleClass('nav-link-active');
                        rentalLink.removeStyleClass('nav-link-active');
                        report.removeStyleClass('nav-link-active');
                        //Menu Nav Mobile
                        navMobileUtility.addStyleClass('navMobile-link-active');
                        navMobileRental.removeStyleClass('navMobile-link-active');
                        navMobileLaporan.removeStyleClass('navMobile-link-active');
                        navMobileDashboard.removeStyleClass('navMobile-link-active');
                        break;

                    case 'rental':
                        //Menu Nav Web
                        dashboardLink.removeStyleClass('nav-link-active');
                        utilityLink.removeStyleClass('nav-link-active');
                        rentalLink.addStyleClass('nav-link-active');
                        report.removeStyleClass('nav-link-active');
                        //Menu Nav Mobile
                        navMobileRental.addStyleClass('navMobile-link-active');
                        navMobileUtility.removeStyleClass('navMobile-link-active');
                        navMobileLaporan.removeStyleClass('navMobile-link-active');
                        navMobileDashboard.removeStyleClass('navMobile-link-active');
                        break;

                    case 'laporan':
                        //Menu Nav Web
                        dashboardLink.removeStyleClass('nav-link-active');
                        utilityLink.removeStyleClass('nav-link-active');
                        rentalLink.removeStyleClass('nav-link-active');
                        report.addStyleClass('nav-link-active');
                        //Menu Nav Mobile
                        navMobileLaporan.addStyleClass('navMobile-link-active');
                        navMobileUtility.removeStyleClass('navMobile-link-active');
                        navMobileRental.removeStyleClass('navMobile-link-active');
                        navMobileDashboard.removeStyleClass('navMobile-link-active');
                        break;
                }
            },

            OnSetting: function () {
                this.getRouter().navTo('settings');
            },

            OnRefresh: function () {
                window.location.reload();
            },
        });
    },
);
