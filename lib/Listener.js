"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Listener {
    constructor(_app) {
        this._app = _app;
    }
    log(...args) {
        this._app.log(...args);
    }
    error(...args) {
        this._app.error(...args);
    }
    getTriggerCard(name, runListener) {
        const card = this._app.homey.flow.getTriggerCard(name);
        if (runListener) {
            card.registerRunListener(runListener);
        }
        return card;
    }
    configureConditionCard(name, runListener) {
        const card = this._app.homey.flow.getConditionCard(name);
        card.registerRunListener(runListener);
        return card;
    }
}
exports.default = Listener;
