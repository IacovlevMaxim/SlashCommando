const { Client } = require("discord.js");
const CommandHandler = require('./CommandHandler');
const ButtonHandler = require('./ButtonHandler');

class CommandClient extends Client {
    constructor(options) {
        super(options);
        this.validateInfo(options.commandoOptions);
        this.prefix = options.commandoOptions.prefix;
        this.commandoOptions = options.commandoOptions || null;
    }

    async registerCommandsIn(options) {
        this.commandHandler = new CommandHandler(this);
        return this.commandHandler.registerCommandsIn(options);
    }

    async registerButtonsIn(options) {
        this.buttonHandler = new ButtonHandler(this);
        return this.buttonHandler.registerButtonsIn(options);
    }

    validateInfo(options) {
        if(!options?.prefix) throw new Error("Prefix must be defined");
        if(options.prefix !== options.prefix.toLowerCase()) throw new RangeError("Prefix must be lower-case");
    }
}

module.exports = CommandClient;