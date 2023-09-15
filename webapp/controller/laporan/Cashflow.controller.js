sap.ui.define(
    ["lrlpapp/controller/BaseController", "sap/ui/core/HTML"],
    function (BaseController, HTML) {
        "use strict";

        let zCFReport;
        let CFPage;
        const CF_DEV =
            "https://lrna.edugate.web.id:8080/sap/bc/se/m/index.html?~transaction=FAGLB03&sap-personas-flavor=D037450CC64D1EDE92F0DEBDBE000427&sap-se-hide-splashscreen=X&sap-client=116&sap-language=EN&sap-accessibility=X";
        const CF_QAS =
            "https://lrna.edugate.web.id:8090/sap/bc/se/m/index.html?~transaction=FAGLB03&sap-personas-flavor=D037450CC64D1EDE92F0DEBDBE000427&sap-se-hide-splashscreen=X&sap-client=400&sap-language=EN&sap-accessibility=X";
        const CF_PRD =
            "https://lrna.edugate.web.id:80/sap/bc/se/m/index.html?~transaction=FAGLB03&sap-personas-flavor=D037450CC64D1EDE92F0DEBDBE000427&sap-se-hide-splashscreen=X&sap-client=366&sap-language=EN&sap-accessibility=X";

        return BaseController.extend("lrlpapp.controller.laporan.cashflow", {
            onInit: function () {
                CFPage = this.getView().byId("cfPage");
            }, 

            onAfterRendering: function () {
                const portURL = window.location.port;
                if (portURL === "8080") {
                    zCFReport = `<iframe src="${CF_DEV}" width="100%" height="100%"></iframe>`;
                }
                if (portURL === "8090") {
                    zCFReport = `<iframe src="${CF_QAS}" width="100%" height="100%"></iframe>`;
                }
                if (portURL === "80") {
                    zCFReport = `<iframe src="${CF_PRD}" width="100%" height="100%"></iframe>`;
                }

                CFPage.removeAllContent();
                CFPage.addContent(
                    new HTML({
                        content: zCFReport,
                    })
                );
            },
        });
    }
);
