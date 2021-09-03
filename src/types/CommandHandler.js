const { ApplicationCommand } = require('discord.js');
const InteractionCall = require('./InteractionCall');
const p = require('phin');
const MessageCall = require('./MessageCall');

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

	async onCommand(callData) {
		const call = callData.token 
					 ? 
					 new InteractionCall(callData.client, callData) 
					 : 
					 new MessageCall(callData.client, 
						await p({
							"url": `https://discord.com/api/v6/channels/${callData.channel.id}/messages/${callData.id}`,
							"method": "GET",
							"headers": {
								"Authorization": `Bot ${callData.client.token}`
							}
						}).then(res => JSON.parse(res.body)));

		const command = this.commands.find(c => c.name == call.commandName);
		if(!command) return;//throw new Error(`Unknown command '${commandName}' was triggered`);
		
		const noPerms = command.hasPermission(call);
		if(typeof noPerms === 'string') {
			const data = { response: typeof hasPermission === 'string' ? hasPermission : undefined };
			return command.onBlock(call, 'permission', data);
		}

		if(!call.channel) {
			await call.channel.fetch();
		}

		if(command.clientPermissions) {
			const missing = call.channel.permissionsFor(call.client.user).missing(command.clientPermissions, false);
			if(missing.length > 0) {
				const data = { missing };
				// this.client.emit('commandBlock', this, 'clientPermissions', data);
				return command.onBlock(call, 'clientPermissions', data);
			}
		}

		const throttle = command.throttle(call.user);
		if(throttle && throttle.usages + 1 > command.throttling.usages) {
			const remaining = (throttle.start + (command.throttling.duration * 1000) - Date.now()) / 1000;
			const data = { throttle, remaining };
			// this.client.emit('commandBlock', this, 'throttling', data);
			return command.onBlock(call, 'throttling', data);
		}

		if(throttle) throttle.usages++;

		let args;
		if(command.options.length > 0) {
			try {
				args = call.parseArgs(callData, command);
			} catch(err) {
				return command.onBlock(call, 'invalidArg', {
					message: `${err}`
				});
			}
		}

		try {
			await command.run(call, args);
		} catch(err) {
			return command.onError(err, call);
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