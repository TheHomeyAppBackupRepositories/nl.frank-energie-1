"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Listener_1 = __importDefault(require("../Listener"));
const PriceStore_1 = __importDefault(require("../PriceStore"));
const dayjs_1 = __importDefault(require("dayjs"));
class PriceAbsoluteBetweenHours extends Listener_1.default {
    constructor() {
        super(...arguments);
        // Lowest
        this._energyPriceLowestBetweenHoursTrigger = this.getTriggerCard("energy_price_lowest_between_hours" /* TriggerCards.EnergyPriceLowestBetweenHours */, this.triggerCondition.bind(this));
        // Highest
        this._energyPriceHighestBetweenHoursTrigger = this.getTriggerCard("energy_price_highest_between_hours" /* TriggerCards.EnergyPriceHighestBetweenHours */, this.triggerCondition.bind(this));
    }
    async initialize() {
        // Lowest
        this.configureConditionCard("energy_price_lowest_between_hours" /* ConditionCards.EnergyPriceLowestBetweenHours */, async (args, _) => this.priceCondition(0 /* PriceType.Energy */, "lower" /* Comparator.Lower */, args));
        // Highest
        this.configureConditionCard("energy_price_highest_between_hours" /* ConditionCards.EnergyPriceHighestBetweenHours */, async (args, _) => this.priceCondition(0 /* PriceType.Energy */, "higher" /* Comparator.Higher */, args));
    }
    async onPriceEvent(event) {
        // Lowest
        await this.handle(this._energyPriceLowestBetweenHoursTrigger, "lower" /* Comparator.Lower */, event.energy);
        // Highest
        await this.handle(this._energyPriceHighestBetweenHoursTrigger, "higher" /* Comparator.Higher */, event.energy);
    }
    priceCondition(type, comparator, args) {
        this.log('Checking condition for time between hours', args);
        const prices = PriceStore_1.default.getCurrentPricesFor(type);
        if (!prices) {
            return false;
        }
        return this.matchesCondition(prices, comparator, args);
    }
    async triggerCondition(args, state) {
        return args.first == state.first && args.last == state.last;
    }
    async handle(trigger, comparator, prices) {
        var _a;
        const args = await trigger.getArgumentValues();
        for (const arg of args) {
            this.log('Checking trigger for time between hours', arg);
            const shouldTrigger = this.matchesCondition(prices, comparator, arg);
            if (shouldTrigger) {
                this.log(`Triggering ${trigger.id}`);
                await trigger.trigger({ price: (_a = prices.current()) === null || _a === void 0 ? void 0 : _a.total() }, arg)
                    .catch(this.error.bind(this));
            }
        }
    }
    matchesCondition(prices, comparator, args) {
        var _a, _b;
        const first = this.convertTimeToDayjs(args.first);
        const last = this.convertTimeToDayjs(args.last);
        // First, check whether we are currently in the time range.
        const currentPrice = prices.current();
        if (!currentPrice) {
            // No price information.
            return false;
        }
        if (!currentPrice.from().isBetween(first, last, 'minute', '[]')) {
            this.log('Not in time range for this trigger.', currentPrice.from().toISOString(), first.toISOString(), last.toISOString());
            return false;
        }
        const range = prices.getWithinRange(first, last);
        if (comparator === "lower" /* Comparator.Lower */) {
            return !!((_a = range.lowest()) === null || _a === void 0 ? void 0 : _a.equals(currentPrice));
        }
        else if (comparator === "higher" /* Comparator.Higher */) {
            return !!((_b = range.highest()) === null || _b === void 0 ? void 0 : _b.equals(currentPrice));
        }
        throw new Error(`Unknown comparator ${comparator}`);
    }
    convertTimeToDayjs(time) {
        const [hours, minutes] = time.split(':');
        // The .tz(...) calls make sure we convert the user's timezone (which we guess to be
        // Europe/Amsterdam) to UTC. This is necessary because the price data is stored in UTC.
        return (0, dayjs_1.default)()
            .tz('Europe/Amsterdam', true)
            .hour(parseInt(hours))
            .minute(parseInt(minutes))
            .startOf('minute')
            .tz("UTC");
    }
}
exports.default = PriceAbsoluteBetweenHours;
