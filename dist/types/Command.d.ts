import { SlashCommandBuilder, ApplicationCommandOption, CommandInteraction } from 'discord.js';
import CommandClient from './Client';
import BaseCommand from './BaseCommand';
import CommandThrottle from './CommandThrottle';
import BaseCommandThrottle from "./BaseCommandThrottle.type";
import InteractionArgument from './InteractionsArgument';
declare class Command extends SlashCommandBuilder implements BaseCommand {
    client: CommandClient;
    ownerOnly?: boolean;
    clientPermissions?: bigint[];
    userPermissions?: bigint[];
    throttling?: BaseCommandThrottle;
    _options?: ApplicationCommandOption[];
    private _throttles;
    constructor(client: CommandClient, data: any);
    run(interaction: CommandInteraction, args: InteractionArgument[]): void;
    throttle(userID: string): CommandThrottle | null;
    hasPermission(interaction: CommandInteraction, ownerOverride?: boolean): string | true;
    onBlock(interaction: CommandInteraction, reason: string, data: any): Promise<import("discord.js").Message<boolean>> | Promise<import("discord.js").InteractionResponse<boolean>> | null;
    onError(err: Error, interaction: CommandInteraction): Promise<import("discord.js").Message<boolean>> | Promise<import("discord.js").InteractionResponse<boolean>>;
    static transformOption(option: ApplicationCommandOption, received: any): any;
    validateInfo(client: CommandClient, data: Command): void;
    validateOptions(options: any[]): void;
    validateSubcommand(data: ApplicationCommandOption): void;
    validateChoice(data: {
        name: string;
        value: number | string;
    }): void;
}
export default Command;
