sap.ui.define(
	[
		'lrlpapp/controller/BaseController',
		'sap/ui/model/json/JSONModel',
		'lrlpapp/utils/BoldTextFormatter',
		'sap/m/MessageBox',
	],
	function (BaseController, JSONModel, BoldTextFormatter, MessageBox) {
		'use strict';

		const date = new Date();
		const day = date.getDate() <= 9 ? `0${date.getDate()}` : date.getDate();
		const month = date.getMonth() + 1 <= 9 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
		const year = date.getFullYear();
		const currDate = `${year}${month}${day}`;
		const currTime = date.toLocaleTimeString('it-IT').replace(/:/g, '');

		return BaseController.extend('lrlpapp.controller.laporan.Cashflow', {
			onAfterRendering: async function () {
				const dropdownPeriodeFrom = this.byId('perioedFromDD');
				const dropdownPeriodeTo = this.byId('perioedToDD');
				const dropdownYear = this.byId('yearDD');

				dropdownPeriodeTo.setSelectedKey(month);
				dropdownYear.setSelectedKey(year);

				if (dropdownYear.getSelectedKey() == '2023') {
					dropdownPeriodeFrom.setSelectedKey('09');
				} else {
					dropdownPeriodeFrom.setSelectedKey('01');
				}

				this.onApplyPress();
			},

			onApplyPress: async function () {
				const dropdownPeriodeFrom = this.byId('perioedFromDD');
				const dropdownPeriodeTo = this.byId('perioedToDD');
				const dropdownYear = this.byId('yearDD');

				const tableContainer = this.byId('tableContainer');

				const selectedPeriodFrom = dropdownPeriodeFrom.getSelectedKey();
				const selectedPeriodTo = dropdownPeriodeTo.getSelectedKey();
				const selectedYear = dropdownYear.getSelectedKey();

				// console.log(selectedPeriodFrom);
				// console.log(selectedPeriodTo);
				// console.log(selectedYear);

				if (selectedYear == '2023' && selectedPeriodFrom < '09') {
					const that = this;
					MessageBox.show('Tidak bisa memilih periode sebelum periode 09 untuk Report Cashflow tahun 2023.', {
						icon: MessageBox.Icon.INFORMATION,
						title: 'Report Cashflow Message',
						action: [MessageBox.Action.OK],
						emphasizedAction: MessageBox.Action.OK,
						onClose: (oAction) => {
							that.onAfterRendering();
						},
					});
				} else {
					tableContainer.setBusy(true);

					try {
						const cashflowData = await this.RequestReadWithFilter(
							'/cashflowSet',
							`CompanyCode eq 'LRLP'and PeriodeFrom eq '${selectedPeriodFrom}'and PeriodeTo eq '${selectedPeriodTo}'and Year eq '${selectedYear}'`,
						);

						// console.log(cashflowData);

						const cashflowPropsName = Object.keys(cashflowData.results[0]);
						const cashflowValue = Object.values(cashflowData.results[0]);
						const cashInflow = [];
						const cashOutflow = [];
						const bankBalanceFlows = [];

						let bankBalance = null;
						let totalIn = null;
						let totalOut = null;

						cashflowPropsName.forEach((el, i) => {
							if (
								el !== '__metadata' &&
								el !== 'CompanyCode' &&
								el !== 'PeriodeFrom' &&
								el !== 'PeriodeTo' &&
								el !== 'Year'
							) {
								if (el.includes('CF_IN')) {
									if (el.includes('CF_IN_Bank_Balance_brought_forward')) {
										bankBalance = Number(cashflowValue[i]);
										el = el.replace('CF_IN_', '');
										el = el.replace(/_/g, ' ');

										bankBalanceFlows.push({
											account: el,
											value: Number(cashflowValue[i]).toLocaleString('id-ID', {
												style: 'currency',
												currency: 'IDR',
											}),
										});
									} else {
										if (el.includes('CF_IN_Total_Cash_Inflows')) {
											totalIn = Number(cashflowValue[i]);
										}

										el = el.replace('CF_IN_', '');
										el = el.replace(/_/g, ' ');
										cashInflow.push({
											account: el,
											value: Number(cashflowValue[i]).toLocaleString('id-ID', {
												style: 'currency',
												currency: 'IDR',
											}),
										});
									}
								} else if (el.includes('CF_OUT')) {
									if (el.includes('CF_OUT_Total_Cash_Outflows')) {
										totalOut = Number(cashflowValue[i]);
									}

									el = el.replace('CF_OUT_', '');
									el = el.replace(/_/g, ' ');
									cashOutflow.push({
										account: el,
										value: Number(cashflowValue[i]).toLocaleString('id-ID', {
											style: 'currency',
											currency: 'IDR',
										}),
									});
								}
							}
						});

						// Add surplus/deficit
						let surplusDeficit = bankBalance + totalIn - totalOut;

						// Input Row kosong
						cashOutflow.push({ account: '', value: '' });

						cashOutflow.push({
							account: 'Surplus/Deficit',
							value: surplusDeficit.toLocaleString('id-ID', {
								style: 'currency',
								currency: 'IDR',
							}),
						});

						const oBankBalanceModel = new JSONModel({ bankBalanceFlows: bankBalanceFlows });
						const oCashInModel = new JSONModel({ cashInflow: cashInflow });
						const oCashOutModel = new JSONModel({ cashOutflow: cashOutflow });
						this.getView().setModel(oBankBalanceModel, 'bankBalanceFlows');
						this.getView().setModel(oCashInModel, 'cashInflowModel');
						this.getView().setModel(oCashOutModel, 'cashOutflowModel');

						tableContainer.setBusy(false);
					} catch (error) {
						tableContainer.setBusy(false);

						const that = this;
						MessageBox.show(`${error.statusCode} - ${error.statusText}`, {
							icon: MessageBox.Icon.ERROR,
							title: `${error.message}`,
							action: [MessageBox.Action.OK],
							emphasizedAction: MessageBox.Action.OK,
							onClose: (oAction) => {
								that.onAfterRendering();
							},
						});
					}
				}
			},

			onClickNext: function (oEvent) {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo('cashflow2');
			},

			// Custom formatter for row styling
			BoldRowFormatter: function (isBold) {
				if (isBold) {
					this.getView().addStyleClass('BoldText');
				}
			},

			onClickBack: function (oEvent) {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo('cashflow');
			},
		});
	},
);
