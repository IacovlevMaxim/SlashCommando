import { ApplicationCommandOptionType, CommandInteraction, Interaction, Team, User } from 'discord.js';
import BaseHandler from './BaseHandler';
import CommandClient from './Client';
import Command from './Command';

class CommandHandler extends BaseHandler<Command, CommandInteraction> {
	commands: Command[];
    constructor(client: CommandClient) {
		super(client);
		this.commands = [];
		this.onInteraction = this.onInteraction.bind(this);
    }

	recognize(interaction: CommandInteraction): Command | undefined {
		return this.commands.find(c => c.name === interaction.commandName);
	}

    async registerCommandsIn(options: string) {
        const obj = require('require-all')(options);
		let commands: Command[] = [];
		for(const group of Object.values(obj)) {
			for(const command of Object.values(group as object)) {
				const com = command as Command;
				if(commands.map(c => c.name).includes(com.name)) throw new Error(`Command with name '${com.name}' is already registered`)
				commands.push(com);
			}
		}
		return this.registerCommands(this.init(commands));
    }

	async registerCommands(commands: Command[]) {
		if(this.client.application) {
			await this.client.application.fetch();
			await this.client.application.commands.fetch();
		}

		const data = commands.map(command => CommandHandler.transformCommand(command));
		return data;
	}

	init(commands: any[]) {
		this.owner = this.client.application?.owner;
		const allCommands = commands.map(command => new command(this.client));
		this.commands = allCommands.map(cmd => cmd.name == 'help' ? new cmd.constructor(cmd.client, allCommands) : cmd);
		this.client.on('interactionCreate', (interaction: Interaction) => {
			if(interaction.isChatInputCommand()) return this.onInteraction(interaction);
		});
		return this.commands;
	}

	parseArgs(interaction: CommandInteraction, command: Command) {
		if(!command || !command._options || command._options.length < 1) return [];

		let options = interaction.options?.data;
        while(options instanceof Array && options[0]?.options) {
            options = options[0].options;
        }

		const args = Object.assign({}, ...interaction.options?.data.map(o => {
			let res: any = {};
			const option = command._options!.find(opt => opt.name === o.name);
			switch(option?.type) {
				case ApplicationCommandOptionType.Number:
					res[o.name] = Number(o.value);
				break;

				case ApplicationCommandOptionType.Integer:
					res[o.name] = parseInt(`${o.value}`);
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

	static transformCommand(command: Command) {
		return {...command, options: command._options};
	  }
}

export default CommandHandler;