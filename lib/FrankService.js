"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FrankService = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const dayjs_1 = __importDefault(require("dayjs"));
const Util_1 = require("./Util");
class FrankService {
    async getPrices(start, end) {
        for (let i = 0; i < FrankService.Retries; i++) {
            try {
                return await this.getPricesImpl(start, end);
            }
            catch {
                await (0, Util_1.Sleep)(FrankService.RetryTimeoutMs);
            }
        }
        throw "Could not fetch price information";
    }
    async getPricesImpl(start, end) {
        const startDate = start.format(FrankService.DateFormat);
        const endDate = end.format(FrankService.DateFormat);
        console.log(`Calling frank-energie API to get prices between ${startDate} and ${endDate}`);
        const timerStart = (0, dayjs_1.default)();
        const query = {
            operationName: "MarketPrices",
            query: `
                query MarketPrices($startDate: Date!, $endDate: Date!) {
                    marketPricesElectricity(startDate: $startDate, endDate: $endDate) {
                       from till marketPrice marketPriceTax sourcingMarkupPrice energyTaxPrice
                    }
                    marketPricesGas(startDate: $startDate, endDate: $endDate) {
                       from till marketPrice marketPriceTax sourcingMarkupPrice energyTaxPrice
                    }
                }
            `,
            variables: {
                // The input contains hours,
                startDate: startDate,
                endDate: endDate
            }
        };
        const response = await (0, node_fetch_1.default)(FrankService.Url, {
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify(query)
        });
        const body = await response.json();
        const duration = (0, dayjs_1.default)().diff(timerStart, 'ms');
        console.log(`API call took ${duration}ms`);
        if (body.errors) {
            // this._app.error(body.errors);
            throw new Error("Failed to get prices; " + body.errors[0].message);
        }
        console.log(`Got ${body.data.marketPricesElectricity.length} electricity prices and ${body.data.marketPricesGas.length} gas prices`);
        return body.data;
    }
}
FrankService.Url = "https://frank-graphql-prod.graphcdn.app/";
FrankService.DateFormat = "YYYY-MM-DD";
FrankService.Retries = 3;
FrankService.RetryTimeoutMs = 500;
exports.FrankService = FrankService;
