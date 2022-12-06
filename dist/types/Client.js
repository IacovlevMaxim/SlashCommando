"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const CommandHandler_1 = require("./CommandHandler");
const ButtonHandler_1 = require("./ButtonHandler");
const ContextMenuHandler_1 = require("./ContextMenuHandler");
class CommandClient extends discord_js_1.Client {
    constructor(options) {
        super(options);
        Object.defineProperty(this, "commandHandler", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "contextMenusHandler", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "buttonHandler", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "prefix", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "commandoOptions", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.validateInfo(options.commandoOptions);
        this.prefix = options.commandoOptions.prefix;
        this.commandoOptions = options.commandoOptions || null;
    }
    async registerCommandsIn(options) {
        this.commandHandler = new CommandHandler_1.default(this);
        return this.commandHandler.registerCommandsIn(options);
    }
    async registerContextMenusIn(options) {
        this.contextMenusHandler = new ContextMenuHandler_1.default(this);
        return this.contextMenusHandler.registerContextMenusIn(options);
    }
    async registerButtonsIn(options) {
        this.buttonHandler = new ButtonHandler_1.default(this);
        return this.buttonHandler.registerButtonsIn(options);
    }
    validateInfo(options) {
        if (!options?.prefix)
            throw new Error("Prefix must be defined");
        if (options.prefix !== options.prefix.toLowerCase())
            throw new RangeError("Prefix must be lower-case");
    }
}
exports.default = CommandClient;
