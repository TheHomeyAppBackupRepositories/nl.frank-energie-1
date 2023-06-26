"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const Helpers_1 = require("./Helpers");
const dayjs_1 = __importDefault(require("dayjs"));
const Price_1 = __importDefault(require("../lib/Price"));
(0, globals_1.describe)('price', () => {
    (0, globals_1.test)('equality check', () => {
        const now = (0, dayjs_1.default)();
        const first = (0, Helpers_1.createSinglePrice)(0.30, now);
        const second = (0, Helpers_1.createSinglePrice)(0.30, now);
        const third = (0, Helpers_1.createSinglePrice)(0.31, now);
        const fourth = (0, Helpers_1.createSinglePrice)(0.30, now.subtract(1, 'hour'));
        (0, globals_1.expect)(first.equals(null)).toBeFalsy();
        (0, globals_1.expect)(first.equals(second)).toBeTruthy();
        (0, globals_1.expect)(first.equals(third)).toBeFalsy();
        (0, globals_1.expect)(first.equals(fourth)).toBeFalsy();
    });
    (0, globals_1.test)('total calculation', () => {
        const price = new Price_1.default(0.20, 0.05, 0.05, 0.05, (0, dayjs_1.default)().toISOString(), (0, dayjs_1.default)().toISOString());
        (0, globals_1.expect)(price.total()).toBe(0.35);
    });
});
