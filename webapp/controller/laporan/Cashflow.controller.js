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

		const convertToIdCurr = (value) => {
			return value.toLocaleString('id-ID', {
				style: 'currency',
				currency: 'IDR',
			});
		};

		return BaseController.extend('lrlpapp.controller.laporan.Cashflow', {
			onAfterRendering: async function () {
				const dropdownPeriodeFrom = this.byId('perioedFromDD');
				const dropdownYear = this.byId('yearDD');

				dropdownYear.setSelectedKey(year);

				if (dropdownYear.getSelectedKey() == '2023') {
					dropdownPeriodeFrom.setSelectedKey('10');
				} else {
					dropdownPeriodeFrom.setSelectedKey('01');
				}

				this.getCashflowData();
			},

			getCashflowData: async function () {
				const dropdownPeriode = this.byId('perioedFromDD');
				const dropdownYear = this.byId('yearDD');
				const tableContainer = this.byId('tableContainer');

				const selectedPeriod = dropdownPeriode.getSelectedKey();
				const selectedYear = dropdownYear.getSelectedKey();

				const monthList = [
					'Januari',
					'Februari',
					'Maret',
					'April',
					'Mei',
					'Juni',
					'Juli',
					'Agusuts',
					'September',
					'Oktober',
					'November',
					'Desember',
				];

				if (selectedYear == '2023' && selectedPeriod < '09') {
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
					const selectedPeriodCashflow = await this.getSelectedPeriodeCashflow(selectedPeriod, selectedYear);
					const prevPeriodCashflow = await this.getPrevPeriodeCashflow(selectedPeriod, selectedYear);

					const bankBalance = [];

					// cashinflows
					const inOperatingActs = [];
					const inFinancingActs = [];
					const inInvestingActs = [];
					const inOtherAndTotal = [];

					// cashoutflows
					const outOperatingActs = [];
					const outFinancingActs = [];
					const outInvestingActs = [];
					const outOtherAndTotal = [];

					if (selectedPeriodCashflow.length === prevPeriodCashflow.length) {
						for (let index = 0; index < selectedPeriodCashflow.length; index++) {
							if (selectedPeriodCashflow[index].account.includes('CF_IN')) {
								if (selectedPeriodCashflow[index].account === 'CF_IN_Bank_Balance_brought_forward') {
									const data = {
										account: selectedPeriodCashflow[index].account.replace('CF_IN_', '').replace(/_/g, ' '),
										valueSelected: convertToIdCurr(selectedPeriodCashflow[index].value),
										valuePrev: convertToIdCurr(prevPeriodCashflow[index].value),
										variances: convertToIdCurr(selectedPeriodCashflow[index].value - prevPeriodCashflow[index].value),
									};
									bankBalance.push(data);
								} else if (
									selectedPeriodCashflow[index].account === 'CF_IN_Citiwalk_Rent_Payment' ||
									selectedPeriodCashflow[index].account === 'CF_IN_Other_Income' ||
									selectedPeriodCashflow[index].account === 'CF_IN_Banks_Interest'
								) {
									const data = {
										account: selectedPeriodCashflow[index].account.replace('CF_IN_', '').replace(/_/g, ' '),
										valueSelected: convertToIdCurr(selectedPeriodCashflow[index].value),
										valuePrev: convertToIdCurr(prevPeriodCashflow[index].value),
										variances: convertToIdCurr(selectedPeriodCashflow[index].value - prevPeriodCashflow[index].value),
									};
									inOperatingActs.push(data);
								}
								// Get cashin financing acts
								else if (selectedPeriodCashflow[index].account === 'CF_IN_Transfer_in_from_Related_Companies') {
									const data = {
										account: selectedPeriodCashflow[index].account.replace('CF_IN_', '').replace(/_/g, ' '),
										valueSelected: convertToIdCurr(selectedPeriodCashflow[index].value),
										valuePrev: convertToIdCurr(prevPeriodCashflow[index].value),
										variances: convertToIdCurr(selectedPeriodCashflow[index].value - prevPeriodCashflow[index].value),
									};
									inFinancingActs.push(data);
								}
								// Get cashin investing acts
								else if (selectedPeriodCashflow[index].account === 'CF_IN_Transfer_from_SIBO') {
									const data = {
										account: selectedPeriodCashflow[index].account.replace('CF_IN_', '').replace(/_/g, ' '),
										valueSelected: convertToIdCurr(selectedPeriodCashflow[index].value),
										valuePrev: convertToIdCurr(prevPeriodCashflow[index].value),
										variances: convertToIdCurr(selectedPeriodCashflow[index].value - prevPeriodCashflow[index].value),
									};
									inInvestingActs.push(data);
								} else {
									const data = {
										account: selectedPeriodCashflow[index].account.replace('CF_IN_', '').replace(/_/g, ' '),
										valueSelected: convertToIdCurr(selectedPeriodCashflow[index].value),
										valuePrev: convertToIdCurr(prevPeriodCashflow[index].value),
										variances: convertToIdCurr(selectedPeriodCashflow[index].value - prevPeriodCashflow[index].value),
									};
									inOtherAndTotal.push(data);
								}
							} else if (selectedPeriodCashflow[index].account.includes('CF_OUT')) {
								// Get cashout operating acts
								if (
									selectedPeriodCashflow[index].account === 'CF_OUT_Payment_to_Third_Party_Vendors' ||
									selectedPeriodCashflow[index].account === 'CF_OUT_Tax_Payment' ||
									selectedPeriodCashflow[index].account === 'CF_OUT_Utilities_Payment' ||
									selectedPeriodCashflow[index].account === 'CF_OUT_Bank_Administration'
								) {
									const data = {
										account: selectedPeriodCashflow[index].account.replace('CF_OUT_', '').replace(/_/g, ' '),
										valueSelected: convertToIdCurr(selectedPeriodCashflow[index].value),
										valuePrev: convertToIdCurr(prevPeriodCashflow[index].value),
										variances: convertToIdCurr(selectedPeriodCashflow[index].value - prevPeriodCashflow[index].value),
									};
									outOperatingActs.push(data);
								}
								// Get cashout financing acts
								else if (
									selectedPeriodCashflow[index].account === 'CF_OUT_Transfer_out_to_Related_Companies' ||
									selectedPeriodCashflow[index].account === 'CF_OUT_Owner_Expense'
								) {
									const data = {
										account: selectedPeriodCashflow[index].account.replace('CF_OUT_', '').replace(/_/g, ' '),
										valueSelected: convertToIdCurr(selectedPeriodCashflow[index].value),
										valuePrev: convertToIdCurr(prevPeriodCashflow[index].value),
										variances: convertToIdCurr(selectedPeriodCashflow[index].value - prevPeriodCashflow[index].value),
									};
									outFinancingActs.push(data);
								}
								// Get cashout investing acts
								else if (selectedPeriodCashflow[index].account === 'CF_OUT_Payment_to_Share_Holder') {
									const data = {
										account: selectedPeriodCashflow[index].account.replace('CF_OUT_', '').replace(/_/g, ' '),
										valueSelected: convertToIdCurr(selectedPeriodCashflow[index].value),
										valuePrev: convertToIdCurr(prevPeriodCashflow[index].value),
										variances: convertToIdCurr(selectedPeriodCashflow[index].value - prevPeriodCashflow[index].value),
									};
									outInvestingActs.push(data);
								} else {
									const data = {
										account: selectedPeriodCashflow[index].account.replace('CF_OUT_', '').replace(/_/g, ' '),
										valueSelected: convertToIdCurr(selectedPeriodCashflow[index].value),
										valuePrev: convertToIdCurr(prevPeriodCashflow[index].value),
										variances: convertToIdCurr(selectedPeriodCashflow[index].value - prevPeriodCashflow[index].value),
									};
									outOtherAndTotal.push(data);
								}
							}
						}
					}

					const oBankBalanceModel = new JSONModel({ bankBalance: bankBalance });
					const oInOperatingActsModel = new JSONModel({ inOperatingActs: inOperatingActs });
					const oInFinancingActsModel = new JSONModel({ inFinancingActs: inFinancingActs });
					const oInInvestingActsModel = new JSONModel({ inInvestingActs: inInvestingActs });

					const oInOtherModel = new JSONModel({ inOtherAndTotal: inOtherAndTotal });
					const oOutOperatingActsModel = new JSONModel({ outOperatingActs: outOperatingActs });
					const oOutFinancingActsModel = new JSONModel({ outFinancingActs: outFinancingActs });
					const oOutInvestingActsModel = new JSONModel({ outInvestingActs: outInvestingActs });
					const oOutOtherModel = new JSONModel({ outOtherAndTotal: outOtherAndTotal });

					// Set selected month in header table
					this.byId('idSelectedMonthLabel').setText(`${monthList[Number(selectedPeriod) - 1]} ${selectedYear}`);
					this.byId('idPrevMonthLabel').setText(`${monthList[Number(selectedPeriod) - 2]} ${selectedYear}`);

					this.getView().setModel(oBankBalanceModel, 'bankBalance');
					this.getView().setModel(oInOperatingActsModel, 'inOperatingActs');
					this.getView().setModel(oInFinancingActsModel, 'inFinancingActs');
					this.getView().setModel(oInInvestingActsModel, 'inInvestingActs');
					this.getView().setModel(oInOtherModel, 'inOtherAndTotal');
					console.log(bankBalance);

					this.getView().setModel(oOutOperatingActsModel, 'outOperatingActs');
					this.getView().setModel(oOutFinancingActsModel, 'outFinancingActs');
					this.getView().setModel(oOutInvestingActsModel, 'outInvestingActs');
					this.getView().setModel(oOutOtherModel, 'outOtherAndTotal');
					tableContainer.setBusy(false);
				}
			},

			getSelectedPeriodeCashflow: async function (selectedPeriod, selectedYear) {
				const tableContainer = this.byId('tableContainer');
				try {
					const cashflowData = await this.RequestReadWithFilter(
						'/cashflowSet',
						`CompanyCode eq 'LRLP'and PeriodeFrom eq '${selectedPeriod}'and PeriodeTo eq '${selectedPeriod}'and Year eq '${selectedYear}'`,
					);

					const cashflowPropsName = Object.keys(cashflowData.results[0]);
					const cashflowValue = Object.values(cashflowData.results[0]);
					const results = [];

					cashflowPropsName.forEach((el, i) => {
						results.push({
							account: el,
							value: Number(cashflowValue[i]),
						});
					});

					// tableContainer.setBusy(false);
					return results;
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
			},

			getPrevPeriodeCashflow: async function (selectedPeriod, selectedYear) {
				const tableContainer = this.byId('tableContainer');
				let prevPeriod = Number(selectedPeriod) - 1;
				prevPeriod = prevPeriod < 9 ? `0${prevPeriod}` : `${prevPeriod}`;

				try {
					const cashflowData = await this.RequestReadWithFilter(
						'/cashflowSet',
						`CompanyCode eq 'LRLP'and PeriodeFrom eq '${prevPeriod}'and PeriodeTo eq '${prevPeriod}'and Year eq '${selectedYear}'`,
					);

					const cashflowPropsName = Object.keys(cashflowData.results[0]);
					const cashflowValue = Object.values(cashflowData.results[0]);
					const results = [];

					cashflowPropsName.forEach((el, i) => {
						results.push({
							account: el,
							value: Number(cashflowValue[i]),
						});
					});

					// tableContainer.setBusy(false);
					return results;
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
