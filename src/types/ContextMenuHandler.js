const BaseHandler = require('./BaseHandler');

class ContextMenuHandler extends BaseHandler {
    constructor(client) {
		super(client);
        this.onInteraction = this.onInteraction.bind(this);
    }

	recognize(interaction) {
		return this.contextMenus.find(c => c.name == interaction.commandName && c.type === interaction.commandType);
	}

    async registerContextMenusIn(options) {
        const obj = require('require-all')(options);
		const contextMenus = [];
		for(const group of Object.values(obj)) {
			for(let contextMenu of Object.values(group)) {
				if(contextMenus.map(c => c.name).includes(contextMenu.name)) throw new Error(`Context menu with name '${contextMenu.name}' is already registered`)
				contextMenus.push(contextMenu);
			}
		}
		return this.registerContextMenus(this.init(contextMenus));
    }

	async registerContextMenus(contextMenus) {
		if(!this.client.application.owner) await this.client.application.fetch();
		await this.client.application.commands.fetch();

		const options = this.client.commandoOptions;
		const data = contextMenus.map(contextMenu => ContextMenuHandler.transformContextMenu(contextMenu));
		return data;
	}

	init(contextMenus) {
		this.owner = this.client.application.owner;
		this.contextMenus = contextMenus.map(contextMenu => new contextMenu(this.client));
		this.client.on('interactionCreate', interaction => {
			if(interaction.isCommand() && interaction.targetId) return this.onInteraction(interaction);
		});
		return this.contextMenus;
	}


	static transformContextMenu(contextMenu) {
		return {...contextMenu};
	}
}

module.exports = ContextMenuHandler;