import { ApplicationCommandOption, BaseInteraction, Team, User } from "discord.js";
import InteractionArgument from './InteractionsArgument';
import BaseCommand from './BaseCommand';
import CommandClient from './Client';

abstract class BaseHandler<T extends BaseCommand, I extends BaseInteraction> {
	components: T[];
	client: CommandClient;
	owner?: User | Team | null;
    constructor(client: CommandClient) {
		if(!client.application) throw new Error("Client application is necessary");

        this.client = client;
        this.components = [];
    }

    //Initializes components in this.components
	abstract init(components: T[]) : void;

    //Recognizes the command from the received interaction (if any)
    abstract recognize(interaction: I): T | undefined;

    //Parses arguments to run the command
	abstract parseArgs(interaction: I, component?: T): InteractionArgument[];

    //Function that is called when a interaction is received
	async onInteraction(interaction: I): Promise<any> {
		const component = this.recognize(interaction);
		if(!component) return;
		
		// const noPerms = component.hasPermission(interaction);
		// if(typeof noPerms === 'string') {
		// 	const data = { response: typeof hasPermission === 'string' ? hasPermission : undefined };
		// 	return component.onBlock(interaction, 'permission', data);
		// }

		if(interaction.guildId && interaction.channel && !('recipientId' in interaction.channel) && component.clientPermissions) {
			const missing = interaction.channel.permissionsFor(interaction.client.user)!.missing(component.clientPermissions, false);
			if(missing.length > 0) {
				const data = { missing };
				return component.onBlock(interaction, 'clientPermissions', data);
			}
		}

		const throttle = component.throttle(interaction.user);
		if(throttle && component.throttling && throttle.usages + 1 > component.throttling.usages) {
			const remaining = (throttle.start + (component.throttling.duration * 1000) - Date.now()) / 1000;
			const data = { throttle, remaining };
			return component.onBlock(interaction, 'throttling', data);
		}

		if(throttle) throttle.usages++;

		let args;
		if(component._options && component._options.length > 0) {
			try {
				args = this.parseArgs(interaction, component);
			} catch(err) {
				return component.onBlock(interaction, 'invalidArg', {
					message: `${err}`
				});
			}
		}

		try {
			await component.run(interaction, args);
		} catch(err) {
			return component.onError(err as Error, interaction);
		}
	}
}

export default BaseHandler;