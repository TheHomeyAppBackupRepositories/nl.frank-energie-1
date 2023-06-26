"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dayjs_1 = __importDefault(require("dayjs"));
class Price {
    constructor(_marketPrice, _marketTax, _markup, _energyTax, from, till) {
        this._marketPrice = _marketPrice;
        this._marketTax = _marketTax;
        this._markup = _markup;
        this._energyTax = _energyTax;
        this._from = (0, dayjs_1.default)(from);
        this._until = (0, dayjs_1.default)(till);
    }
    equals(other) {
        if (!other) {
            return false;
        }
        // We only consider the dates for them to be equal,
        // as the prices are unchanging for the same time range.
        return this.total() == other.total()
            && this._from.isSame(other._from)
            && this._until.isSame(other._until);
    }
    total() {
        const total = this._marketPrice
            + this._marketTax
            + this._markup
            + this._energyTax;
        // Round to four decimals.
        return Math.round(total * 10000) / 10000;
    }
    from() {
        return this._from;
    }
    until() {
        return this._until;
    }
}
exports.default = Price;
