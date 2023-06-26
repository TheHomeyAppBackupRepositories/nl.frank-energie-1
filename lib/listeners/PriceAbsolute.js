"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Listener_1 = __importDefault(require("../Listener"));
const PriceStore_1 = __importDefault(require("../PriceStore"));
const dayjs_1 = __importDefault(require("dayjs"));
class PriceAbsolute extends Listener_1.default {
    constructor() {
        super(...arguments);
        // Lower
        this._energyPriceLowestOfDayTrigger = this.getTriggerCard("energy_price_lowest_of_day" /* TriggerCards.EnergyPriceLowestOfDay */);
        // Higher
        this._energyPriceHighestOfDayTrigger = this.getTriggerCard("energy_price_highest_of_day" /* TriggerCards.EnergyPriceHighestOfDay */);
    }
    async initialize() {
        // Lower
        this.configureConditionCard("energy_price_is_lowest_of_day" /* ConditionCards.EnergyPriceIsLowestOfDay */, () => this.priceCondition(0 /* PriceType.Energy */, "lower" /* Comparator.Lower */));
        // Higher
        this.configureConditionCard("energy_price_is_highest_of_day" /* ConditionCards.EnergyPriceIsHighestOfDay */, () => this.priceCondition(0 /* PriceType.Energy */, "higher" /* Comparator.Higher */));
        PriceStore_1.default.on("price_updated" /* PriceEvents.PriceUpdated */, async (event) => {
            // Lower
            await this.handle(this._energyPriceLowestOfDayTrigger, "lower" /* Comparator.Lower */, event.energy);
            // Higher
            await this.handle(this._energyPriceHighestOfDayTrigger, "higher" /* Comparator.Higher */, event.energy);
        });
    }
    async priceCondition(type, comparator) {
        var _a;
        const prices = (_a = PriceStore_1.default.getCurrentPricesFor(type)) === null || _a === void 0 ? void 0 : _a.forDate((0, dayjs_1.default)());
        if (!prices) {
            // No prices available.
            return false;
        }
        if (comparator == "lower" /* Comparator.Lower */) {
            return prices.lowest().equals(prices.current());
        }
        else if (comparator == "higher" /* Comparator.Higher */) {
            return prices.highest().equals(prices.current());
        }
        throw new Error("Not implemented");
    }
    async handle(trigger, comparator, prices) {
        var _a, _b;
        this.log(`Checking trigger ${trigger.id}`);
        const shouldTrigger = comparator === "lower" /* Comparator.Lower */
            ? (_a = prices.lowest()) === null || _a === void 0 ? void 0 : _a.equals(prices.current())
            : (_b = prices.highest()) === null || _b === void 0 ? void 0 : _b.equals(prices.current());
        if (shouldTrigger) {
            this.log(`triggering ${trigger.id}`);
            await trigger.trigger({ price: prices.current().total() })
                .catch(this.error.bind(this));
        }
    }
}
exports.default = PriceAbsolute;
