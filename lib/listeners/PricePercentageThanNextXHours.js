"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Listener_1 = __importDefault(require("../Listener"));
const PriceStore_1 = __importDefault(require("../PriceStore"));
const AverageCalculator_1 = require("../AverageCalculator");
class PricePercentageThanNextXHours extends Listener_1.default {
    constructor() {
        super(...arguments);
        // Lower
        this._energyPriceLowerPercentageThanNextXHoursTrigger = this.getTriggerCard("energy_price_lower_percentage_than_next_x_hours" /* TriggerCards.EnergyPriceLowerPercentageThanNextXHours */, this.triggerCondition.bind(this));
        // Higher
        this._energyPriceHigherPercentageThanNextXHoursTrigger = this.getTriggerCard("energy_price_higher_percentage_than_next_x_hours" /* TriggerCards.EnergyPriceHigherPercentageThanNextXHours */, this.triggerCondition.bind(this));
    }
    async initialize() {
        // Lower
        this.configureConditionCard("energy_price_lower_percentage_than_next_x_hours" /* ConditionCards.EnergyPriceLowerPercentageThanNextXHours */, async (args, _) => this.pricePercentageCondition(0 /* PriceType.Energy */, "lower" /* Comparator.Lower */, args));
        // Higher
        this.configureConditionCard("energy_price_higher_percentage_than_next_x_hours" /* ConditionCards.EnergyPriceHigherPercentageThanNextXHours */, async (args, _) => this.pricePercentageCondition(0 /* PriceType.Energy */, "higher" /* Comparator.Higher */, args));
    }
    async onPriceEvent(event) {
        // Lower
        await this.handle(this._energyPriceLowerPercentageThanNextXHoursTrigger, "lower" /* Comparator.Lower */, event.energy);
        // Higher
        await this.handle(this._energyPriceHigherPercentageThanNextXHoursTrigger, "higher" /* Comparator.Higher */, event.energy);
    }
    pricePercentageCondition(type, comparator, args) {
        const prices = PriceStore_1.default.getCurrentPricesFor(type);
        if (!prices) {
            return false;
        }
        return this.matchesCondition(prices, comparator, args);
    }
    async triggerCondition(args, state) {
        return args.percentage == state.percentage
            && args.hours == state.hours;
    }
    async handle(trigger, comparator, prices) {
        const args = await trigger.getArgumentValues();
        for (const arg of args) {
            this.log(`Checking trigger ${trigger.id} (comparator: ${comparator}) with args ${JSON.stringify(arg)}`);
            const shouldTrigger = this.matchesCondition(prices, comparator, {
                percentage: arg.percentage * 100,
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
        return (0, AverageCalculator_1.deviatesFromAverage)(current, nextHoursPrices, comparator, check.percentage);
    }
}
exports.default = PricePercentageThanNextXHours;
