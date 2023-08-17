"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const FrankService_1 = require("./FrankService");
const Price_1 = __importDefault(require("./Price"));
const PriceCollection_1 = __importDefault(require("./PriceCollection"));
const dayjs_1 = __importDefault(require("dayjs"));
require("dayjs/plugin/isBetween");
class PriceStore {
    constructor() {
        this._updateRequested = false;
        this._lastEvent = null;
        this._apps = new Set();
    }
    initialize() {
        if (this._service) {
            // Already initialized.
            return;
        }
        this._service = new FrankService_1.FrankService();
        this.notifyOnHourChange();
    }
    registerApp(app) {
        this._apps.add(app);
    }
    deregisterApp(app) {
        this._apps.delete(app);
    }
    async requestUpdate() {
        if (this._updateRequested) {
            return;
        }
        this.log('Update requested');
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
                const nextRefresh = (0, dayjs_1.default)().add(15, 'seconds');
                this.log(`TEST Next refresh at ${nextRefresh.toISOString()}`);
                this.scheduleRefreshAt(nextRefresh);
            }
            else {
                // Normal refresh cycle.
                const nextRefresh = this.nextRefresh();
                this.log(`Next refresh at ${nextRefresh.toISOString()}`);
                this.scheduleRefreshAt(nextRefresh);
            }
            await this.emit(this._lastEvent);
        }
        catch (e) {
            this.error("Failed to refresh prices, retrying in 30 seconds", e);
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
            this.log("Warning: fetching tomorrows prices failed, working with only today's and yesterday's prices");
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
        setTimeout(async () => {
            if (this._lastEvent) {
                await this.emit(this._lastEvent);
            }
            this.notifyOnHourChange();
        }, delay);
    }
    async emit(event) {
        for (const app of this._apps) {
            for (const listener of app.getListeners()) {
                await listener.onPriceEvent(event);
            }
        }
    }
    scheduleRefreshAt(date) {
        setTimeout(() => {
            this.requestUpdate();
        }, date.diff((0, dayjs_1.default)(), 'ms'));
    }
    log(...args) {
        if (this._apps.size > 0) {
            const [first] = this._apps;
            first.log(...args);
        }
        else {
            // Fallback
            console.log(...args);
        }
    }
    error(...args) {
        if (this._apps.size > 0) {
            const [first] = this._apps;
            first.error(...args);
        }
        else {
            // Fallback
            console.error(...args);
        }
    }
}
exports.default = new PriceStore();
