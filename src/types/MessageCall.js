const { Message } = require('discord.js');

class MessageCall extends Message {
    constructor(client, data) {
        super(client, data);

        this.commandType = 'message';
        this.commandName = this.content.toLowerCase().split(' ').shift().split(this.client.prefix)[1];
        this.user = this.author;
        this.replied = false;
        this.deferred = false;
    }

    async deferReply(options) {
        //pass
    }

    async followUp(reply) {
        return this.reply(reply);
    }

    async editReply(reply) {
        return this.lastReply ? this.lastReply.edit(reply) : this.reply(reply);
    }

    async reply(reply) {
        return this.smartReply(reply);
    }

    async smartReply(reply) {
        const lastReply = await super.reply(reply);
        this.lastReply = lastReply;
    }

    parseArgs(message, command) {
		let messageArgs = message.content.split(' ');
		messageArgs.shift();
		let args = {};
		for(let i = 0;i < command.options.length;i++) {
			const optionName = command.options[i].name;
			try {
				this.validateArg(command.options[i], messageArgs[i]);
			} catch(data) {
				throw data;
			}
			args[optionName] = this.parseArg(command.options[i], messageArgs[i]);
		}
		return args;
	}

	parseArg(commandOption, messageArg) {
		switch(commandOption.type) {
			case 'STRING':
				return messageArg;

			case 'CHANNEL':
				return messageArg?.match(/<#(\d+)>/)[1];
			
			case 'NUMBER':
				return Number(messageArg);
		}
	}

	validateArg(commandOption, arg) {
        if(commandOption.required && (!arg || arg.length < 1)) {
            throw `Option '${commandOption.name}' is required`
        } 
        if(!commandOption.required && !arg) return;
		switch(commandOption.type) {
			case 'STRING':
				return;
			
			case 'NUMBER':
				if(isNaN(arg)) throw `Option '${commandOption.name}' must be a number`
			break;

			case 'CHANNEL':
				if(!arg.match(/<#(\d+)>/) || isNaN(arg.match(/<#(\d+)>/)[1]) ) {
					throw `Option '${commandOption.name}' must be a channel`;
				}
			break;
		}
	}
}

module.exports = MessageCall;