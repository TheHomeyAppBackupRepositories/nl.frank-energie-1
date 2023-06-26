"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyApp = void 0;
const homey_1 = __importDefault(require("homey"));
const PriceStore_1 = __importDefault(require("./lib/PriceStore"));
const isBetween_1 = __importDefault(require("dayjs/plugin/isBetween"));
const utc_1 = __importDefault(require("dayjs/plugin/utc"));
const timezone_1 = __importDefault(require("dayjs/plugin/timezone"));
const dayjs_1 = __importDefault(require("dayjs"));
const PriceChanged_1 = __importDefault(require("./lib/listeners/PriceChanged"));
const PricePercentageThanNextXHours_1 = __importDefault(require("./lib/listeners/PricePercentageThanNextXHours"));
const PricePercentageThanDayAverage_1 = __importDefault(require("./lib/listeners/PricePercentageThanDayAverage"));
const PriceAbsolute_1 = __importDefault(require("./lib/listeners/PriceAbsolute"));
const PriceAbsoluteThanNextXHours_1 = __importDefault(require("./lib/listeners/PriceAbsoluteThanNextXHours"));
const PriceAbsoluteBetweenHours_1 = __importDefault(require("./lib/listeners/PriceAbsoluteBetweenHours"));
class MyApp extends homey_1.default.App {
    constructor() {
        super(...arguments);
        this._listeners = [];
    }
    /**
     * onInit is called when the app is initialized.
     */
    async onInit() {
        dayjs_1.default.extend(isBetween_1.default);
        dayjs_1.default.extend(utc_1.default);
        dayjs_1.default.extend(timezone_1.default);
        PriceStore_1.default.initialize(this);
        this._listeners = [
            new PriceChanged_1.default(this),
            new PriceAbsolute_1.default(this),
            new PriceAbsoluteBetweenHours_1.default(this),
            new PricePercentageThanNextXHours_1.default(this),
            new PriceAbsoluteThanNextXHours_1.default(this),
            new PricePercentageThanDayAverage_1.default(this),
        ];
        this.log('Initializing listeners');
        for (const listener of this._listeners) {
            await listener.initialize();
        }
        this.log('nl.frank-energie has been initialized');
        await PriceStore_1.default.requestUpdate();
    }
}
exports.MyApp = MyApp;
module.exports = MyApp;
