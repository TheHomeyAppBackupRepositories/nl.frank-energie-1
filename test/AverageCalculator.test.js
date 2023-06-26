"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const Helpers_1 = require("./Helpers");
const AverageCalculator_1 = require("../lib/AverageCalculator");
const dayjs_1 = __importDefault(require("dayjs"));
const PriceCollection_1 = __importDefault(require("../lib/PriceCollection"));
(0, globals_1.describe)('average calculator', () => {
    (0, globals_1.test)('it can calculate the deviation from average', () => {
        const prices = (0, Helpers_1.createPriceRange)([0.30, 0.31, 0.30], (0, dayjs_1.default)());
        const collection = new PriceCollection_1.default(prices.slice(1));
        (0, globals_1.expect)((0, AverageCalculator_1.deviatesFromAverage)((0, Helpers_1.createSinglePrice)(0.20), collection, "lower" /* Comparator.Lower */, 10)).toBeTruthy();
        (0, globals_1.expect)((0, AverageCalculator_1.deviatesFromAverage)((0, Helpers_1.createSinglePrice)(0.20), collection, "higher" /* Comparator.Higher */, 10)).toBeFalsy();
        (0, globals_1.expect)((0, AverageCalculator_1.deviatesFromAverage)((0, Helpers_1.createSinglePrice)(0.20), collection, "lower" /* Comparator.Lower */, 100)).toBeFalsy();
        (0, globals_1.expect)((0, AverageCalculator_1.deviatesFromAverage)((0, Helpers_1.createSinglePrice)(0.20), collection, "higher" /* Comparator.Higher */, 100)).toBeFalsy();
        (0, globals_1.expect)((0, AverageCalculator_1.deviatesFromAverage)((0, Helpers_1.createSinglePrice)(0.40), collection, "higher" /* Comparator.Higher */, 10)).toBeTruthy();
        (0, globals_1.expect)((0, AverageCalculator_1.deviatesFromAverage)((0, Helpers_1.createSinglePrice)(0.40), collection, "higher" /* Comparator.Higher */, 100)).toBeFalsy();
    });
    (0, globals_1.test)('it returns false if no pricing data was available', () => {
        const collection = new PriceCollection_1.default([]);
        (0, globals_1.expect)((0, AverageCalculator_1.deviatesFromAverage)((0, Helpers_1.createSinglePrice)(0.30), collection, "lower" /* Comparator.Lower */, 5)).toBeFalsy();
    });
});
