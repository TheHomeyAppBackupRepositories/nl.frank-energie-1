"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Listener_1 = __importDefault(require("../Listener"));
const PriceStore_1 = __importDefault(require("../PriceStore"));
const dayjs_1 = __importDefault(require("dayjs"));
const AverageCalculator_1 = require("../AverageCalculator");
class PricePercentageThanDayAverage extends Listener_1.default {
    constructor() {
        super(...arguments);
        // Lower
        this._energyPriceLowerPercentageThanDayAverageTrigger = this.getTriggerCard("energy_price_lower_percentage_day_average" /* TriggerCards.EnergyPriceLowerPercentageThanDayAverage */, this.triggerCondition.bind(this));
        // Higher
        this._energyPriceHigherPercentageThanDayAverageTrigger = this.getTriggerCard("energy_price_higher_percentage_day_average" /* TriggerCards.EnergyPriceHigherPercentageThanDayAverage */, this.triggerCondition.bind(this));
    }
    async initialize() {
        // Lower
        this.configureConditionCard("energy_price_lower_percentage_than_day_average" /* ConditionCards.EnergyPriceLowerPercentageThanDayAverage */, async (args, _) => this.pricePercentageCondition(0 /* PriceType.Energy */, "lower" /* Comparator.Lower */, args));
        // Higher
        this.configureConditionCard("energy_price_higher_percentage_than_day_average" /* ConditionCards.EnergyPriceHigherPercentageThanDayAverage */, async (args, _) => this.pricePercentageCondition(0 /* PriceType.Energy */, "higher" /* Comparator.Higher */, args));
        PriceStore_1.default.on("price_updated" /* PriceEvents.PriceUpdated */, async (event) => {
            // Lower
            await this.handle(this._energyPriceLowerPercentageThanDayAverageTrigger, "lower" /* Comparator.Lower */, event.energy);
            // Higher
            await this.handle(this._energyPriceHigherPercentageThanDayAverageTrigger, "higher" /* Comparator.Higher */, event.energy);
        });
    }
    pricePercentageCondition(type, comparator, args) {
        const prices = PriceStore_1.default.getCurrentPricesFor(type);
        if (!prices) {
            return false;
        }
        return this.matchesCondition(prices, comparator, args);
    }
    async triggerCondition(args, state) {
        return args.percentage == state.percentage;
    }
    async handle(trigger, comparator, prices) {
        const args = await trigger.getArgumentValues();
        for (const arg of args) {
            this.log(`Checking trigger ${trigger.id} (comparator: ${comparator}) with args ${JSON.stringify(arg)}`);
            const shouldTrigger = this.matchesCondition(prices, comparator, {
                percentage: arg.percentage * 100 // Based on 0..1
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
        const today = prices.forDate((0, dayjs_1.default)());
        if (!today || !current) {
            // No pricing data.
            return false;
        }
        return (0, AverageCalculator_1.deviatesFromAverage)(current, today, comparator, check.percentage);
    }
}
exports.default = PricePercentageThanDayAverage;
