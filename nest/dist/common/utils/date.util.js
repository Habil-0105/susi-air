"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUtcDateOnly = getUtcDateOnly;
exports.formatUtcDate = formatUtcDate;
exports.addDaysUtc = addDaysUtc;
exports.diffDaysUtc = diffDaysUtc;
function getUtcDateOnly(dateString) {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day));
}
function formatUtcDate(date) {
    return date.toISOString().split('T')[0];
}
function addDaysUtc(date, days) {
    const newDate = new Date(date.getTime());
    newDate.setUTCDate(date.getUTCDate() + days);
    return newDate;
}
function diffDaysUtc(d1, d2) {
    return Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
}
//# sourceMappingURL=date.util.js.map