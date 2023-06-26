"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const FrankService_1 = require("./FrankService");
const Price_1 = __importDefault(require("./Price"));
const PriceCollection_1 = __importDefault(require("./PriceCollection"));
const events_1 = __importDefault(require("events"));
const dayjs_1 = __importDefault(require("dayjs"));
require("dayjs/plugin/isBetween");
class PriceStore extends events_1.default {
    constructor() {
        super(...arguments);
        this._updateRequested = false;
        this._lastEvent = null;
    }
    initialize(app) {
        if (this._app) {
            // Note: we don't want to throw here because that will fail in
            // the multi-tenancy scenario (cloud).
            return;
        }
        this._app = app;
        this._service = new FrankService_1.FrankService(app);
        this.notifyOnHourChange();
    }
    async requestUpdate() {
        if (this._updateRequested) {
            return;
        }
        this._app.log('Update requested');
        this._updateRequested = true;
        try {
            // Get a good range of prices.
            const prices = await this.getPrices();
            this._lastEvent = {
                energy: this.toDomain(prices.marketPricesElectricity),
                gas: this.toDomain(prices.marketPricesGas)
            };
            if (false) {
                // Test cycle.
                const nextRefresh = (0, dayjs_1.default)().add(10, 'seconds');
                this._app.log(`TEST Next refresh at ${nextRefresh.toISOString()}`);
                this.scheduleRefreshAt(nextRefresh);
            }
            else {
                // Normal refresh cycle.
                const nextRefresh = this.nextRefresh();
                this._app.log(`Next refresh at ${nextRefresh.toISOString()}`);
                this.scheduleRefreshAt(nextRefresh);
            }
            this.emit("price_updated" /* PriceEvents.PriceUpdated */, this._lastEvent);
        }
        catch (e) {
            this._app.error("Failed to refresh prices, retrying in 30 seconds", e);
            this.scheduleRefreshAt((0, dayjs_1.default)().add(30, 'seconds'));
        }
        finally {
            this._updateRequested = false;
        }
    }
    getCurrentPrices() {
        return this._lastEvent;
    }
    getCurrentPricesFor(type) {
        const prices = this.getCurrentPrices();
        if (!prices) {
            return null;
        }
        if (type == 0 /* PriceType.Energy */) {
            return prices.energy;
        }
        if (type == 1 /* PriceType.Gas */) {
            return prices.gas;
        }
        throw new Error(`Unknown price type ${type}`);
    }
    async getPrices() {
        let segments = [];
        try {
            // Yesterday
            segments.push(await this._service.getPrices((0, dayjs_1.default)().subtract(1, 'day'), (0, dayjs_1.default)().subtract(1, 'day')));
            // Today
            segments.push(await this._service.getPrices((0, dayjs_1.default)(), (0, dayjs_1.default)()));
            // Tomorrow
            segments.push(await this._service.getPrices((0, dayjs_1.default)().add(1, 'day'), (0, dayjs_1.default)().add(1, 'day')));
        }
        catch (e) {
            // Check if we have enough prices to work with, especially today's prices are important.
            if (segments.length <= 1) {
                throw e;
            }
            this._app.log("Warning: fetching tomorrows prices failed, working with only today's and yesterday's prices");
        }
        return {
            marketPricesElectricity: segments.map(s => s.marketPricesElectricity)
                .reduce((a, b) => a.concat(b)),
            marketPricesGas: segments.map(s => s.marketPricesGas)
                .reduce((a, b) => a.concat(b))
        };
    }
    nextRefresh() {
        let refresh = (0, dayjs_1.default)()
            .add(1, 'hour')
            .startOf('hour')
            .subtract(1, 'minute');
        return refresh;
        //
        // if (refresh.hour() >= 15) {
        //     refresh = dayjs().add(1, 'day');
        // }
        //
        // return refresh.hour(15).minute(1).second(0);
    }
    toDomain(entries) {
        const prices = entries.map(e => new Price_1.default(e.marketPrice, e.marketPriceTax, e.sourcingMarkupPrice, e.energyTaxPrice, e.from, e.till));
        return new PriceCollection_1.default(prices);
    }
    notifyOnHourChange() {
        // Schedule a refresh at the end of the hour. One second of
        // delay is added to ensure we don't hit any edge cases on date/time checks.
        const delay = (0, dayjs_1.default)()
            .endOf('hour').add(1, 'second')
            .diff((0, dayjs_1.default)(), 'ms');
        this._app.log(`Next refresh is scheduled in ${delay}ms (${(delay / 1000 / 60).toFixed(2)}m)`);
        setTimeout(() => {
            if (this._lastEvent) {
                this.emit("price_updated" /* PriceEvents.PriceUpdated */, this._lastEvent);
            }
            this.notifyOnHourChange();
        }, delay);
    }
    scheduleRefreshAt(date) {
        this._app.homey.setTimeout(() => {
            this.requestUpdate();
        }, date.diff((0, dayjs_1.default)(), 'ms'));
    }
}
exports.default = new PriceStore();
