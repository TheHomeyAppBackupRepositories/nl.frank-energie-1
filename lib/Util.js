"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sleep = void 0;
const Sleep = (app, timeout) => {
    return new Promise(r => app.homey.setTimeout(r, timeout));
};
exports.Sleep = Sleep;
