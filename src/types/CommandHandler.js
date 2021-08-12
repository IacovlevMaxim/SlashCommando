const { ApplicationCommand } = require('discord.js');

class CommandHandler {
    constructor(client) {
		if(!client.application) throw new Error("Client application is necessary");
        Object.defineProperty(this, 'client', { value: client });

		this.commands = [];
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
		this.commands = commands.map(command => new command(this.client));
		return this.commands;
	}

	async onCommand(interaction) {
		const command = this.commands.find(c => c.name == interaction.commandName);
		if(!command) throw new Error(`Unknown command '${interaction.commandName}' was triggered`);
		
		const noPerms = command.hasPermission(interaction);
		if(typeof noPerms === 'string') {
			const data = { response: typeof hasPermission === 'string' ? hasPermission : undefined };
			return command.onBlock(interaction, 'permission', data);
		}

		if(command.clientPermissions) {
			const missing = interaction.channel.permissionsFor(interaction.client.user).missing(command.clientPermissions, false);
			if(missing.length > 0) {
				const data = { missing };
				// this.client.emit('commandBlock', this, 'clientPermissions', data);
				return command.onBlock(interaction, 'clientPermissions', data);
			}
		}

		const throttle = command.throttle(interaction.user.id);
		if(throttle && throttle.usages + 1 > command.throttling.usages) {
			const remaining = (throttle.start + (command.throttling.duration * 1000) - Date.now()) / 1000;
			const data = { throttle, remaining };
			// this.client.emit('commandBlock', this, 'throttling', data);
			return command.onBlock(interaction, 'throttling', data);
		}

		if(throttle) throttle.usages++;

		const args = Object.assign({}, ...interaction.options?._hoistedOptions.map(o => {
			let res = {};
			res[o.name] = o.value;
			return res;
		}));

		try {
			await command.run(interaction, args);

			if(!interaction.replied) throw new Error(`Interaction from command '${command.name}' must receive a reply`);
		} catch(err) {
			return command.onError(err, interaction);
		}
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