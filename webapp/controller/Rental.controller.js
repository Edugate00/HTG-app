sap.ui.define(
    [
        'lrlpapp/controller/BaseController',
        'sap/m/MessageToast',
        'sap/ui/Device',
        'sap/ui/core/Fragment',
        'sap/ui/model/json/JSONModel',
        'sap/m/Button',
        'sap/ui/core/HTML',
        'sap/m/Dialog',
        'sap/ui/model/Sorter',
    ],
    function (BaseController, MessageToast, Device, Fragment, JSONModel, Button, HTML, Dialog, Sorter) {
        'use strict';

        // Link ZInvoice Slipstream
        const PRD_366 =
            'https://lrna.edugate.web.id:80/sap/bc/se/m/index.html?~transaction=ZINVOICE&sap-personas-flavor=D0374502C7081EDDADCD647C3260841C&sap-se-hide-splashscreen=X&sap-client=366&sap-language=EN&sap-accessibility=X';
        const QAS_400 =
            'https://lrna.edugate.web.id:8090/sap/bc/se/m/index.html?~transaction=ZINVOICE&sap-personas-flavor=D0374502C7081EDDADCD647C3260841C&sap-se-hide-splashscreen=X&sap-client=400&sap-language=EN&sap-accessibility=X';
        const DEV_116 =
            'https://lrna.edugate.web.id:8080/sap/bc/se/m/index.html?~transaction=ZINVOICE&sap-personas-flavor=D0374502C7081EDDADCD647C3260841C&sap-se-hide-splashscreen=X&sap-client=116&sap-language=EN&sap-accessibility=X';

        let statusKontrak = 'Berlaku';
        let sortKontrak = 'desc';

      

        return BaseController.extend('lrlpapp.controller.Rental', {
            onAfterRendering: async function () {
                this.getSplitAppObj().setHomeIcon({
                    phone: 'phone-icon.png',
                    tablet: 'tablet-icon.png',
                    icon: 'desktop.ico',
                });
                this._mViewSettingsDialogs = {};
                await this._getData(statusKontrak, sortKontrak);

                Device.orientation.attachHandler(this.onOrientationChange, this);
            },

            _getData: async function (status, sort) {
                const oList = this.getView().byId('tagihanRentalList');
                oList.setBusy(true);
                let rentalMaster = [];
                // const oRentalMaster = await this.readOdataService(
                //     "/rentalMasterSet",
                //     "RentalMasterToDetail"
                // );
                const urlParams = {
                    $expand: 'RentalMasterToDetail',
                    $orderby: `KontrakStart ${sort}`,
                    $filter: `KontrakStatus eq '${status}'`,
                };
                const oRentalMaster = await this.RequestReadWithFilterAndSort('/rentalMasterSet', urlParams);

                oRentalMaster.results.forEach((el) => {
                    const rentalDetail = el.RentalMasterToDetail.results[0];
                    if (rentalDetail) {
                        const biayaMaintenance = Number(rentalDetail.BiayaPemeliharaanPerBln);
                        const biayaSewa = Number(rentalDetail.NilaiSewaPerBln);

                        rentalDetail.BiayaPemeliharaanPerBln = `${biayaMaintenance.toLocaleString('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                        })}`;
                        rentalDetail.NilaiSewaPerBln = `${biayaSewa.toLocaleString('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                        })}`;
                        rentalDetail.KontrakStatus = el.KontrakStatus;
                        rentalMaster.push(el);
                    }
                });

                // console.log(oRentalMaster);

                // console.log(rentalMaster);
                this.getView().setModel(new JSONModel({rentalMaster: rentalMaster}), 'rentalMaster');
                oList.setBusy(false);
            },

            onInputSearchDebounceLiveChange: function (oEvent) {
                if (this._debounceTimer) {
                    clearTimeout(this._debounceTimer);
                }
                this._debounceTimer = setTimeout(
                    function () {
                        const searchValue = oEvent.getSource().getValue().toLowerCase().trim();
                        const oList = this.getView().byId('tagihanRentalList');
                        oList.setBusy(true);
                        const oBinding = oList.getBinding('items');

                        if (oBinding) {
                            const aFilters = [];
                            if (searchValue) {
                                aFilters.push(
                                    new sap.ui.model.Filter({
                                        filters: [
                                            new sap.ui.model.Filter(
                                                'NamaTenant',
                                                sap.ui.model.FilterOperator.Contains,
                                                searchValue,
                                            ),
                                            new sap.ui.model.Filter(
                                                'KontainerDesc',
                                                sap.ui.model.FilterOperator.Contains,
                                                searchValue,
                                            ),
                                            new sap.ui.model.Filter(
                                                'NomorKontrak',
                                                sap.ui.model.FilterOperator.Contains,
                                                searchValue,
                                            ),
                                            new sap.ui.model.Filter(
                                                'KodeTenant',
                                                sap.ui.model.FilterOperator.Contains,
                                                searchValue,
                                            ),
                                        ],
                                        and: false,
                                    }),
                                );
                            }
                            oBinding.filter(aFilters);
                        }
                        oList.setBusy(false);
                    }.bind(this),
                    750,
                );
            },
            onButtonRefreshKontrakSewaPress: async function (oEvent) {
                await this._getData(statusKontrak, sortKontrak);
            },
            getViewSettingsDialog: function (sDialogFragmentName) {
                let pDialog = this._mViewSettingsDialogs[sDialogFragmentName];

                if (!pDialog) {
                    pDialog = Fragment.load({
                        id: this.getView().getId(),
                        name: sDialogFragmentName,
                        controller: this,
                    }).then(function (oDialog) {
                        if (Device.system.desktop) {
                            oDialog.addStyleClass('sapUiSizeCompact');
                        }
                        return oDialog;
                    });
                    this._mViewSettingsDialogs[sDialogFragmentName] = pDialog;
                }
                return pDialog;
            },

            onCloseFragments: function () {
                this.getViewSettingsDialog('lrlpapp.view.fragments.FilterDialogRental').then(function (
                    oViewSettingsDialog,
                ) {
                    oViewSettingsDialog.close();
                });
            },

            onApplyFilter: async function (oEvent) {
                // Start of Radio Group Status Kontrak
                const statusRadioGroup = this.getView().byId('idStatusRadioButtonGroup');
                statusKontrak = this._getTextButton(statusRadioGroup);
                // End of Status Kontrak

                // Start of Radio Group Sort
                const sortRadioGroup = this.getView().byId('idSortRadioButtonGroup');
                const sort = await this._getTextButton(sortRadioGroup);
                sortKontrak = await this._checkSort(sort);
                // End of Radio Group Sort

                await this._getData(statusKontrak, sortKontrak);
                this.onCloseFragments();
            },

            _checkSort: function (text) {
                return text === 'Terbaru' ? 'desc' : 'asc';
            },

            onButtonFilterPress: function () {
                this.getViewSettingsDialog('lrlpapp.view.fragments.FilterDialogRental').then(function (
                    oViewSettingsDialog,
                ) {
                    oViewSettingsDialog.open();
                });
            },

            _getTextButton: function (object) {
                const isSelected = object.mProperties.selectedIndex;
                const button = object.getButtons()[isSelected];
                return button.getText();
            },

            onTagihanRentalSelect: async function (oEvent) {
                let tagihanSewa = [];
                let tagihanPengelolaan = [];
                let tagihanAir = [];

                const BILLING_FV = JSON.parse(sessionStorage.getItem('BILLING_FV'));

                // console.log(BILLING_FV);
                const BILLING_ZUTL = JSON.parse(sessionStorage.getItem('BILLING_ZUTL'));

                const oContext = oEvent.getParameter('listItem').getBindingContext('rentalMaster');
                const oSelectedData = oContext.getObject();
                const rentalDetail = oSelectedData.RentalMasterToDetail.results[0];
                const noKontrak = oSelectedData.NomorKontrak;
                const kodeTenant = oSelectedData.KodeTenant;


                BILLING_FV.forEach((el) => {
                    const billItem = el.BillingHeadToItem.results[0];
                    const salesDocument = billItem.SalesDocument;
                    const material = billItem.Material.toLowerCase();
                    billItem.NetValue = Number(billItem.NetValue).toLocaleString('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                    });

                    if (el.ReleasedStatus === '') {
                        billItem.StatusTagihan = 'Belum dirilis';
                    } else {
                        billItem.StatusTagihan = el.Status;
                        billItem.StatusType = el.TipeStatus;
                    }

                    billItem.PaymentDate = el.PaymentDate;
                    billItem.PaymentStatus = el.Status;
                    billItem.Periode = el.PriceListDesc;

                    if (salesDocument === noKontrak) {
                        if (material === 'maintenance' || material === 'pengelolaan') {
                            tagihanPengelolaan.push(billItem);
                        } else {
                            tagihanSewa.push(billItem);
                        }
                    }
                });

                BILLING_ZUTL.forEach((el) => {
                    if (el.Customer === kodeTenant) {
                        const billItem = el.BillingHeadToItem.results[0];
                        const salesDocument = billItem.SalesDocument;

                        billItem.NetValue = Number(el.NetValue.replace(/,/g, '')).toLocaleString('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                        });
                        billItem.PaymentDate = el.PaymentDate;
                        billItem.PaymentStatus = el.Status;
                        billItem.StatusType = el.TipeStatus;
                        billItem.Periode = el.PriceListDesc;
                        tagihanAir.push(billItem);
                    }
                });

                // console.log(tagihanSewa)
                // console.log(tagihanPengelolaan)
                // console.log(tagihanAir)

                rentalDetail.Kontainer = oSelectedData.Kontainer;
                rentalDetail.KontainerDesc = oSelectedData.KontainerDesc;
                rentalDetail.KontrakStart = oSelectedData.KontrakStart;
                rentalDetail.KontrakEnd = oSelectedData.KontrakEnd;

                // console.log(rentalDetail);

                this.getView().setModel(new JSONModel(rentalDetail), 'rentalDetail');
                this.getView().setModel(new JSONModel({listTagihanSewa: tagihanSewa}), 'listTagihanSewa');
                this.getView().setModel(
                    new JSONModel({
                        listTagihanPengelolaan: tagihanPengelolaan,
                    }),
                    'listTagihanPengelolaan',
                );
                this.getView().setModel(new JSONModel({listTagihanAir: tagihanAir}), 'listTagihanAir');

                const sToPageId = oEvent.getParameter('listItem').getCustomData()[0].getValue();
                this.getSplitAppObj().toDetail(this.createId(sToPageId));
            },

            onSelectListTagihan: function (oEvent) {
                let oPath,
                    oListTagihan,
                    oSelectedList,
                    oSelectedListFinal,
                    isRent = false,
                    isRilis = false;

                const BILLING_FV = JSON.parse(sessionStorage.getItem('BILLING_FV'));
                const BILLING_ZUTL = JSON.parse(sessionStorage.getItem('BILLING_ZUTL'));
                const oSewaContext = oEvent.getSource().getBindingContext('listTagihanSewa');
                const oPengelolaanContext = oEvent.getSource().getBindingContext('listTagihanPengelolaan');
                const oAirContext = oEvent.getSource().getBindingContext('listTagihanAir');

                if (oSewaContext) {
                    oPath = oSewaContext.getPath().slice(17);
                    oListTagihan = this.getView().byId('listTagihanSewa').getBinding('items').oList;
                    isRent = true;
                } else if (oPengelolaanContext) {
                    oPath = oPengelolaanContext.getPath().slice(24);
                    oListTagihan = this.getView().byId('listTagihanPengelolaan').getBinding('items').oList;
                    isRent = true;
                } else if (oAirContext) {
                    oPath = oAirContext.getPath().slice(16);
                    oListTagihan = this.getView().byId('listTagihanAir').getBinding('items').oList;
                }

                oSelectedList = oListTagihan[oPath];

                if (isRent) {
                    BILLING_FV.forEach((el) => {
                        if (el.BillingNumber === oSelectedList.BillingNumber) {
                            oSelectedListFinal = el;
                            sessionStorage.setItem('BILL_NUMBER', el.BillingNumber);
                            if (el.ReleasedStatus === 'X') {
                                isRilis = true;
                            }
                        }
                    });
                } else {
                    BILLING_ZUTL.forEach((el) => {
                        if (el.BillingNumber === oSelectedList.BillingNumber) {
                            oSelectedListFinal = el;
                            sessionStorage.setItem('BILL_NUMBER', el.BillingNumber);
                            if (el.ReleasedStatus === 'X') {
                                isRilis = true;
                            }
                        }
                    });
                }

                const oView = this.getView();
                const oModel = {detailTagihan: [{...oSelectedListFinal}]};
                if (!this.dialogName) {
                    this.dialogName = Fragment.load({
                        id: oView.getId(),
                        name: `lrlpapp.view.fragments.DetailListTagihanInRental`,
                        controller: this,
                    }).then(function (oDialog) {
                        if (isRilis) {
                            oDialog.setBeginButton(
                                new Button({
                                    text: 'Tutup',
                                    press: function () {
                                        oDialog.close();
                                    },
                                }),
                            );
                            oDialog.setEndButton(
                                new Button({
                                    text: 'Lihat Tagihan',
                                    type: 'Emphasized',
                                    press: function () {
                                        let zInvoiceUrl;
                                        const portURL = window.location.port;

                                        if (portURL === '8080') {
                                            zInvoiceUrl = `<iframe src="${DEV_116}" width="100%" height="500px"></iframe>`;
                                        }
                                        if (portURL === '8090') {
                                            zInvoiceUrl = `<iframe src="${QAS_400}" width="100%" height="500px"></iframe>`;
                                        }
                                        if (portURL === '80') {
                                            zInvoiceUrl = `<iframe src="${PRD_366}" width="100%" height="500px"></iframe>`;
                                        }

                                        const oHTML = new HTML({
                                            content: zInvoiceUrl,
                                        });

                                        let widthContent = null;
                                        let widthWindow = window.screen.width;

                                        if (widthWindow < 576 || widthWindow > 1400) {
                                            widthContent = '100%';
                                        } else {
                                            widthContent = '70%';
                                        }

                                        if (!this.oZInvoiceDialog) {
                                            this.oZInvoiceDialog = new Dialog({
                                                title: 'Cetak tagihan',
                                                contentWidth: widthContent,
                                                contentHeight: '500px',
                                                content: oHTML,
                                                endButton: new Button({
                                                    text: 'Tutup',
                                                    press: function () {
                                                        this.oZInvoiceDialog.close();
                                                    }.bind(this),
                                                }),
                                            });

                                            // this.getView().addDependent(this.oZInvoiceDialog);
                                        }
                                        this.oZInvoiceDialog.open();
                                    },
                                }),
                            );
                        } else {
                            oDialog.setBeginButton(
                                new Button({
                                    text: 'Tutup',
                                    press: function () {
                                        oDialog.close();
                                    },
                                }),
                            );
                        }
                        oDialog.setModel(oView.getModel());
                        oDialog.setModel(new JSONModel(oModel), 'tagihan');
                        return oDialog;
                    });
                }

                this.dialogName.then(function (oDialog) {
                    if (isRilis) {
                        oDialog.setBeginButton(
                            new Button({
                                text: 'Tutup',
                                press: function () {
                                    oDialog.close();
                                },
                            }),
                        );
                        oDialog.setEndButton(
                            new Button({
                                text: 'Lihat Tagihan',
                                type: 'Emphasized',
                                press: function () {
                                    let zInvoiceUrl;
                                    const portURL = window.location.port;

                                    if (portURL === '8080') {
                                        zInvoiceUrl = `<iframe src="${DEV_116}" width="100%" height="500px"></iframe>`;
                                    }
                                    if (portURL === '8090') {
                                        zInvoiceUrl = `<iframe src="${QAS_400}" width="100%" height="500px"></iframe>`;
                                    }
                                    if (portURL === '80') {
                                        zInvoiceUrl = `<iframe src="${PRD_366}" width="100%" height="500px"></iframe>`;
                                    }

                                    const oHTML = new HTML({
                                        content: zInvoiceUrl,
                                    });

                                    let widthContent = null;
                                    let widthWindow = window.screen.width;

                                    if (widthWindow < 576 || widthWindow > 1400) {
                                        widthContent = '100%';
                                    } else {
                                        widthContent = '70%';
                                    }

                                    if (!this.oZInvoiceDialog) {
                                        this.oZInvoiceDialog = new Dialog({
                                            title: 'Cetak tagihan',
                                            contentWidth: widthContent,
                                            contentHeight: '500px',
                                            content: oHTML,
                                            endButton: new Button({
                                                text: 'Tutup',
                                                press: function () {
                                                    this.oZInvoiceDialog.close();
                                                }.bind(this),
                                            }),
                                        });

                                        // this.getView().addDependent(this.oZInvoiceDialog);
                                    }
                                    this.oZInvoiceDialog.open();
                                },
                            }),
                        );
                    } else {
                        oDialog.destroyEndButton();
                    }
                    oDialog.setModel(oView.getModel());
                    oDialog.setModel(new JSONModel(oModel), 'tagihan');
                    oDialog.open();
                });
            },

            onNavBackToMaster: function () {
                this.getSplitAppObj().toMaster(this.createId('master'));
            },

            onOrientationChange: function (mParams) {
                const sMsg = 'Orientation now is ' + (mParams.landscape ? 'Landscape' : 'Potrait');
                MessageToast.show(sMsg, {duration: 5000});
            },

            getSplitAppObj: function () {
                const result = this.byId('rentalBills');
                if (!result) {
                    MessageToast.show("SplitApp object can't be found!", {
                        duration: 3000,
                    });
                }
                return result;
            },

            onSewaAscending: function () {
                const listTagihanSewa = this.byId('listTagihanSewa');
                const btnAsc = this.byId('btnSewaAsc');
                const btnDesc = this.byId('btnSewaDesc');
                let oSorter;

                btnAsc.setType('Emphasized');
                btnDesc.setType('Default');
                oSorter = new Sorter('BillingNumber', false);
                listTagihanSewa.getBinding('items').sort(oSorter);
            },

            onSewaDescending: function () {
                const listTagihanSewa = this.byId('listTagihanSewa');
                const btnAsc = this.byId('btnSewaAsc');
                const btnDesc = this.byId('btnSewaDesc');
                let oSorter;

                btnAsc.setType('Default');
                btnDesc.setType('Emphasized');
                oSorter = new Sorter('BillingNumber', true);
                listTagihanSewa.getBinding('items').sort(oSorter);
            },

            onPengelolaanAscending: function () {
                const listTagihanPengelolaan = this.byId('listTagihanPengelolaan');
                const btnAsc = this.byId('btnPengelolaanAsc');
                const btnDesc = this.byId('btnPengelolaanDesc');
                let oSorter;

                btnAsc.setType('Emphasized');
                btnDesc.setType('Default');
                oSorter = new Sorter('BillingNumber', false);
                listTagihanPengelolaan.getBinding('items').sort(oSorter);
            },

            onPengelolaanDescending: function () {
                const listTagihanPengelolaan = this.byId('listTagihanPengelolaan');
                const btnAsc = this.byId('btnPengelolaanAsc');
                const btnDesc = this.byId('btnPengelolaanDesc');
                let oSorter;

                btnAsc.setType('Default');
                btnDesc.setType('Emphasized');
                oSorter = new Sorter('BillingNumber', true);
                listTagihanPengelolaan.getBinding('items').sort(oSorter);
            },

            onAirAscending: function () {
                const listTagihanAir = this.byId('listTagihanAir');
                const btnAsc = this.byId('btnAirAsc');
                const btnDesc = this.byId('btnAirDesc');
                let oSorter;

                btnAsc.setType('Emphasized');
                btnDesc.setType('Default');
                oSorter = new Sorter('BillingNumber', false);
                listTagihanAir.getBinding('items').sort(oSorter);
            },

            onAirDescending: function () {
                const listTagihanAir = this.byId('listTagihanAir');
                const btnAsc = this.byId('btnAirAsc');
                const btnDesc = this.byId('btnAirDesc');
                let oSorter;

                btnAsc.setType('Default');
                btnDesc.setType('Emphasized');
                oSorter = new Sorter('BillingNumber', true);
                listTagihanAir.getBinding('items').sort(oSorter);
            },
        });
    },
);
