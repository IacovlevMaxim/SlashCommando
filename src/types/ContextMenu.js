const { ContextMenuCommandBuilder } = require('discord.js');

class ContextMenu extends ContextMenuCommandBuilder {
    constructor(client, data) {
        super();
        this.setName(data.name);
        this.setDMPermission(data.dm_permission);
        this.setType(data.type);
        this.setDefaultMemberPermissions(data.default_member_permissions);
    }

    async run(interaction) {
        throw new Error(`Context menu '${this.name}' has no 'run()' method`);
    }

    hasPermission() {
        return true;
    }

    throttle() {
        return null;
    }
}

module.exports = ContextMenu;