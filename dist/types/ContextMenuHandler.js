"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BaseHandler_1 = require("./BaseHandler");
class ContextMenuHandler extends BaseHandler_1.default {
    constructor(client) {
        super(client);
        Object.defineProperty(this, "contextMenus", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.contextMenus = [];
        this.onInteraction = this.onInteraction.bind(this);
    }
    recognize(interaction) {
        return this.contextMenus.find((c) => c.name == interaction.commandName && c.type === interaction.commandType);
    }
    parseArgs(interaction, component) {
        return [];
    }
    async registerContextMenusIn(options) {
        const obj = require('require-all')(options);
        const contextMenus = [];
        for (const group of Object.values(obj)) {
            for (let contextMenu of Object.values(group)) {
                const cm = contextMenu;
                if (contextMenus.map(c => c.name).includes(cm.name))
                    throw new Error(`Context menu with name '${cm.name}' is already registered`);
                contextMenus.push(cm);
            }
        }
        return this.registerContextMenus(this.init(contextMenus));
    }
    async registerContextMenus(contextMenus) {
        if (this.client.application) {
            await this.client.application.fetch();
            await this.client.application.commands.fetch();
        }
        const options = this.client.commandoOptions;
        const data = contextMenus.map(contextMenu => ContextMenuHandler.transformContextMenu(contextMenu));
        return data;
    }
    init(contextMenus) {
        this.owner = this.client.application?.owner;
        this.contextMenus = contextMenus.map(contextMenu => new contextMenu(this.client));
        this.client.on('interactionCreate', (interaction) => {
            if (interaction.isContextMenuCommand() && interaction.targetId)
                return this.onInteraction(interaction);
        });
        return this.contextMenus;
    }
    static transformContextMenu(contextMenu) {
        return { ...contextMenu };
    }
}
exports.default = ContextMenuHandler;
