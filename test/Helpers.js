"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPriceRange = exports.createSinglePrice = void 0;
const Price_1 = __importDefault(require("../lib/Price"));
const dayjs_1 = __importDefault(require("dayjs"));
const createPrice = (total, from, to) => new Price_1.default(total, 0, 0, 0, from, to);
const createSinglePrice = (total, time = (0, dayjs_1.default)()) => {
    return createPrice(total, time.startOf('hour').toISOString(), time.endOf('hour').toISOString());
};
exports.createSinglePrice = createSinglePrice;
const createPriceRange = (prices, from) => {
    const result = [];
    for (let i = 0; i < prices.length; i++) {
        const base = from.add(i, 'hour').startOf('hour');
        result.push(createPrice(prices[i], base.toISOString(), base.endOf('hour').toISOString()));
    }
    return result;
};
exports.createPriceRange = createPriceRange;
