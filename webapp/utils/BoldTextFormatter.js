// utils/BoldTextFormatter.js
sap.ui.define([], function () {
  "use strict";

  return {
    BoldTextFormatter: function (isBold) {
      if (isBold) {
        return "boldText"; // You can define a CSS class for bold text
      }
      return "";
    },
  };
});
