"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const BaseHandler_1 = require("./BaseHandler");
class CommandHandler extends BaseHandler_1.default {
    constructor(client) {
        super(client);
        Object.defineProperty(this, "commands", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.commands = [];
        this.onInteraction = this.onInteraction.bind(this);
    }
    recognize(interaction) {
        return this.commands.find(c => c.name === interaction.commandName);
    }
    async registerCommandsIn(options) {
        const obj = require('require-all')(options);
        let commands = [];
        for (const group of Object.values(obj)) {
            for (const command of Object.values(group)) {
                const com = command;
                if (commands.map(c => c.name).includes(com.name))
                    throw new Error(`Command with name '${com.name}' is already registered`);
                commands.push(com);
            }
        }
        return this.registerCommands(this.init(commands));
    }
    async registerCommands(commands) {
        if (this.client.application) {
            await this.client.application.fetch();
            await this.client.application.commands.fetch();
        }
        const data = commands.map(command => CommandHandler.transformCommand(command));
        return data;
    }
    init(commands) {
        this.owner = this.client.application?.owner;
        const allCommands = commands.map(command => new command(this.client));
        this.commands = allCommands.map(cmd => cmd.name == 'help' ? new cmd.constructor(cmd.client, allCommands) : cmd);
        this.client.on('interactionCreate', (interaction) => {
            if (interaction.isChatInputCommand())
                return this.onInteraction(interaction);
        });
        return this.commands;
    }
    parseArgs(interaction, command) {
        if (!command || !command._options || command._options.length < 1)
            return [];
        const args = Object.assign({}, ...interaction.options?.data.map(o => {
            let res = {};
            const option = command._options.find(opt => opt.name === o.name);
            switch (option?.type) {
                case discord_js_1.ApplicationCommandOptionType.Number:
                    res[o.name] = Number(o.value);
                    break;
                case discord_js_1.ApplicationCommandOptionType.Integer:
                    res[o.name] = parseInt(`${o.value}`);
                    break;
                case discord_js_1.ApplicationCommandOptionType.Boolean:
                    res[o.name] = Boolean(o.value);
                    break;
                default:
                    res[o.name] = o.value;
            }
            return res;
        }));
        return args;
    }
    static transformCommand(command) {
        return { ...command, options: command._options };
    }
}
exports.default = CommandHandler;
