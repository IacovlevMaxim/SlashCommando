"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
class ContextMenu extends discord_js_1.ContextMenuCommandBuilder {
    constructor(client, data) {
        super();
        this.setName(data.name);
        this.setDMPermission(data.dm_permission);
        this.setType(data.type);
        this.setDefaultMemberPermissions(data.default_member_permissions);
    }
    run(interaction) {
        throw new Error(`Context menu '${this.name}' has no 'run()' method`);
    }
    onError(err, interaction) {
        console.error(err);
        return null;
    }
    onBlock(interaction, reason, data) {
        return;
    }
    hasPermission() {
        return true;
    }
    throttle() {
        return null;
    }
}
exports.default = ContextMenu;
