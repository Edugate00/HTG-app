sap.ui.define(
    [
        'lrlpapp/controller/BaseController',
        'sap/ui/model/json/JSONModel',
        'sap/ui/model/Filter',
        'sap/ui/model/Sorter',
        'sap/ui/model/FilterOperator',
        'sap/viz/ui5/data/DimensionDefinition',
        'sap/ui/core/Item',
        'sap/ui/core/Fragment',
        'sap/m/MessageBox',
        'sap/ui/core/HTML',
        'sap/m/Dialog',
        'sap/m/Button',
    ],
    function (
        BaseController,
        JSONModel,
        Filter,
        Sorter,
        FilterOperator,
        DimensionDefinition,
        Item,
        Fragment,
        MessageBox,
        HTML,
        Dialog,
        Button,
    ) {
        'use strict';

        // Link ZInvoice Slipstream
        const PRD_366 =
            'https://lrna.edugate.web.id:80/sap/bc/se/m/index.html?~transaction=ZINVOICE&sap-personas-flavor=D0374502C7081EDDADCD647C3260841C&sap-se-hide-splashscreen=X&sap-client=366&sap-language=EN&sap-accessibility=X';
        const QAS_400 =
            'https://lrna.edugate.web.id:8090/sap/bc/se/m/index.html?~transaction=ZINVOICE&sap-personas-flavor=D0374502C7081EDDADCD647C3260841C&sap-se-hide-splashscreen=X&sap-client=400&sap-language=EN&sap-accessibility=X';
        const DEV_116 =
            'https://lrna.edugate.web.id:8080/sap/bc/se/m/index.html?~transaction=ZINVOICE&sap-personas-flavor=D0374502C7081EDDADCD647C3260841C&sap-se-hide-splashscreen=X&sap-client=116&sap-language=EN&sap-accessibility=X';

        const itemsForTenant = [
            { key: '3bulan', text: '3 Bulan' },
            { key: '6bulan', text: '6 Bulan' },
            { key: '1tahun', text: '1 Tahun' },
            { key: '*', text: 'Semua' },
        ];

        const itemsForAllTenants = [
            { key: 'Januari', text: 'Januari' },
            { key: 'Februari', text: 'Februari' },
            { key: 'Maret', text: 'Maret' },
            { key: 'April', text: 'April' },
            { key: 'Mei', text: 'Mei' },
            { key: 'Juni', text: 'Juni' },
            { key: 'Juli', text: 'Juli' },
            { key: 'Agustus', text: 'Agustus' },
            { key: 'September', text: 'September' },
            { key: 'Oktober', text: 'Oktober' },
            { key: 'November', text: 'November' },
            { key: 'Desember', text: 'Desember' },
        ];

        const oPenggunaanAir = { data: [] };
        const oPenggunaanListrik = { data: [] };

        const currentDate = new Date().getDate();

        let selectTenant = '';
        let selectStatusPembayaran = '';
        let selectPeriode = '';
        let sortNilaiSewa = 'Asc';
        let _doTransaction = false;


        // let BILLING_FV = JSON.parse(sessionStorage.getItem("BILLING_FV"));
        // let BILLING_ZUTL = JSON.parse(sessionStorage.getItem("BILLING_ZUTL"));
        // let MEASPOINT = JSON.parse(sessionStorage.getItem("MEASPOINT"));
        // let needToPrint = JSON.parse(sessionStorage.getItem("TO_PRINT"))

        return BaseController.extend('lrlpapp.controller.Dashboard', {

            onAfterRendering: function () {
                this._initData();
            },

            _initData: async function () {
                if (_doTransaction) {
                    return
                }
                _doTransaction = true;
                this.getView().setBusy(_doTransaction)

                let billingHeadToItem;
                let oTagihan = [];
                const isDueDate = [];
                const hasPassed = [];
                const needToScan = [];

                let needToScanDesc = '';
                let MEASPOINT = [];
                let BILLING_FV = [];
                let BILLING_CANCEL = [];
                let BILLING_ZUTL = [];
                let needToPrint = [];


                const oMeasPoint = await this.readOdataService('/measurementPointSet', 'MeasPointToMeasDoc');

                oMeasPoint.results.forEach((el) => {
                    MEASPOINT.push(el);
                });

                const oExpand = 'BillingHeadToItem';
                const oDataFilter = `Tenant eq '${selectTenant}' and Status eq '${selectStatusPembayaran}' and Periode eq '${selectPeriode}'`

                const urlParameters = {
                    $expand: oExpand,
                    $filter: oDataFilter,
                    $orderby: `NilaiSewa ${sortNilaiSewa}`
                }



                const oBilling = await this.RequestReadWithFilterAndSort('/billingHeaderSet', urlParameters);

                const getNotification = await this.RequestReadWithOutExpanded(
                    "/dashboardNotificationSet(FuncLoc='LRLP-CITIWALK')",
                );

                oBilling.results.forEach((el) => {
                    let year = el.BillingDate.substr(0, 4);
                    let month = el.BillingDate.substr(4, 2) - 1;
                    let day = el.BillingDate.substr(6, 2);

                    el.Timestamp = new Date(year, month, day).getTime();
                    el.DueDate = this.getFormattedDate(this.getDueDate(el.BillingDate, 7));
                    el.BillingDate = this.getFormattedDate(el.BillingDate);
                    el.MaterialDesc = el.BillingHeadToItem.results[0].Description;

                    if (el.NetValue !== '') {
                        el.NetValue = Number(el.NetValue).toLocaleString('IDR-id');
                    }

                    if (el.PaymentStatus !== '') {
                        el.PaymentDate = this.getFormattedDate(el.PaymentDate);
                    } else {
                        el.PaymentDate = '-';
                    }

                    if (el.PaymentStatus === 'X') {
                        el['Status'] = 'Sudah dibayar';
                        el['TipeStatus'] = 'Success';
                    } else {
                        el['Status'] = 'Belum dibayar';
                        el['TipeStatus'] = 'Error';
                    }

                    if (el.ReleasedStatus === 'X' && el.PrintedStatus === 'X') {
                        oTagihan.push(el);
                    } else if (el.ReleasedStatus === 'X' && el.PrintedStatus !== 'X') {
                        needToPrint.push(el);
                    }

                    if (el.BillingType === 'FV') {
                        // if (el.PriceListDesc != '') {
                        //     BILLING_CANCEL.push(el)
                        //     return
                        // } 
                        // el.PriceListDesc = "20230423 - 20230823"
                        let from = this.getShortFormattedDate(el.PriceListDesc.split(' - ')[0]);
                        let to = this.getShortFormattedDate(el.PriceListDesc.split(' - ')[1]);

                        if (from.slice(-4) === to.slice(-4)) {
                            from = from.slice(0, 6);
                        }

                        el.PriceListDesc = `${from} - ${to}`;

                        BILLING_FV.push(el);
                    } else {
                        BILLING_ZUTL.push(el);
                    }
                });



                // Storing data to Session Storage based on billing type
                // sessionStorage.setItem("ALL_BILLING", JSON.stringify(oBilling))
                sessionStorage.clear();
                sessionStorage.setItem('MEASPOINT', JSON.stringify(MEASPOINT));
                sessionStorage.setItem('BILLING_FV', JSON.stringify(BILLING_FV));

                sessionStorage.setItem('BILLING_ZUTL', JSON.stringify(BILLING_ZUTL));
                sessionStorage.setItem('TO_PRINT', JSON.stringify(needToPrint));

                MEASPOINT.forEach((el) => {
                    let getMonth;

                    if (currentDate <= 10) {
                        getMonth = new Date().getMonth();
                    } else if (currentDate >= 25) {
                        getMonth = new Date().getMonth() + 1;
                    }

                    // const stringMonth = getMonth <= 9 ? `0${getMonth}` : `${getMonth}`;
                    // const lastMeasDoc = el.MeasPointToMeasDoc.results[0];

                    //New logic to get scan notification
                    // Jika tanggal lastMeasDoc.Date dalam rentang 27 hari terakhir, berarti udh di scan
                    // kalo engga, berarti harus di scan
                    if (el.MeasPointToMeasDoc.results.length !== 0) {
                        let getDateMeasDoc = el.MeasPointToMeasDoc.results[0].Date;
                        const year = getDateMeasDoc.slice(0, 4);
                        const month = getDateMeasDoc.slice(4, 6);
                        const day = getDateMeasDoc.slice(6, 8);

                        let getMeasdocDateFormated = `${year}/${month}/${day}`;
                        let getTimeStampDateMeasdoc = new Date(getMeasdocDateFormated).getTime();

                        let currDate = new Date();
                        let last27days = new Date(currDate.getTime() - 27 * 24 * 60 * 60 * 1000);
                        let getlast27Days = last27days.getTime();

                        if (getlast27Days > getTimeStampDateMeasdoc) {
                            //Jika disewa atau tidak
                            if (el.Text !== '') {
                                needToScan.push(el);
                                needToScanDesc = `${needToScanDesc}` + `${el.Description.split(' ')[0]}, `;
                            }
                        }
                    } else {
                        if (el.Text !== '') {
                            needToScan.push(el);
                            needToScanDesc = `${needToScanDesc}` + `${el.Description.split(' ')[0]}, `;
                        }
                    }

                    if (el.Position === 'CONTAINER') {
                        el.MeasPointToMeasDoc.results.forEach((element) => {
                            let year = element.Date.substr(0, 4);
                            let month = element.Date.substr(4, 2);
                            let day = element.Date.substr(6, 2);
                            oPenggunaanAir.data.push({
                                tenant: `${el.Text.split(' - ')[1]} ${el.Description.split(' ')[0]}`,
                                value: String(Number(element.Value)),
                                period: this.getFormattedDate(element.Date).replace(',', '').split(' ')[1],
                                date: `${year}.${month}.${day}`,
                            });
                        });
                    } else if (el.Position === 'METERAN_LISTRIK') {
                        el.MeasPointToMeasDoc.results.forEach((element) => {
                            let year = element.Date.substr(0, 4);
                            let month = element.Date.substr(4, 2);
                            let day = element.Date.substr(6, 2);
                            oPenggunaanListrik.data.push({
                                value: String(Number(element.Value)),
                                date: `${year}.${month}.${day}`,
                            });
                        });
                    }
                });

                // Hapus tanda "," di paling belakang
                needToScanDesc = needToScanDesc.slice(0, needToScanDesc.length - 2);

                BILLING_FV.forEach((el) => {
                    if (el.ReleasedStatus !== 'X') {
                        if (this.isDueDate(el.Timestamp)) {
                            isDueDate.push(el);
                        }
                    }
                });

                BILLING_FV.forEach((el) => {
                    if (el.ReleasedStatus !== 'X') {
                        if (this.hasPassed(el.Timestamp)) {
                            hasPassed.push(el);
                        }
                    }
                });

                sessionStorage.setItem(
                    'NOTIF_TAGIHAN_SEWA',
                    JSON.stringify(isDueDate.sort((a, b) => a.Timestamp - b.Timestamp)),
                );
                // console.log("test hasPassed", hasPassed);

                const currentTimestamp = new Date().getTime();
               const top100HasPassed = hasPassed
                .map(item => ({
                    ...item,
                    timeDiff: Math.abs(item.Timestamp - currentTimestamp)
                     }))
                    .sort((a, b) => a.timeDiff - b.timeDiff)
                 .slice(0, 100)
                    .map(({ timeDiff, ...item }) => item);

sessionStorage.setItem(
    'NOTIF_TAGIHAN_TERLAMBAT',
    JSON.stringify(top100HasPassed)
);
                // sessionStorage.setItem(
                //     'NOTIF_TAGIHAN_TERLAMBAT',
                //     JSON.stringify(hasPassed.sort((a, b) => a.Timestamp - b.Timestamp)),
                // );

                // this code below is for the Dynamic Number of Tiles in Dashboard
                const notif = [];
                notif.push({ pindaiMeteran: `${needToScan.length}` });
                notif.push({ pindaiMeteranDesc: `${needToScanDesc}` });
                if (currentDate <= 10 || currentDate >= 25) {
                    notif.push({
                        tagihanAir: String(getNotification.TagihanAir),
                    });
                    notif.push({
                        tagihanSewa: String(isDueDate.length + hasPassed.length),
                    });
                    notif.push({ belumCetak: String(needToPrint.length) });
                } else {
                    notif.push({
                        tagihanAir: String(getNotification.TagihanAir),
                    });
                    notif.push({
                        tagihanSewa: String(isDueDate.length + hasPassed.length),
                    });
                    notif.push({ belumCetak: String(needToPrint.length) });
                }

                const notifCounter = new JSONModel({ notif });

                this.getView().setModel(notifCounter, 'notif');
                this.getView().setModel(new JSONModel({ tagihan: oTagihan }), 'tagihan');

                // Vizframe chart for Penggunaan Air
                const vizAir = this.getView().byId('vizPenggunaanAir');
                const vizListrik = this.byId('vizPenggunaanListrik');

                vizAir.setVizProperties({
                    plotArea: {
                        dataLabel: {
                            visible: true,
                        },
                        colorPalette: ['#00925D'],
                    },
                    valueAxis: {
                        title: {
                            visible: false,
                        },
                    },
                    categoryAxis: {
                        title: {
                            visible: false,
                        },
                    },
                    title: {
                        visible: false,
                        text: '',
                    },
                });

                vizListrik.setVizProperties({
                    plotArea: {
                        dataLabel: {
                            visible: true,
                        },
                        colorPalette: ['#FF942E'],
                    },
                    valueAxis: {
                        title: {
                            visible: false,
                        },
                    },
                    categoryAxis: {
                        title: {
                            visible: false,
                        },
                    },
                    title: {
                        visible: false,
                        text: '',
                    },
                });

                // const penggunaanAir = this.getOwnerComponent().getModel("penggunaanAir").getData();
                const penggunaanAir = this.formattedChartDateAndTimestamp(oPenggunaanAir.data);

                // const penggunaanListrik = this.getOwnerComponent().getModel("penggunaanListrik").getData();
                const dataFinalPenggunaanListrik = [];
                const penggunaanListrik = this.formattedChartDateAndTimestamp(oPenggunaanListrik.data);

                // console.log(penggunaanAir);
                // console.log(penggunaanListrik);

                const penggunaanAirModel = new JSONModel({
                    data: penggunaanAir.sort((a, b) => a.timeStamp - b.timeStamp),
                });
                const penggunaanListrikModel = new JSONModel({
                    data: penggunaanListrik.sort((a, b) => a.timeStamp - b.timeStamp),
                });

                const oComboBoxTenant = this.getView().byId('ComboBoxTenant');
                const oComboBoxListrikTimestamp = this.getView().byId('ListrikTimestampFilter');

                const tilePindaiMeteran = this.getView().byId('tilePindaiMeteran');
                const tileTagihanAir = this.getView().byId('tileTagihanAir');
                const tileTagihanSewa = this.getView().byId('tileTagihanSewa');
                const tileBelumCetak = this.getView().byId('tileBelumCetak');

                tilePindaiMeteran.attachBrowserEvent('click', this._onPindaiMeteranClick, this);
                tileTagihanAir.attachBrowserEvent('click', this._onTagihanAirClick, this);
                tileTagihanSewa.attachBrowserEvent('click', this._onTagihanSewaClick, this);
                tileBelumCetak.attachBrowserEvent('click', this._onBelumCetak, this);

                vizAir.setModel(penggunaanAirModel, 'penggunaanAir');
                vizListrik.setModel(penggunaanListrikModel, 'penggunaanListrik');

                oComboBoxTenant.destroyItems();
                oComboBoxTenant.addItem(new Item({ key: '*', text: 'Semua Tenant' }));

                const uniqueTenants = [...new Set(penggunaanAir.map((item) => item.tenant))];
                uniqueTenants.forEach((el) => {
                    oComboBoxTenant.addItem(new Item({ key: el, text: el }));
                });
                oComboBoxTenant.setSelectedKey('*');

                oComboBoxTenant.fireSelectionChange();
                oComboBoxListrikTimestamp.fireSelectionChange();

                _doTransaction = false;
                this.getView().setBusy(_doTransaction);
            },


            _onPindaiMeteranClick: function () {
                this.getRouter().navTo('meteran');
                window.location.reload();
            },

            _onTagihanAirClick: function (oEvent) {
                this.getRouter().navTo('utility');
                sessionStorage.setItem('TAGIHAN_AIR_FROM_DASHBOARD', true);
                window.location.reload();
            },

            _onTagihanSewaClick: function (oEvent) {
                const oView = this.getView();
                const tagihanSewa = JSON.parse(sessionStorage.getItem('NOTIF_TAGIHAN_SEWA'));
                const tagihanTerlambat = JSON.parse(sessionStorage.getItem('NOTIF_TAGIHAN_TERLAMBAT'));

                tagihanSewa.forEach((el) => {
                    el.Info = '';
                    el.InfoState = 'Success';
                });
                tagihanTerlambat.forEach((el) => {
                    el.Info = 'Belum dirilis';
                    el.InfoState = 'Error';
                });

                const oTagihanSewa = tagihanSewa.concat(tagihanTerlambat);
                const oModel = { tagihanSewa: oTagihanSewa };

                if (!this.tagihanSewaDialog) {
                    this.tagihanSewaDialog = Fragment.load({
                        id: oView.getId(),
                        name: 'lrlpapp.view.fragments.TagihanSewaDialog',
                        controller: this,
                    }).then(function (oDialog) {
                        oDialog.setModel(oView.getModel());
                        oDialog.setModel(new JSONModel(oModel), 'tagihanSewa');
                        return oDialog;
                    });
                }

                this.tagihanSewaDialog.then(function (oDialog) {
                    oDialog.setModel(oView.getModel());
                    oDialog.setModel(new JSONModel(oModel), 'tagihanSewa');

                    oDialog.open();
                });
            },

            _onBelumCetak: function (oEvent) {
                const oView = this.getView();
                const belumCetak = JSON.parse(sessionStorage.getItem('TO_PRINT'));

                const oModel = { belumCetak: belumCetak };

                if (!this.belumCetakDialog) {
                    this.belumCetakDialog = Fragment.load({
                        id: oView.getId(),
                        name: 'lrlpapp.view.fragments.BelumCetakDialog',
                        controller: this,
                    }).then(function (oDialog) {
                        oDialog.setModel(oView.getModel());
                        oDialog.setModel(new JSONModel(oModel), 'belumCetak');
                        return oDialog;
                    });
                }

                this.belumCetakDialog.then(function (oDialog) {
                    oDialog.setModel(oView.getModel());
                    oDialog.setModel(new JSONModel(oModel), 'belumCetak');

                    oDialog.open();
                });
            },

            openFilterDialog: async function () {
                const oView = this.getView();
                const tenantDetail = [];

                const oRentalMaster = await this.readOdataService('/rentalMasterSet', 'RentalMasterToDetail');
                oRentalMaster.results.forEach((el) => {
                    if (el.RentalMasterToDetail.results[0]) {
                        tenantDetail.push(el.RentalMasterToDetail.results[0]);
                    }
                });

                const uniqueTenantDetail = {};
                const result = tenantDetail.filter((obj) => {
                    if (!uniqueTenantDetail[obj.NamaTenant]) {
                        uniqueTenantDetail[obj.NamaTenant] = true;
                        return true;
                    }
                    return false;
                });

                result.unshift({ NamaTenant: 'Semua Tenant', KodeTenant: '*' });
                console.log(result);

                if (!this.filterDialog) {
                    this.filterDialog = Fragment.load({
                        id: oView.getId(),
                        name: 'lrlpapp.view.fragments.FilterDialog',
                        controller: this,
                    }).then(function (oDialog) {
                        oDialog.setModel(oView.getModel());
                        oDialog.setModel(new JSONModel({ tenant: result }), 'tenant');
                        return oDialog;
                    });
                }

                this.filterDialog.then(function (oDialog) {
                    oDialog.setModel(oView.getModel());
                    oDialog.setModel(new JSONModel({ tenant: result }), 'tenant');
                    oDialog.open();
                });
            },

            onSelectListTagihan: function (oEvent) {
                const oContext = oEvent.getSource().getBindingContext('tagihan').getPath().slice(9);
                const listTagihan = this.getView().byId('tagihanList').getBinding('items').oList;
                const selectedList = listTagihan[oContext];

                const oView = this.getView();
                const oModel = { detailTagihan: [{ ...selectedList }] };

                if (!this.dialogName) {
                    this.dialogName = Fragment.load({
                        id: oView.getId(),
                        name: `lrlpapp.view.fragments.DetailListTagihan`,
                        controller: this,
                    }).then(function (oDialog) {
                        oDialog.setModel(oView.getModel());
                        oDialog.setModel(new JSONModel(oModel), 'tagihan');
                        return oDialog;
                    });
                }

                this.dialogName.then(function (oDialog) {
                    oDialog.setModel(oView.getModel());
                    oDialog.setModel(new JSONModel(oModel), 'tagihan');
                    oDialog.open();
                });
            },

            onChartTenantSelected: function (oEvent) {
                let oFilterTenant, oFilterMonth, filters;

                const currentMonth = this.getMonth(new Date().getMonth());

                const oVizFrame = this.getView().byId('vizPenggunaanAir');
                const oDataset = oVizFrame.getDataset();
                const oDimension = oDataset.getDimensions()[0];

                const oComboBoxTenant = oEvent.getSource();
                const oComboBoxMonth = this.getView().byId('ComboBoxMonth');
                const tenantSelected = oComboBoxTenant.getSelectedKey();

                oFilterTenant = new Filter('tenant', FilterOperator.Contains, tenantSelected);
                oFilterMonth = new Filter('period', FilterOperator.EQ, currentMonth);

                if (tenantSelected !== '*') {
                    oVizFrame.setVizType('line');
                    oVizFrame.setVizProperties({
                        title: { visible: true, text: `${tenantSelected}` },
                    });

                    oComboBoxMonth.destroyItems();
                    itemsForTenant.forEach((el) => {
                        oComboBoxMonth.addItem(new Item(el));
                    });
                    oComboBoxMonth.setSelectedKey('*');
                    oDataset.removeDimension(oDimension);

                    const oNewDimension = new DimensionDefinition({
                        name: 'Category',
                        value: '{penggunaanAir>month}',
                    });

                    oDataset.addDimension(oNewDimension);
                    oDataset.getBinding('data').filter(oFilterTenant);
                } else {
                    oVizFrame.setVizType('column');
                    oVizFrame.setVizProperties({
                        title: {
                            visible: true,
                            text: `Semua Tenant bulan ${currentMonth}`,
                        },
                    });

                    oComboBoxMonth.destroyItems();
                    itemsForAllTenants.forEach((el) => {
                        oComboBoxMonth.addItem(new Item(el));
                    });
                    oComboBoxMonth.setSelectedKey(currentMonth);
                    oDataset.removeDimension(oDimension);

                    oDataset.removeDimension(oDimension);
                    const oNewDimension = new DimensionDefinition({
                        name: 'Category',
                        value: '{penggunaanAir>tenant}',
                    });
                    oDataset.addDimension(oNewDimension);
                    oDataset.getBinding('data').filter(oFilterMonth);
                }
            },

            onChartMonthSelected: function (oEvent) {
                let oFilterTenant, oFilterMonth, filters, toDateTimestamp;
                const currentDate = new Date();

                const oVizFrame = this.getView().byId('vizPenggunaanAir');
                const oDataset = oVizFrame.getDataset().getBinding('data');

                const oComboBoxMonth = oEvent.getSource();
                const oComboBoxTenant = this.getView().byId('ComboBoxTenant');
                const monthSelected = oComboBoxMonth.getSelectedKey();
                const tenantSelected = oComboBoxTenant.getSelectedKey();

                if (tenantSelected !== '*') {
                    oFilterTenant = new Filter('tenant', FilterOperator.EQ, tenantSelected);
                    // oFilterMonth = new Filter("period", FilterOperator.EQ, monthSelected);
                    if (monthSelected === '3bulan') {
                        toDateTimestamp = new Date(
                            currentDate.getFullYear(),
                            currentDate.getMonth() - 3,
                            currentDate.getDate(),
                        ).getTime();
                        oFilterMonth = new Filter(
                            'timeStamp',
                            FilterOperator.BT,
                            toDateTimestamp,
                            currentDate.getTime(),
                        );
                    } else if (monthSelected === '6bulan') {
                        toDateTimestamp = new Date(
                            currentDate.getFullYear(),
                            currentDate.getMonth() - 6,
                            currentDate.getDate(),
                        ).getTime();
                        oFilterMonth = new Filter(
                            'timeStamp',
                            FilterOperator.BT,
                            toDateTimestamp,
                            currentDate.getTime(),
                        );
                    } else if (monthSelected === '1tahun') {
                        toDateTimestamp = new Date(
                            currentDate.getFullYear() - 1,
                            currentDate.getMonth(),
                            currentDate.getDate(),
                        ).getTime();
                        oFilterMonth = new Filter(
                            'timeStamp',
                            FilterOperator.BT,
                            toDateTimestamp,
                            currentDate.getTime(),
                        );
                    } else {
                        toDateTimestamp = new Date(
                            currentDate.getFullYear() - 9999,
                            currentDate.getMonth(),
                            currentDate.getDate(),
                        ).getTime();
                        oFilterMonth = new Filter(
                            'timeStamp',
                            FilterOperator.BT,
                            toDateTimestamp,
                            currentDate.getTime(),
                        );
                    }
                } else {
                    oFilterTenant = [];
                    oFilterMonth = new Filter('period', FilterOperator.EQ, monthSelected);

                    oVizFrame.setVizProperties({
                        title: {
                            visible: true,
                            text: `Semua Tenant bulan ${monthSelected}`,
                        },
                    });
                }

                filters = new Filter({
                    filters: [oFilterTenant, oFilterMonth],
                    and: true,
                });

                oDataset.filter(filters);
            },

            onListrikChartTimestamp: function (oEvent) {
                let toDateTimestamp, oFilter;
                const oComboBoxTimestamp = oEvent.getSource();
                const timeStampSelected = oComboBoxTimestamp.getSelectedKey();

                const oVizFrame = this.getView().byId('vizPenggunaanListrik');
                const oDataset = oVizFrame.getDataset().getBinding('data');

                const currentDate = new Date();

                if (timeStampSelected === '6bulan') {
                    toDateTimestamp = new Date(
                        currentDate.getFullYear(),
                        currentDate.getMonth() - 6,
                        currentDate.getDate(),
                    ).getTime();
                    oFilter = new Filter('timeStamp', FilterOperator.BT, toDateTimestamp, currentDate.getTime());
                } else if (timeStampSelected === '1tahun') {
                    toDateTimestamp = new Date(
                        currentDate.getFullYear() - 1,
                        currentDate.getMonth(),
                        currentDate.getDate(),
                    ).getTime();
                    oFilter = new Filter('timeStamp', FilterOperator.BT, toDateTimestamp, currentDate.getTime());
                } else {
                    toDateTimestamp = new Date(
                        currentDate.getFullYear() - 9999,
                        currentDate.getMonth(),
                        currentDate.getDate(),
                    ).getTime();
                    oFilter = new Filter('timeStamp', FilterOperator.BT, toDateTimestamp, currentDate.getTime());
                }

                oDataset.filter(oFilter);
            },

            onTagihanSewaDialogRelease: async function () {
                let items = [];

                const oList = this.getView().byId('listTagihanSewa');
                const oSelectedItems = oList.getSelectedItems();

                oSelectedItems.forEach((el) => {
                    items.push(el.getBindingContext('tagihanSewa').getObject());
                });

                const request = { IT_VBRK: [] };
                items.forEach((el) => {
                    request.IT_VBRK.push({ Vbeln: el.BillingNumber });
                });

                if (request.IT_VBRK.length !== 0) {
                    const releaseBilling = await this.createOdataService('/releaseBillingSet', request);

                    if (releaseBilling.return === 'Sukses') {
                        MessageBox.success('Tagihan berhasil dirilis!', {
                            icon: MessageBox.Icon.SUCCESS,
                            title: 'Rilis Tagihan',
                            actions: [MessageBox.Action.OK],
                            emphasizedAction: MessageBox.Action.OK,
                            onClose: function (oAction) {
                                oList.setBusy(true);
                                setTimeout(() => {
                                    oList.setBusy(false);
                                    oSelectedItems.forEach((el) => {
                                        oList.removeItem(el);
                                    });
                                }, 3000);

                                sessionStorage.setItem('UPDATE_ODATA', true);
                            },
                        });
                    } else {
                        MessageBox.error(releaseBilling.return, {
                            icon: MessageBox.Icon.ERROR,
                            title: 'Rilis Tagihan',
                            actions: [MessageBox.Action.OK],
                            emphasizedAction: MessageBox.Action.OK,
                        });
                    }
                } else {
                    MessageBox.success('Tidak ada Tagihan yang dirilis!', {
                        icon: MessageBox.Icon.INFORMATION,
                        title: 'Rilis Tagihan',
                        actions: [MessageBox.Action.OK],
                        emphasizedAction: MessageBox.Action.OK,
                    });
                }
            },

            onBelumCetakDialogCetak: function () {
                let selectedList = [];

                const listTagihanSewa = this.getView().byId('listBelumCetak').getSelectedItems();
                listTagihanSewa.forEach((el) => {
                    selectedList.push(el.getBindingContext('belumCetak').getObject());
                });

                // Set sessionStorage for ZInvoice Flavor
                sessionStorage.setItem('BILL_NUMBER', selectedList[0].BillingNumber);

                this.cetakTagihan();
                // console.log(selectedList)
            },

            onDetailTagihanCetak: function () {
                const detailTagihanTercetak = this.getView().byId('detailListTagihan').getModel('tagihan');
                const oData = detailTagihanTercetak.oData.detailTagihan[0];

                // Set sessionStorage for ZInvoice Flavor
                sessionStorage.setItem('BILL_NUMBER', oData.BillingNumber);

                this.cetakTagihan();
                // console.log(oData);
            },

            // Dialogs Close
            onTagihanAirDialogClose: function () {
                this.byId('tagihanAirDialog').close();
            },

            onTagihanSewaDialogClose: function () {
                this.byId('tagihanSewaDialog').close();
            },

            onAfterCloseTagihanSewaDialog: function () {
                const isUpdate = sessionStorage.getItem('UPDATE_ODATA');
                if (isUpdate) {
                    sessionStorage.removeItem('UPDATE_ODATA');
                    // window.location.reload()
                    this.onAfterRendering();
                }
            },

            onBelumCetakDialogClose: function () {
                this.byId('belumCetakDialog').close();
                const isUpdate = sessionStorage.getItem('UPDATE_ODATA');
                if (isUpdate) {
                    sessionStorage.removeItem('UPDATE_ODATA');
                    // window.location.reload()
                    this.onAfterRendering();
                }
            },

            onDetailTagihanClose: function () {
                this.byId('detailListTagihan').close();
            },

            onApplyFIlter: function () {
                // let oFilter1, oFilter2, oFilter3, oFilters, oSort;
                if (_doTransaction) {
                    return
                }
                // Set Busy

                const rbg2 = this.getView().byId('rbg2');
                const rbg3 = this.getView().byId('rbg3');
                const comboBoxTenants = this.getView().byId('tenantList');
                const comboBoxPeriode = this.getView().byId('filterPeriod');

                const selectedTenant = comboBoxTenants.getValue();
                const selectedStatus = rbg2.getSelectedButton().getText();
                const selectedPeriode = comboBoxPeriode.getSelectedKey();
                const selectedSort = rbg3.getSelectedButton().getText();

                selectTenant = selectedTenant === 'Semua Tenant' ? "" : selectedTenant
                selectPeriode = selectedPeriode === '*' ? '' : selectedPeriode
                selectStatusPembayaran = selectedStatus === 'Sudah dibayar' ? selectedStatus : ''
                sortNilaiSewa = selectedSort === "Terendah" ? 'asc' : 'desc'


                // if (selectedTenant !== 'Semua Tenant') {
                //     oFilter1 = new Filter('CustomerDesc', FilterOperator.Contains, selectedTenant);
                // } else {
                //     oFilter1 = [];
                // }

                // if (selectedStatus === 'Sudah dibayar') {
                //     oFilter2 = new Filter('Status', FilterOperator.EQ, selectedStatus);
                // } else if (selectedStatus === 'Belum dibayar') {
                //     oFilter2 = new Filter('Status', FilterOperator.EQ, selectedStatus);
                // } else {
                //     oFilter2 = [];
                // }

                // if (selectedPeriod !== 'Semua Periode') {
                //     oFilter3 = new Filter('BillingDate', FilterOperator.Contains, selectedPeriod);
                // } else {
                //     oFilter3 = [];
                // }

                // oFilters = new Filter({
                //     filters: [oFilter1, oFilter2, oFilter3],
                //     and: true,
                // });

                // if (selectedSort === 'Terbaru') {
                //     oSort = new Sorter('BillingNumber', false);
                // } else {
                //     oSort = new Sorter('BillingNumber', true);
                // }

                // tagihanList.getBinding('items').filter(oFilters);
                // tagihanList.getBinding('items').sort(oSort);


                this._initData();

                this.onFilterDialogClose();
            },

            onFilterDialogClose: function () {
                this.byId('filterDialog').close();
            },

            formattedChartDateAndTimestamp: function (data) {
                const result = [];

                data.forEach((el) => {
                    let month = el.date.split('.')[1];
                    let year = el.date.split('.')[0];
                    switch (month) {
                        case '01':
                            el.month = `Jan ${year}`;
                            break;
                        case '02':
                            el.month = `Feb ${year}`;
                            break;
                        case '03':
                            el.month = `Mar ${year}`;
                            break;
                        case '04':
                            el.month = `Apr ${year}`;
                            break;
                        case '05':
                            el.month = `Mei ${year}`;
                            break;
                        case '06':
                            el.month = `Jun ${year}`;
                            break;
                        case '07':
                            el.month = `Jul ${year}`;
                            break;
                        case '08':
                            el.month = `Agu ${year}`;
                            break;
                        case '09':
                            el.month = `Sep ${year}`;
                            break;
                        case '10':
                            el.month = `Okt ${year}`;
                            break;
                        case '11':
                            el.month = `Nov ${year}`;
                            break;
                        case '12':
                            el.month = `Des ${year}`;
                            break;
                    }

                    el.timeStamp = new Date(el.date).getTime();
                    result.push(el);
                });

                return result;
            },

            cetakTagihan: function () {
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
                                if (this.byId('belumCetakDialog')) {
                                    let items = [];
                                    const oList = this.getView().byId('listBelumCetak');
                                    const oSelectedItems = oList.getSelectedItems();
                                    oSelectedItems.forEach((el) => {
                                        items.push(el.getBindingContext('belumCetak').getObject());
                                    });

                                    oList.setBusy(true);
                                    setTimeout(() => {
                                        oList.setBusy(false);
                                        oSelectedItems.forEach((el) => {
                                            oList.removeItem(el);
                                        });
                                    }, 3000);

                                    sessionStorage.setItem('UPDATE_ODATA', true);
                                }

                                if (this.byId('detailListTagihan')) {
                                    this.byId('detailListTagihan').close();
                                    this.onAfterRendering();
                                }
                            }.bind(this),
                        }),
                    });

                    this.getView().addDependent(this.oZInvoiceDialog);
                }
                this.oZInvoiceDialog.open();
            },
        });
    },
);
