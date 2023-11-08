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
				const dropdownYear = this.byId('yearDD');

				dropdownYear.setSelectedKey(year);

				if (dropdownYear.getSelectedKey() == '2023') {
					dropdownPeriodeFrom.setSelectedKey('10');
				} else {
					dropdownPeriodeFrom.setSelectedKey('01');
				}

				this.onApplyPress();
			},

			onApplyPress: async function () {
				this.getCashflowData();
				// const dropdownPeriodeFrom = this.byId('perioedFromDD');
				// const dropdownYear = this.byId('yearDD');

				// const tableContainer = this.byId('tableContainer');

				// const selectedPeriodFrom = dropdownPeriodeFrom.getSelectedKey();
				// const selectedYear = dropdownYear.getSelectedKey();

				// // console.log(selectedPeriodFrom);
				// // console.log(selectedPeriodTo);
				// // console.log(selectedYear);

				// if (selectedYear == '2023' && selectedPeriodFrom < '09') {
				// 	const that = this;
				// 	MessageBox.show('Tidak bisa memilih periode sebelum periode 09 untuk Report Cashflow tahun 2023.', {
				// 		icon: MessageBox.Icon.INFORMATION,
				// 		title: 'Report Cashflow Message',
				// 		action: [MessageBox.Action.OK],
				// 		emphasizedAction: MessageBox.Action.OK,
				// 		onClose: (oAction) => {
				// 			that.onAfterRendering();
				// 		},
				// 	});
				// } else {
				// 	tableContainer.setBusy(true);

				// 	try {
				// 		const cashflowData = await this.RequestReadWithFilter(
				// 			'/cashflowSet',
				// 			`CompanyCode eq 'LRLP'and PeriodeFrom eq '${selectedPeriodFrom}'and PeriodeTo eq '${selectedPeriodFrom}'and Year eq '${selectedYear}'`,
				// 		);

				// 		console.log(cashflowData);

				// 		const cashflowPropsName = Object.keys(cashflowData.results[0]);
				// 		const cashflowValue = Object.values(cashflowData.results[0]);
				// 		const cashInflow = [];
				// 		const cashOutflow = [];
				// 		const bankBalanceFlows = [];

				// 		let bankBalance = null;
				// 		let totalIn = null;
				// 		let totalOut = null;

				// 		let endBankBalance;
				// 		let totalInMinOutflows;
				// 		let isInOutflows;

				// 		let otherInOutFlowsName = null;
				// 		let otherInOutFlowsValue = null;

				// 		cashflowPropsName.forEach((el, i) => {
				// 			if (
				// 				el !== '__metadata' &&
				// 				el !== 'CompanyCode' &&
				// 				el !== 'PeriodeFrom' &&
				// 				el !== 'PeriodeTo' &&
				// 				el !== 'Year'
				// 			) {
				// 				if (el.includes('CF_IN')) {
				// 					if (el.includes('CF_IN_Bank_Balance_brought_forward')) {
				// 						bankBalance = Number(cashflowValue[i]);
				// 						el = el.replace('CF_IN_', '');
				// 						el = el.replace(/_/g, ' ');

				// 						bankBalanceFlows.push({
				// 							account: el,
				// 							value: Number(cashflowValue[i]).toLocaleString('id-ID', {
				// 								style: 'currency',
				// 								currency: 'IDR',
				// 							}),
				// 						});
				// 					} else {
				// 						if (el.includes('CF_IN_Total_Cash_Inflows')) {
				// 							totalIn = Number(cashflowValue[i]);
				// 						}

				// 						el = el.replace('CF_IN_', '');
				// 						el = el.replace(/_/g, ' ');
				// 						cashInflow.push({
				// 							account: el,
				// 							value: Number(cashflowValue[i]).toLocaleString('id-ID', {
				// 								style: 'currency',
				// 								currency: 'IDR',
				// 							}),
				// 						});
				// 					}
				// 				} else if (el.includes('CF_OUT')) {
				// 					if (el.includes('CF_OUT_Total_Cash_Outflows')) {
				// 						totalOut = Number(cashflowValue[i]);
				// 					}

				// 					el = el.replace('CF_OUT_', '');
				// 					el = el.replace(/_/g, ' ');
				// 					cashOutflow.push({
				// 						account: el,
				// 						value: Number(cashflowValue[i]).toLocaleString('id-ID', {
				// 							style: 'currency',
				// 							currency: 'IDR',
				// 						}),
				// 					});
				// 				}
				// 			}
				// 		});

				// 		totalInMinOutflows = totalIn - totalOut;
				// 		endBankBalance = bankBalance + totalIn - totalOut;
				// 		isInOutflows = bankBalance - endBankBalance;

				// 		// console.log('TOTAL IN:', totalIn);
				// 		// console.log('TOTAL OUT:', totalOut);
				// 		// console.log('BANK BALANCE:', bankBalance);

				// 		// console.log(totalInMinOutflows);
				// 		// console.log(endBankBalance);
				// 		// console.log(isInOutflows);

				// 		// Input Row kosong
				// 		cashOutflow.push({ account: '', value: '' });
				// 		cashOutflow.push({
				// 			account: 'Total Inflows - Outflows',
				// 			value: totalInMinOutflows.toLocaleString('id-ID', {
				// 				style: 'currency',
				// 				currency: 'IDR',
				// 			}),
				// 		});
				// 		cashOutflow.push({
				// 			account: 'End Bank Balance',
				// 			value: endBankBalance.toLocaleString('id-ID', {
				// 				style: 'currency',
				// 				currency: 'IDR',
				// 			}),
				// 		});

				// 		console.log(cashInflow);
				// 		console.log(cashOutflow);

				// 		const oBankBalanceModel = new JSONModel({ bankBalanceFlows: bankBalanceFlows });
				// 		const oCashInModel = new JSONModel({ cashInflow: cashInflow });
				// 		const oCashOutModel = new JSONModel({ cashOutflow: cashOutflow });

				// 		this.getView().setModel(oBankBalanceModel, 'bankBalanceFlows');
				// 		this.getView().setModel(oCashInModel, 'cashInflowModel');
				// 		this.getView().setModel(oCashOutModel, 'cashOutflowModel');

				// 		tableContainer.setBusy(false);
				// 	} catch (error) {
				// 		tableContainer.setBusy(false);

				// 		const that = this;
				// 		MessageBox.show(`${error.statusCode} - ${error.statusText}`, {
				// 			icon: MessageBox.Icon.ERROR,
				// 			title: `${error.message}`,
				// 			action: [MessageBox.Action.OK],
				// 			emphasizedAction: MessageBox.Action.OK,
				// 			onClose: (oAction) => {
				// 				that.onAfterRendering();
				// 			},
				// 		});
				// 	}
				// }
			},

			getCashflowData: async function () {
				const dropdownPeriode = this.byId('perioedFromDD');
				const dropdownYear = this.byId('yearDD');
				const tableContainer = this.byId('tableContainer');

				const selectedPeriod = dropdownPeriode.getSelectedKey();
				const selectedYear = dropdownYear.getSelectedKey();

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
					// tableContainer.setBusy(true);
					const selectedPeriodCashflow = await this.getSelectedPeriodeCashflow(selectedPeriod, selectedYear);
					const prevPeriodCashflow = await this.getPrevPeriodeCashflow(selectedPeriod, selectedYear);

					console.log(selectedPeriodCashflow);
					console.log(prevPeriodCashflow);

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

					selectedPeriodCashflow.forEach((el) => {
						if (el.account.includes('CF_IN')) {
							// Get bank balance
							if (el.account === 'CF_IN_Bank_Balance_brought_forward') {
								el.account = el.account.replace('CF_IN_', '');
								el.account = el.account.replace(/_/g, ' ');
								bankBalance.push(el);
							}
							// Get cashin operating acts
							else if (
								el.account === 'CF_IN_Citiwalk_Rent_Payment' ||
								el.account === 'CF_IN_Other_Income' ||
								el.account === 'CF_IN_Banks_Interest'
							) {
								el.account = el.account.replace('CF_IN_', '');
								el.account = el.account.replace(/_/g, ' ');
								inOperatingActs.push(el);
							}
							// Get cashin financing acts
							else if (el.account === 'CF_IN_Transfer_in_from_Related_Companies') {
								el.account = el.account.replace('CF_IN_', '');
								el.account = el.account.replace(/_/g, ' ');
								inFinancingActs.push(el);
							}
							// Get cashin investing acts
							else if (el.account === 'CF_IN_Transfer_from_SIBO') {
								el.account = el.account.replace('CF_IN_', '');
								el.account = el.account.replace(/_/g, ' ');
								inInvestingActs.push(el);
							} else {
								el.account = el.account.replace('CF_IN_', '');
								el.account = el.account.replace(/_/g, ' ');
								inOtherAndTotal.push(el);
							}
						} else if (el.account.includes('CF_OUT')) {
							// Get cashout operating acts
							if (
								el.account === 'CF_OUT_Payment_to_Third_Party_Vendors' ||
								el.account === 'CF_OUT_Tax_Payment' ||
								el.account === 'CF_OUT_Utilities_Payment' ||
								el.account === 'CF_OUT_Bank_Administration'
							) {
								el.account = el.account.replace('CF_OUT_', '');
								el.account = el.account.replace(/_/g, ' ');
								outOperatingActs.push(el);
							}
							// Get cashout financing acts
							else if (
								el.account === 'CF_OUT_Transfer_out_to_Related_Companies' ||
								el.account === 'CF_OUT_Owner_Expense'
							) {
								el.account = el.account.replace('CF_OUT_', '');
								el.account = el.account.replace(/_/g, ' ');
								outFinancingActs.push(el);
							}
							// Get cashout investing acts
							else if (el.account === 'CF_OUT_Payment_to_Share_Holder') {
								el.account = el.account.replace('CF_OUT_', '');
								el.account = el.account.replace(/_/g, ' ');
								outInvestingActs.push(el);
							} else {
								el.account = el.account.replace('CF_OUT_', '');
								el.account = el.account.replace(/_/g, ' ');
								outOtherAndTotal.push(el);
							}
						}
					});

					const oBankBalanceModel = new JSONModel({ bankBalance: bankBalance });
					const oInOperatingActsModel = new JSONModel({ inOperatingActs: inOperatingActs });
					const oInFinancingActsModel = new JSONModel({ inFinancingActs: inFinancingActs });
					const oInInvestingActsModel = new JSONModel({ inInvestingActs: inInvestingActs });

					const oInOtherModel = new JSONModel({ inOtherAndTotal: inOtherAndTotal });
					const oOutOperatingActsModel = new JSONModel({ outOperatingActs: outOperatingActs });
					const oOutFinancingActsModel = new JSONModel({ outFinancingActs: outFinancingActs });
					const oOutInvestingActsModel = new JSONModel({ outInvestingActs: outInvestingActs });
					const oOutOtherModel = new JSONModel({ outOtherAndTotal: outOtherAndTotal });

					this.getView().setModel(oBankBalanceModel, 'bankBalance');
					this.getView().setModel(oInOperatingActsModel, 'inOperatingActs');
					this.getView().setModel(oInFinancingActsModel, 'inFinancingActs');
					this.getView().setModel(oInInvestingActsModel, 'inInvestingActs');
					this.getView().setModel(oInOtherModel, 'inOtherAndTotal');
					this.getView().setModel(oOutOperatingActsModel, 'outOperatingActs');
					this.getView().setModel(oOutFinancingActsModel, 'outFinancingActs');
					this.getView().setModel(oOutInvestingActsModel, 'outInvestingActs');
					this.getView().setModel(oOutOtherModel, 'outOtherAndTotal');

					console.log(this.getView().getModel('inFinancingActs'));
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
							value: Number(cashflowValue[i]).toLocaleString('id-ID', {
								style: 'currency',
								currency: 'IDR',
							}),
						});
					});

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
							value: Number(cashflowValue[i]).toLocaleString('id-ID', {
								style: 'currency',
								currency: 'IDR',
							}),
						});
					});

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
