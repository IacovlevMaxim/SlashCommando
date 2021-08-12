const { Client } = require("discord.js");
const CommandHandler = require('./CommandHandler');

class CommandClient extends Client {
    constructor(options) {

        super(options);
        this.commandoOptions = options.commandoOptions || null;
    }

    async registerCommandsIn(options) {
        this.handler = new CommandHandler(this);
        return this.handler.registerCommandsIn(options);
    }
}

module.exports = CommandClient;