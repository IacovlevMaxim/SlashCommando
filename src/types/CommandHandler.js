const BaseHandler = require('./BaseHandler');
const { ApplicationCommand, ApplicationCommandOptionType } = require('discord.js');

class CommandHandler extends BaseHandler {
    constructor(client) {
		super(client);
		this.onInteraction = this.onInteraction.bind(this);
    }

	recognize(interaction) {
		return this.commands.find(c => c.name == interaction.commandName);
	}

    async registerCommandsIn(options) {
        const obj = require('require-all')(options);
		let commands = [];
		for(const group of Object.values(obj)) {
			for(let command of Object.values(group)) {
				if(commands.map(c => c.name).includes(command.name)) throw new Error(`Command with name '${command.name}' is already registered`)
				commands.push(command);
			}
		}
		return this.registerCommands(this.init(commands));
    }

	async registerCommands(commands) {
		if(!this.client.application.owner) await this.client.application.fetch();
		await this.client.application.commands.fetch();

		const data = commands.map(command => CommandHandler.transformCommand(command));
		return data;
	}

	init(commands) {
		this.owner = this.client.application.owner;
		const allCommands = commands.map(command => new command(this.client));
		this.commands = allCommands.map(cmd => cmd.name == 'help' ? new cmd.constructor(cmd.client, allCommands) : cmd);
		this.client.on('interactionCreate', interaction => {
			if(interaction.isCommand() && !interaction.targetId) return this.onInteraction(interaction);
		});
		return this.commands;
	}

	static parseArgs(interaction, command) {
		if(!command) return [];

		const args = Object.assign({}, ...interaction.options?._hoistedOptions.map(o => {
			let res = {};
			const option = command.options.find(opt => opt.name === o.name);
			switch(option?.type) {
				case ApplicationCommandOptionType.Number:
					res[o.name] = Number(o.value);
				break;

				case ApplicationCommandOptionType.Integer:
					res[o.name] = parseInt(o.value);
				break;

				case ApplicationCommandOptionType.Boolean:
					res[o.name] = Boolean(o.value);
				break;

				default: 
					res[o.name] = o.value
			}
			return res;
		}));
		return args;
	}

	static transformCommand(command) {
		return {
		  name: command.name,
		  description: command.description,
		  options: command.options?.map(o => ApplicationCommand.transformOption(o)),
		  default_permission: command.defaultPermission,
		};
	  }
}

module.exports = CommandHandler;