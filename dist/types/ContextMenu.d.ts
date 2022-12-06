import { ContextMenuCommandInteraction, ContextMenuCommandBuilder } from "discord.js";
import BaseCommand from "./BaseCommand";
import CommandClient from "./Client";
declare class ContextMenu extends ContextMenuCommandBuilder implements BaseCommand {
    constructor(client: CommandClient, data: any);
    run(interaction: ContextMenuCommandInteraction): Promise<void>;
    onError(err: Error, interaction: ContextMenuCommandInteraction): null;
    onBlock(interaction: ContextMenuCommandInteraction, reason: string, data: any): void;
    hasPermission(): boolean;
    throttle(): null;
}
export default ContextMenu;
