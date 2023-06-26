"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deviatesFromAverage = void 0;
/**
 * Check if the given price deviates from the average price.
 *
 * @param against The price to check against.
 * @param prices The prices to check against.
 * @param comparator Whether the price should be higher or lower than the average.
 * @param deviation The deviation in percentage.
 */
const deviatesFromAverage = (against, prices, comparator, deviation) => {
    const average = prices.average();
    if (!average) {
        // Not enough pricing data.
        return false;
    }
    const percentage = Math.abs(100 - (against.total() / average) * 100);
    if (percentage < deviation) {
        return false;
    }
    return comparator === "lower" /* Comparator.Lower */
        ? against.total() < average
        : against.total() > average;
};
exports.deviatesFromAverage = deviatesFromAverage;
