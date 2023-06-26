"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Listener_1 = __importDefault(require("../Listener"));
const PriceStore_1 = __importDefault(require("../PriceStore"));
class PriceAbsoluteThanNextXHours extends Listener_1.default {
    constructor() {
        super(...arguments);
        // Lower
        this._energyPriceLowerThanNextXHoursTrigger = this.getTriggerCard("energy_price_lower_than_next_x_hours" /* TriggerCards.EnergyPriceLowerThanNextXHours */, this.triggerCondition.bind(this));
        // Higher
        this._energyPriceHigherThanNextXHoursTrigger = this.getTriggerCard("energy_price_higher_than_next_x_hours" /* TriggerCards.EnergyPriceHigherThanNextXHours */, this.triggerCondition.bind(this));
    }
    async initialize() {
        // Lower
        this.configureConditionCard("energy_price_lower_than_next_x_hours" /* ConditionCards.EnergyPriceLowerThanNextXHours */, async (args, _) => this.priceCondition(0 /* PriceType.Energy */, "lower" /* Comparator.Lower */, args));
        // Higher
        this.configureConditionCard("energy_price_higher_than_next_x_hours" /* ConditionCards.EnergyPriceHigherThanNextXHours */, async (args, _) => this.priceCondition(0 /* PriceType.Energy */, "higher" /* Comparator.Higher */, args));
        PriceStore_1.default.on("price_updated" /* PriceEvents.PriceUpdated */, async (event) => {
            // Lower
            await this.handle(this._energyPriceLowerThanNextXHoursTrigger, "lower" /* Comparator.Lower */, event.energy);
            // Higher
            await this.handle(this._energyPriceHigherThanNextXHoursTrigger, "higher" /* Comparator.Higher */, event.energy);
        });
    }
    priceCondition(type, comparator, args) {
        const prices = PriceStore_1.default.getCurrentPricesFor(type);
        if (!prices) {
            return false;
        }
        return this.matchesCondition(prices, comparator, args);
    }
    async triggerCondition(args, state) {
        return args.hours == state.hours;
    }
    async handle(trigger, comparator, prices) {
        const args = await trigger.getArgumentValues();
        for (const arg of args) {
            this.log(`Checking trigger ${trigger.id} (comparator: ${comparator}) with args ${JSON.stringify(arg)}`);
            const shouldTrigger = this.matchesCondition(prices, comparator, {
                hours: arg.hours
            });
            if (shouldTrigger) {
                this.log(`Triggering ${trigger.id}`);
                await trigger.trigger({ price: prices.current().total() }, arg)
                    .catch(this.error.bind(this));
            }
        }
    }
    matchesCondition(prices, comparator, check) {
        const current = prices.current();
        if (!current) {
            // No pricing data.
            return false;
        }
        const nextHoursPrices = prices.getForNextHours(check.hours);
        if (!nextHoursPrices) {
            // Not enough pricing data.
            return false;
        }
        if (comparator == "lower" /* Comparator.Lower */) {
            return current.total() < nextHoursPrices.lowest().total();
        }
        else if (comparator == "higher" /* Comparator.Higher */) {
            return current.total() > nextHoursPrices.highest().total();
        }
        throw new Error(`Unknown comparator ${comparator}`);
    }
}
exports.default = PriceAbsoluteThanNextXHours;
