"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dayjs_1 = __importDefault(require("dayjs"));
class PriceCollection {
    constructor(prices) {
        this.prices = prices;
        // Technically, this should be sorted by the API, but we can't trust that.
        this.prices = prices
            .sort((a, b) => a.from().valueOf() - b.from().valueOf());
    }
    current() {
        const now = (0, dayjs_1.default)();
        for (const price of this.prices) {
            if (now.isBetween(price.from(), price.until())) {
                return price;
            }
        }
        return null;
    }
    forDate(date) {
        if (this.prices.length === 0) {
            return null;
        }
        return new PriceCollection(this.prices.filter(p => p.from().isSame(date, 'day')));
    }
    highest() {
        if (this.prices.length === 0) {
            return null;
        }
        return this.prices
            .reduce((prev, current) => prev.total() > current.total() ? prev : current);
    }
    lowest() {
        if (this.prices.length === 0) {
            return null;
        }
        return this.prices
            .reduce((prev, current) => prev.total() < current.total() ? prev : current);
    }
    average() {
        if (this.prices.length === 0) {
            return null;
        }
        const sum = this.prices
            .map(p => p.total())
            .reduce((prev, current) => prev + current);
        return sum / this.prices.length;
    }
    getForNextHours(hours) {
        const current = this.current();
        if (current === null) {
            return null;
        }
        const nextPrices = this.prices
            .filter(p => p.from().isAfter(current.until()))
            .slice(0, hours);
        return new PriceCollection(nextPrices);
    }
    getWithinRange(start, end) {
        const prices = this.prices
            .filter(p => p.from().isBetween(start, end, 'minutes', '[)')
            || p.until().isBetween(start, end, 'minutes', '(]'));
        return new PriceCollection(prices);
    }
    getPrices() {
        return this.prices;
    }
}
exports.default = PriceCollection;
