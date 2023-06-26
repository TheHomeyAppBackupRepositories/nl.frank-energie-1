"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const Helpers_1 = require("./Helpers");
const PriceCollection_1 = __importDefault(require("../lib/PriceCollection"));
const dayjs_1 = __importDefault(require("dayjs"));
const isBetween_1 = __importDefault(require("dayjs/plugin/isBetween"));
(0, globals_1.beforeAll)(() => {
    dayjs_1.default.extend(isBetween_1.default);
});
(0, globals_1.describe)('price collection', () => {
    (0, globals_1.test)('it can get the current price', () => {
        const prices = (0, Helpers_1.createPriceRange)([0.30, 0.31, 0.32], (0, dayjs_1.default)());
        const collection = new PriceCollection_1.default(prices);
        const current = collection.current();
        (0, globals_1.expect)(current).not.toBeNull();
        (0, globals_1.expect)(current.total()).toBe(0.30);
    });
    (0, globals_1.test)('it can get the prices for a certain date', () => {
        const prices = (0, Helpers_1.createPriceRange)([0.30, 0.31, 0.32, 0.33], (0, dayjs_1.default)("10-11-2023 22:00:00"));
        const collection = new PriceCollection_1.default(prices);
        const pricesForDay = collection.forDate((0, dayjs_1.default)("10-11-2023"));
        (0, globals_1.expect)(pricesForDay).not.toBeNull();
        (0, globals_1.expect)(pricesForDay.getPrices().length).toBe(2);
        (0, globals_1.expect)(pricesForDay.getPrices().map(p => p.total())).toStrictEqual([0.30, 0.31]);
    });
    (0, globals_1.test)('it can get the highest price in the collection', () => {
        const prices = (0, Helpers_1.createPriceRange)([0.30, 0.31, 0.32, 0.33], (0, dayjs_1.default)());
        const collection = new PriceCollection_1.default(prices);
        const highest = collection.highest();
        (0, globals_1.expect)(highest).not.toBeNull();
        (0, globals_1.expect)(highest.total()).toBe(0.33);
    });
    (0, globals_1.test)('it can get the lowest price in the collection', () => {
        const prices = (0, Helpers_1.createPriceRange)([0.30, 0.31, 0.32, 0.33], (0, dayjs_1.default)());
        const collection = new PriceCollection_1.default(prices);
        const lowest = collection.lowest();
        (0, globals_1.expect)(lowest).not.toBeNull();
        (0, globals_1.expect)(lowest.total()).toBe(0.30);
    });
    (0, globals_1.test)('it can get the average price of the collection', () => {
        const prices = (0, Helpers_1.createPriceRange)([0.30, 0.31, 0.32, 0.33], (0, dayjs_1.default)());
        const collection = new PriceCollection_1.default(prices);
        const average = collection.average();
        (0, globals_1.expect)(average).not.toBeNull();
        (0, globals_1.expect)(average).toBe(0.315);
    });
    (0, globals_1.test)('it can get next few hours of pricing based on the current time', () => {
        const prices = (0, Helpers_1.createPriceRange)([0.30, 0.31, 0.32, 0.33], (0, dayjs_1.default)());
        const collection = new PriceCollection_1.default(prices);
        const nextHours = collection.getForNextHours(2);
        (0, globals_1.expect)(nextHours).not.toBeNull();
        (0, globals_1.expect)(nextHours.getPrices().map(p => p.total())).toStrictEqual([0.31, 0.32]);
    });
    (0, globals_1.test)('it can get the prices within a given time range', () => {
        const prices = (0, Helpers_1.createPriceRange)([0.30, 0.31, 0.32, 0.33, 0.34, 0.35], (0, dayjs_1.default)().hour(10).minute(0).second(0));
        const collection = new PriceCollection_1.default(prices);
        const pricesWithinRange = collection.getWithinRange((0, dayjs_1.default)().hour(11).startOf('hour'), (0, dayjs_1.default)().hour(13).startOf('hour'));
        (0, globals_1.expect)(pricesWithinRange).not.toBeNull();
        (0, globals_1.expect)(pricesWithinRange.getPrices().map(p => p.total())).toStrictEqual([0.31, 0.32]);
    });
    (0, globals_1.test)('it can get the prices within a small time range', () => {
        const prices = (0, Helpers_1.createPriceRange)([0.30, 0.31, 0.32, 0.33, 0.34, 0.35], (0, dayjs_1.default)().hour(10).minute(0).second(0));
        const collection = new PriceCollection_1.default(prices);
        const pricesWithinRange = collection.getWithinRange((0, dayjs_1.default)().hour(10).startOf('hour'), (0, dayjs_1.default)().hour(11).startOf('hour'));
        (0, globals_1.expect)(pricesWithinRange).not.toBeNull();
        (0, globals_1.expect)(pricesWithinRange.getPrices().map(p => p.total())).toStrictEqual([0.3]);
    });
});
