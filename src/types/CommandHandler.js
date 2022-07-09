const BaseHandler = require('./BaseHandler');
const { ApplicationCommand } = require('discord.js');
const InteractionCall = require('./InteractionCall');
const p = require('phin');

class CommandHandler extends BaseHandler {
    constructor(client) {
		super(client);
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

		let registeredCommands;
		const options = this.client.commandoOptions;
		const data = commands.map(command => {
			return options?.testing 
				? {...CommandHandler.transformCommand(command), description: `(testing) ${command.description}`}
				: CommandHandler.transformCommand(command)
		});
		registeredCommands = await this.client.application.commands.set(data, options?.testing ? options?.testingGuild : null);

		for(const ownerCommand of commands.filter(command => command.ownerOnly)) {
			const registeredCommand = registeredCommands.find(command => command.name === ownerCommand.name);
			await Promise.all([
				registeredCommand.edit({
					defaultPermission: false
				}),
				this.client.guilds.cache.get(options?.testingGuild)?.commands.permissions.add({
					command: registeredCommand.id,
					permissions: [
						{
							id: this.client.application.owner.id,
							type: 'USER',
							permission: true
						}
					],
					
				})
			]);
		}
		return commands;
	}

	init(commands) {
		this.owner = this.client.application.owner;
		const allCommands = commands.map(command => new command(this.client));
		this.commands = allCommands.map(cmd => cmd.name == 'help' ? new cmd.constructor(cmd.client, allCommands) : cmd);
		this.client.on('interactionCreate', interaction => {
			if(interaction.isCommand()) return this.onInteraction(interaction);
		});
		return this.commands;
	}

	static parseArgs(interaction) {
		const args = Object.assign({}, ...interaction.options?._hoistedOptions.map(o => {
			let res = {};
			res[o.name] = o.value;
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