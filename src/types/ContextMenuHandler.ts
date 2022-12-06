import BaseHandler from './BaseHandler';
import ContextMenu from './ContextMenu';
import { BaseInteraction, ContextMenuCommandInteraction, Team, User } from 'discord.js';
import CommandClient from './Client';
import InteractionArgument from './InteractionsArgument';

class ContextMenuHandler extends BaseHandler<ContextMenu, ContextMenuCommandInteraction> {
	contextMenus: ContextMenu[];

    constructor(client: CommandClient) {
		super(client);
		this.contextMenus = [];
        this.onInteraction = this.onInteraction.bind(this);
    }

	override recognize(interaction: ContextMenuCommandInteraction): ContextMenu | undefined {
		return this.contextMenus.find((c: ContextMenu) => c.name == interaction.commandName && c.type === interaction.commandType);
	}

	override parseArgs(interaction: ContextMenuCommandInteraction, component?: ContextMenu | undefined) {
		return [];
	}

    async registerContextMenusIn(options: string) {
        const obj = require('require-all')(options);
		const contextMenus: ContextMenu[] = [];
		for(const group of Object.values(obj)) {
			for(let contextMenu of Object.values(group as object)) {
				const cm = contextMenu as ContextMenu;
				if(contextMenus.map(c => c.name).includes(cm.name)) throw new Error(`Context menu with name '${cm.name}' is already registered`)
				contextMenus.push(cm);
			}
		}
		return this.registerContextMenus(this.init(contextMenus));
    }

	async registerContextMenus(contextMenus: any[]) {
		if(this.client.application) {
			await this.client.application.fetch();
			await this.client.application.commands.fetch();
		}

		const options = this.client.commandoOptions;
		const data = contextMenus.map(contextMenu => ContextMenuHandler.transformContextMenu(contextMenu));
		return data;
	}

	init(contextMenus: any[]) {
		this.owner = this.client.application?.owner;
		this.contextMenus = contextMenus.map(contextMenu => new contextMenu(this.client));
		this.client.on('interactionCreate', (interaction: BaseInteraction) => {
			if(interaction.isContextMenuCommand() && interaction.targetId) return this.onInteraction(interaction);
		});
		return this.contextMenus;
	}


	static transformContextMenu(contextMenu: ContextMenu) {
		return {...contextMenu};
	}
}

export default ContextMenuHandler;