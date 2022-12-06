"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const BaseHandler_1 = require("./BaseHandler");
class ButtonHandler extends BaseHandler_1.default {
    constructor(client) {
        super(client);
        Object.defineProperty(this, "buttons", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.buttons = [];
    }
    get(prefix) {
        return this.buttons.find(b => b.prefix === prefix);
    }
    registerButtonsIn(options) {
        const obj = require('require-all')(options);
        const buttons = [];
        for (const group of Object.values(obj)) {
            for (const button of Object.values(group)) {
                if (buttons.map(b => b.name).includes(button.name))
                    throw new Error(`Button with name '${button.prefix}' is already registered`);
                buttons.push(button);
            }
        }
        return this.init(buttons);
    }
    recognize(interaction) {
        return this.components.find(b => interaction.customId.startsWith(b.prefix));
    }
    init(buttons) {
        this.owner = this.client.application?.owner;
        this.components = buttons.map(button => new button(this.client));
        this.client.on('interactionCreate', (interaction) => {
            if (interaction.isButton())
                return this.onInteraction(interaction);
        });
        return this.components;
    }
    parseArgs(interaction, button) {
        if (!button._options || button._options.length < 1)
            return {};
        let values = interaction.customId.split('-');
        values.shift();
        if (values.length > button._options.length) {
            throw new Error("Too many arguments provided");
        }
        const res = {};
        for (let i = 0; i < values.length; i++) {
            const { name, type } = button._options[i];
            let arg = {};
            switch (type) {
                case discord_js_1.ApplicationCommandOptionType.Number:
                    arg[name] = Number(values[i]);
                    break;
                case discord_js_1.ApplicationCommandOptionType.Boolean:
                    arg[name] = values[i] === 'true';
                    break;
                default:
                    arg[name] = values[i];
                    break;
            }
            Object.assign(res, arg);
        }
        return res;
    }
    static generateCustomId(button, args) {
        let customIdObj = {};
        if (button._options && button._options.length > 0) {
            for (const option of button._options) {
                customIdObj[option.name] = args[option.name] ?? null;
            }
        }
        return [button.prefix, ...Object.values(customIdObj)].join('-');
    }
}
exports.default = ButtonHandler;
