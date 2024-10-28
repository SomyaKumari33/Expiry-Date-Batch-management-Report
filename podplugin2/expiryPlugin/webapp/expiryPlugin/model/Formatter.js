sap.ui.define([], function () {
    "use strict";
    return {
        formatDate: function (dateString) {
            if (!dateString) return "N/A"; // Check for null or undefined
            var date = new Date(dateString);
            return sap.ui.core.format.DateFormat.getDateInstance({ pattern: "yyyy-MM-dd" }).format(date);
        },

        formatShelfLife: function (shelfLifeDateString) {
            if (!shelfLifeDateString) return "N/A"; // Check for null or undefined
            var date = new Date(shelfLifeDateString);
            return sap.ui.core.format.DateFormat.getDateInstance({ pattern: "yyyy-MM-dd" }).format(date);
        }
    };
});
