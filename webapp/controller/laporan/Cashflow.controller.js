sap.ui.define(
	['lrlpapp/controller/BaseController', 'sap/ui/model/json/JSONModel', 'lrlpapp/utils/BoldTextFormatter'],
	function (BaseController, JSONModel, BoldTextFormatter) {
		'use strict';

		return BaseController.extend('lrlpapp.controller.laporan.Cashflow', {
			onAfterRendering: async function () {
				const cashflowData = await this.RequestReadWithFilter(
					'/cashflowSet',
					`CompanyCode eq 'LRLP'and PeriodeFrom eq '01'and PeriodeTo eq '12'and Year eq '2023'`,
				);

				const cashflowPropsName = Object.keys(cashflowData.results[0]);
				const cashflowValue = Object.values(cashflowData.results[0]);
				const cashflow = [];

				cashflowPropsName.forEach((el, i) => {
					if (
						el !== '__metadata' &&
						el !== 'CompanyCode' &&
						el !== 'PeriodeFrom' &&
						el !== 'PeriodeTo' &&
						el !== 'Year'
					) {
						cashflow.push({
							account: el,
							value: Number(cashflowValue[i]).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }),
						});
					}
				});

				const oModel = new JSONModel({ cashflow: cashflow });
				this.getView().setModel(oModel, 'cashFlowModel');
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
