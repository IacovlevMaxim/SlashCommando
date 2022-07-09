class BaseHandler {
    constructor(client) {
		if(!client.application) throw new Error("Client application is necessary");
        Object.defineProperty(this, 'client', { value: client });

        this.components = [];
    }

    //Initializes components in this.components
	init(components) {}

    //Recognizes the command from the received interaction (if any)
    recognize(interaction) {}

    //Parses arguments to run the command
	static parseArgs(interaction) {}

    //Function that is called when a interaction is received
	async onInteraction(interaction) {
		const component = this.recognize(interaction);
		if(!component) return;//throw new Error(`Unknown command '${commandName}' was triggered`);
		
		const noPerms = component.hasPermission(interaction);
		if(typeof noPerms === 'string') {
			const data = { response: typeof hasPermission === 'string' ? hasPermission : undefined };
			return component.onBlock(interaction, 'permission', data);
		}

		if(!interaction.channel) {
			await interaction.channel.fetch();
		}

		if(component.clientPermissions) {
			const missing = interaction.channel.permissionsFor(interaction.client.user).missing(component.clientPermissions, false);
			if(missing.length > 0) {
				const data = { missing };
				return component.onBlock(interaction, 'clientPermissions', data);
			}
		}

		const throttle = component.throttle(interaction.user);
		if(throttle && throttle.usages + 1 > component.throttling.usages) {
			const remaining = (throttle.start + (component.throttling.duration * 1000) - Date.now()) / 1000;
			const data = { throttle, remaining };
			return component.onBlock(interaction, 'throttling', data);
		}

		if(throttle) throttle.usages++;

		let args;
		if(component.options?.length > 0) {
			try {
				args = this.constructor.parseArgs(interaction, component);
			} catch(err) {
				return component.onBlock(interaction, 'invalidArg', {
					message: `${err}`
				});
			}
		}

		try {
			await component.run(interaction, args);
		} catch(err) {
			return component.onError(err, interaction);
		}
	}
}

module.exports = BaseHandler;