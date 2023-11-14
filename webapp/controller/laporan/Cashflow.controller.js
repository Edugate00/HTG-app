sap.ui.define(
	['lrlpapp/controller/BaseController', 'sap/ui/model/json/JSONModel', 'sap/m/HBox', 'sap/m/FlexBox', 'sap/m/Text'],
	function (BaseController, JSONModel, HBox, FlexBox, Text) {
		'use strict';

		const date = new Date();
		const year = date.getFullYear();

		const convertToIdCurr = (value) => {
			return value.toLocaleString('id-ID', {
				style: 'currency',
				currency: 'IDR',
			});
		};

		// Default value for previous cash flow. When the user choose periode 09, then value of previous cash flow will be Rp.00 follow by this variable
		const defaultPrevPeriodCashflow = [
			{
				account: '__metadata',
				value: 0,
			},
			{
				account: 'CF_Other_In_Out_Flows',
				value: 0,
			},
			{
				account: 'CF_IN_Other_Inflows',
				value: 0,
			},
			{
				account: 'CF_OUT_Other_Outflows',
				value: 0,
			},
			{
				account: 'CompanyCode',
				value: 0,
			},
			{
				account: 'PeriodeFrom',
				value: 0,
			},
			{
				account: 'PeriodeTo',
				value: 0,
			},
			{
				account: 'Year',
				value: 0,
			},
			{
				account: 'CF_IN_Bank_Beginning_Balance',
				value: 0,
			},
			{
				account: 'CF_IN_Citiwalk_Rent_Payment',
				value: 0,
			},
			{
				account: 'CF_IN_Transfer_from_SIBO',
				value: 0,
			},
			{
				account: 'CF_IN_Transfer_in_from_Related_Companies',
				value: 0,
			},
			{
				account: 'CF_IN_Other_Income',
				value: 0,
			},
			{
				account: 'CF_IN_Banks_Interest',
				value: 0,
			},
			{
				account: 'CF_IN_Total_Cash_Inflows',
				value: 0,
			},
			{
				account: 'CF_OUT_Payment_to_Third_Party_Vendors',
				value: 0,
			},
			{
				account: 'CF_OUT_Transfer_out_to_Related_Companies',
				value: 0,
			},
			{
				account: 'CF_OUT_Payment_to_Share_Holder',
				value: 0,
			},
			{
				account: 'CF_OUT_Owner_Expense',
				value: 0,
			},
			{
				account: 'CF_OUT_Tax_Payment',
				value: 0,
			},
			{
				account: 'CF_OUT_Utilities_Payment',
				value: 0,
			},
			{
				account: 'CF_OUT_Bank_Administration',
				value: 0,
			},
			{
				account: 'CF_OUT_Total_Cash_Outflows',
				value: 0,
			},
		];

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

				const selectedPeriod = dropdownPeriode.getSelectedKey();
				const selectedYear = dropdownYear.getSelectedKey();

				const cashflowContainer = this.byId('cashflowContainer');

				const monthList = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

				let bankBalance = [];

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

				// Get total Inflows - Outflows and End Bank Balance
				let bankBalanceSelected = null,
					bankBalancePrev = null,
					totalInSelected = null,
					totalInPrev = null,
					totalOutSelected = null,
					totalOutPrev = null;

				if (selectedYear == '2023' && selectedPeriod < '09') {
					const that = this;
					this.errorMessageBox(
						'Tidak bisa memilih periode sebelum periode 09 untuk Report Cashflow tahun 2023',
						'Report Cashflow Message',
						that.onAfterRendering(),
					);
				} else {
					cashflowContainer.setBusy(true);
					const selectedPeriodCashflow = await this.getSelectedPeriodeCashflow(selectedPeriod, selectedYear);

					// Initialized previous period
					const prevPeriodMonth = selectedPeriod === '01' ? '12' : (Number(selectedPeriod) - 1).toString();
					const prevPeriodYear = selectedPeriod === '01' ? (Number(selectedYear) - 1).toString() : selectedYear;

					// Initialized previous cashflow when user choose periode eq 09 or not, if not, then get cashflow data from function getPrevPeriodeCashflow()
					const prevPeriodCashflow =
						(await selectedPeriod) === '09'
							? defaultPrevPeriodCashflow
							: await this.getPrevPeriodeCashflow(prevPeriodMonth, prevPeriodYear);

					if (selectedPeriodCashflow.length === prevPeriodCashflow.length) {
						for (let index = 0; index < selectedPeriodCashflow.length; index++) {
							if (selectedPeriodCashflow[index].account.includes('CF_IN')) {
								if (selectedPeriodCashflow[index].account === 'CF_IN_Bank_Beginning_Balance') {
									const data = {
										account: selectedPeriodCashflow[index].account.replace('CF_IN_', '').replace(/_/g, ' '),
										valueSelected: convertToIdCurr(selectedPeriodCashflow[index].value),
										valuePrev: convertToIdCurr(prevPeriodCashflow[index].value),
										variances: convertToIdCurr(selectedPeriodCashflow[index].value - prevPeriodCashflow[index].value),
									};
									bankBalanceSelected = selectedPeriodCashflow[index].value;
									bankBalancePrev = prevPeriodCashflow[index].value;
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

									totalInSelected = selectedPeriodCashflow[index].account.includes('Total')
										? selectedPeriodCashflow[index].value
										: 0;

									totalInPrev = selectedPeriodCashflow[index].account.includes('Total')
										? prevPeriodCashflow[index].value
										: 0;

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

									totalOutSelected = selectedPeriodCashflow[index].account.includes('Total')
										? selectedPeriodCashflow[index].value
										: 0;

									totalOutPrev = selectedPeriodCashflow[index].account.includes('Total')
										? prevPeriodCashflow[index].value
										: 0;

									outOtherAndTotal.push(data);
								}
							}
						}
					}

					let totalInMinOutFlowsSelected = totalInSelected - totalOutSelected;
					let totalInMinOutFlowsPrev = totalInPrev - totalOutPrev;

					let endBankBalanceSelected = bankBalanceSelected - (totalInSelected + totalOutSelected);
					let endBankBalancePrev = bankBalancePrev - (totalInPrev + totalOutPrev);

					const totalEndBalance = [
						{
							account: 'Total Inflows - Outflows',
							valueSelected: convertToIdCurr(totalInMinOutFlowsSelected),
							valuePrev: convertToIdCurr(totalInMinOutFlowsPrev),
							variances: convertToIdCurr(totalInMinOutFlowsSelected - totalInMinOutFlowsPrev),
						},
						{
							account: 'Bank Ending Balance',
							valueSelected: convertToIdCurr(endBankBalanceSelected),
							valuePrev: convertToIdCurr(endBankBalancePrev),
							variances: convertToIdCurr(endBankBalanceSelected - endBankBalancePrev),
						},
					];

					// Clear base container to return new values
					await this.clearContainer()
						.then(async () => {
							// generate new id to handle error duplicate id when create new cash flow in different period
							const generateNewAccountId = (account) => {
								const newId = `${account.replace(/ /g, '')}${Math.round(Math.random() * 100)}`;
								return newId;
							};

							// set period and show to XML view
							const setSelectedPeriod = async () => {
								const record = new HBox('').addStyleClass('cf-record');
								const descCol = new FlexBox({ width: '40%' }).addStyleClass('cf-header');
								const selectedMonth = new FlexBox({ width: '20%', justifyContent: 'End' }).addStyleClass('cf-header');
								const prevMonth = new FlexBox({ width: '20%', justifyContent: 'End' }).addStyleClass('cf-header');
								const varianceCol = new FlexBox({ width: '20%', justifyContent: 'End' }).addStyleClass('cf-header');

								// add text
								descCol.addItem(new Text({ text: '' })).addStyleClass('cf-acc');
								selectedMonth
									.addItem(new Text({ text: `${monthList[Number(selectedPeriod) - 1]} ${selectedYear}` }))
									.addStyleClass('cf-selectedMonth');
								prevMonth
									.addItem(new Text({ text: `${monthList[Number(selectedPeriod) - 2]} ${selectedYear}` }))
									.addStyleClass('cf-prevMonth');
								varianceCol.addItem(new Text({ text: 'Variances' })).addStyleClass('cf-variances');

								record.addItem(descCol);
								record.addItem(selectedMonth);
								record.addItem(prevMonth);
								record.addItem(varianceCol);
								cashflowContainer.addItem(record);
							};
							// call function to set period and show to XML view
							await setSelectedPeriod();

							// loop bank balance to get bank balance to show to XML view
							bankBalance.forEach((el) => {
								const record = new HBox(generateNewAccountId(el.account)).addStyleClass('cf-record');
								const descCol = new FlexBox({ width: '40%' }).addStyleClass('cf-header');
								const selectedMonthCol = new FlexBox({ width: '20%', justifyContent: 'End' }).addStyleClass(
									'cf-header',
								);
								const prevMonthCol = new FlexBox({ width: '20%', justifyContent: 'End' }).addStyleClass('cf-header');
								const varianceCol = new FlexBox({ width: '20%', justifyContent: 'End' }).addStyleClass('cf-header');

								const boldTextInit = el.account.includes('Bank Beginning Balance') ? 'cf-acc-bold' : 'cf-acc';

								descCol.addItem(new Text({ text: el.account }).addStyleClass('cf-acc-bold'));
								selectedMonthCol.addItem(new Text({ text: el.valueSelected }).addStyleClass(boldTextInit));
								prevMonthCol.addItem(new Text({ text: el.valuePrev }).addStyleClass(boldTextInit));
								varianceCol.addItem(new Text({ text: el.variances }).addStyleClass(boldTextInit));

								// Add to the recordList
								record.addItem(descCol);
								record.addItem(selectedMonthCol);
								record.addItem(prevMonthCol);
								record.addItem(varianceCol);

								cashflowContainer.addItem(record);
							});

							// Function to Set header/title cash flow data
							const setHeaderTitle = (title) => {
								const wrapperTitle = new HBox().addStyleClass('cf-record');
								const wrapperHeader = new FlexBox({ width: '40%' }).addStyleClass('cf-header');
								const blank = title === 'Operating Activities' ? 'cf-title-section' : 'cf-title-section-content';
								wrapperHeader.addItem(new Text({ text: title }).addStyleClass(blank));

								wrapperTitle.addItem(wrapperHeader);
								return wrapperTitle;
							};
							await cashflowContainer.addItem(setHeaderTitle('Cash Inflows')); // call function set header to create Cash Inflows title

							// function to show all cash flows to XML with any cash flow
							const displayCashflow = async (cashflow, titleHeader) => {
								await cashflowContainer.addItem(setHeaderTitle(titleHeader));
								cashflow.forEach((el) => {
									const record = new HBox(generateNewAccountId(el.account)).addStyleClass('cf-record');
									const descCol = new FlexBox({ width: '40%' }).addStyleClass('cf-header');
									const selectedMonthCol = new FlexBox({ width: '20%', justifyContent: 'End' }).addStyleClass(
										'cf-header',
									);
									const prevMonthCol = new FlexBox({ width: '20%', justifyContent: 'End' }).addStyleClass('cf-header');
									const varianceCol = new FlexBox({ width: '20%', justifyContent: 'End' }).addStyleClass('cf-header');

									const boldTextInit =
										el.account.includes('Total') || el.account.includes('Bank Ending Balance')
											? 'cf-acc-bold'
											: 'cf-acc';

									descCol.addItem(new Text({ text: el.account }).addStyleClass(boldTextInit));
									selectedMonthCol.addItem(new Text({ text: el.valueSelected }).addStyleClass(boldTextInit));
									prevMonthCol.addItem(new Text({ text: el.valuePrev }).addStyleClass(boldTextInit));
									varianceCol.addItem(new Text({ text: el.variances }).addStyleClass(boldTextInit));

									// Add to the recordList
									record.addItem(descCol);
									record.addItem(selectedMonthCol);
									record.addItem(prevMonthCol);
									record.addItem(varianceCol);

									cashflowContainer.addItem(record);
								});
							};

							// call function displayCashflow for cash in only
							const displayInCashflow = async () => {
								await displayCashflow(inOperatingActs, 'Operating Activities');
								await displayCashflow(inFinancingActs, 'Financing Activities');
								await displayCashflow(inInvestingActs, 'Investing Activities');
								await displayCashflow(inOtherAndTotal, '');
							};

							// call function displayCashflow for cash out only
							const displayOutCashflow = async () => {
								await cashflowContainer.addItem(setHeaderTitle('Cash Outflows'));
								await displayCashflow(outOperatingActs, 'Operating Activities');
								await displayCashflow(outFinancingActs, 'Financing Activities');
								await displayCashflow(outInvestingActs, 'Investing Activities');
								await displayCashflow(outOtherAndTotal, '');
								await displayCashflow(totalEndBalance, '');
							};

							// call function display cash in and cash out
							await displayInCashflow();
							await displayOutCashflow();

							// create oSelectedyear to save selected year and can be used to XML view
							const oSelectedYear = new JSONModel({ selectedYear: [{ selectedYear: selectedYear }] });
							this.getView().setModel(oSelectedYear, 'selectedYear');

							cashflowContainer.setBusy(false); // turn off busy indicator when proses finish
						})
						.catch((err) => {
							console.log(err);
						});
				}
			},

			clearContainer: async function () {
				const cashflowContainer = this.byId('cashflowContainer');
				return new Promise(async (resolve, reject) => {
					try {
						await cashflowContainer.removeAllItems();
						resolve('Container removed successfully');
					} catch (error) {
						reject('Something Error when clear container');
					}
				});
			},

			getSelectedPeriodeCashflow: async function (selectedPeriod, selectedYear) {
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
					return results;
				} catch (error) {
					const that = this;
					this.errorMessageBox(`${error.statusCode} - ${error.statusText}`, error.message, that.onAfterRendering());
				}
			},

			getPrevPeriodeCashflow: async function (selectedPeriod, selectedYear) {
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

					return results;
				} catch (error) {
					const that = this;
					this.errorMessageBox(`${error.statusCode} - ${error.statusText}`, error.message, that.onAfterRendering());
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
