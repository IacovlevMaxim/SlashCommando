import { ContextMenuCommandInteraction, ContextMenuCommandBuilder } from "discord.js";
import BaseCommand from "./BaseCommand";
import CommandClient from "./Client";

class ContextMenu extends ContextMenuCommandBuilder implements BaseCommand {
    constructor(client: CommandClient, data: any) {
        super();
        this.setName(data.name);
        this.setDMPermission(data.dm_permission);
        this.setType(data.type);
        this.setDefaultMemberPermissions(data.default_member_permissions);
    }

    async run(interaction: ContextMenuCommandInteraction) {
        throw new Error(`Context menu '${this.name}' has no 'run()' method`);
    }

    onError(err: Error, interaction: ContextMenuCommandInteraction) {
        console.error(err);
        return null;
    }

    onBlock(interaction: ContextMenuCommandInteraction, reason: string, data: any) {
        return;
    }

    hasPermission() {
        return true;
    }

    throttle() {
        return null;
    }
}

export default ContextMenu;