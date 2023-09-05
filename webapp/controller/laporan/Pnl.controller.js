sap.ui.define(
    ["lrlpapp/controller/BaseController", "sap/ui/core/HTML"],
    function (BaseController, HTML) {
        "use strict";

        let zPNLReport;
        const PNL_DEV =
            "https://lrna.edugate.web.id:8080/sap/bc/se/m/index.html?~transaction=F.01&sap-personas-flavor=D037450CC64D1EDE92DFA751C23B4427&sap-se-hide-splashscreen=X&sap-client=116&sap-language=EN&sap-accessibility=X";
        const PNL_QAS =
            "https://lrna.edugate.web.id:8090/sap/bc/se/m/index.html?~transaction=F.01&sap-personas-flavor=D037450CC64D1EDE92DFA751C23B4427&sap-se-hide-splashscreen=X&sap-client=400&sap-language=EN&sap-accessibility=X";
        const PNL_PRD =
            "https://lrna.edugate.web.id:80/sap/bc/se/m/index.html?~transaction=F.01&sap-personas-flavor=D037450CC64D1EDE92DFA751C23B4427&sap-se-hide-splashscreen=X&sap-client=366&sap-language=EN&sap-accessibility=X";

        return BaseController.extend("lrlpapp.controller.laporan.pnl", {
            onAfterRendering: function () {
                const pnlPage = this.getView().byId("pnlPage");
                const portURL = window.location.port;
                if (portURL === "8080") {
                    zPNLReport = `<iframe src="${PNL_DEV}" width="100%" height="100%"></iframe>`;
                }
                if (portURL === "8090") {
                    zPNLReport = `<iframe src="${PNL_QAS}" width="100%" height="100%"></iframe>`;
                }
                if (portURL === "80") {
                    zPNLReport = `<iframe src="${PNL_PRD}" width="100%" height="100%"></iframe>`;
                }

                pnlPage.removeAllContent();
                pnlPage.addContent(
                    new HTML({
                        content: zPNLReport,
                    })
                );
            },
        });
    }
);
