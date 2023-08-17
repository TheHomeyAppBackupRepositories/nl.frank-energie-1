"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sleep = void 0;
const Sleep = (timeout) => {
    return new Promise(r => setTimeout(r, timeout));
};
exports.Sleep = Sleep;
