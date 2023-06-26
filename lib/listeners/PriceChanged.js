"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Listener_1 = __importDefault(require("../Listener"));
const PriceStore_1 = __importDefault(require("../PriceStore"));
class PriceChanged extends Listener_1.default {
    constructor() {
        super(...arguments);
        this._energyPriceChangedTrigger = this.getTriggerCard("energy_price_changed" /* TriggerCards.EnergyPriceChanged */);
        this._gasPriceChangedTrigger = this.getTriggerCard("gas_price_changed" /* TriggerCards.GasPriceChanged */);
        this._lastPrices = {
            ["energy_price_changed" /* TriggerCards.EnergyPriceChanged */]: -1000,
            ["gas_price_changed" /* TriggerCards.GasPriceChanged */]: -1000
        };
    }
    async initialize() {
        // Lower
        this.configureConditionCard("energy_price_is_lower_than" /* ConditionCards.EnergyPriceIsLowerThan */, (args, _) => this.priceCondition(0 /* PriceType.Energy */, "lower" /* Comparator.Lower */, args));
        this.configureConditionCard("gas_price_is_lower_than" /* ConditionCards.GasPriceIsLowerThan */, (args, _) => this.priceCondition(1 /* PriceType.Gas */, "lower" /* Comparator.Lower */, args));
        // Higher
        this.configureConditionCard("energy_price_is_higher_than" /* ConditionCards.EnergyPriceIsHigherThan */, (args, _) => this.priceCondition(0 /* PriceType.Energy */, "higher" /* Comparator.Higher */, args));
        this.configureConditionCard("gas_price_is_higher_than" /* ConditionCards.GasPriceIsHigherThan */, (args, _) => this.priceCondition(1 /* PriceType.Gas */, "higher" /* Comparator.Higher */, args));
        PriceStore_1.default.on("price_updated" /* PriceEvents.PriceUpdated */, async (event) => {
            await this.handle(this._energyPriceChangedTrigger, event.energy);
            await this.handle(this._gasPriceChangedTrigger, event.gas);
        });
    }
    async priceCondition(type, comparator, args) {
        var _a, _b;
        const current = (_b = (_a = PriceStore_1.default.getCurrentPricesFor(type)) === null || _a === void 0 ? void 0 : _a.current()) === null || _b === void 0 ? void 0 : _b.total();
        if (comparator == "lower" /* Comparator.Lower */) {
            return current ? current < args.price : false;
        }
        else if (comparator == "higher" /* Comparator.Higher */) {
            return current ? current > args.price : false;
        }
        throw new Error("Not implemented");
    }
    async handle(trigger, prices) {
        var _a;
        this.log(`Checking trigger ${trigger.id}`);
        const currentPrice = (_a = prices.current()) === null || _a === void 0 ? void 0 : _a.total();
        if (currentPrice && this._lastPrices[trigger.id] !== currentPrice) {
            this._lastPrices[trigger.id] = currentPrice;
            await trigger.trigger({ price: prices.current().total() })
                .catch(this.error.bind(this));
        }
    }
}
exports.default = PriceChanged;
