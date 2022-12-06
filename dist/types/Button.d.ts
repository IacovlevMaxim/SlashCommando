import { ApplicationCommandOption, ButtonBuilder, ButtonInteraction } from 'discord.js';
import BaseCommand from './BaseCommand';
import CommandClient from './Client';
import BaseCommandThrottle from './BaseCommandThrottle.type';
import CommandThrottle from './CommandThrottle';
import InteractionArgument from './InteractionsArgument';
declare class Button extends ButtonBuilder implements BaseCommand {
    client: CommandClient;
    prefix: string;
    ownerOnly?: boolean;
    _options?: ApplicationCommandOption[];
    clientPermissions?: bigint[];
    userPermissions?: bigint[];
    throttling?: BaseCommandThrottle;
    private _throttles;
    constructor(client: CommandClient, data: any);
    generate(args: InteractionArgument[]): string | ButtonBuilder;
    validateInfo(client: CommandClient, data: any): void;
    validateOptions(data: ApplicationCommandOption[]): void;
    run(interaction: ButtonInteraction, args: InteractionArgument[]): void;
    /**
     * Option:
     * name
     * required
     */
    onError(err: Error, interaction: ButtonInteraction): Promise<import("discord.js").Message<boolean>> | Promise<import("discord.js").InteractionResponse<boolean>>;
    hasPermission(interaction: ButtonInteraction, ownerOverride?: boolean): string | true;
    throttle(userID: string): CommandThrottle | null;
    onBlock(interaction: ButtonInteraction, reason: string, data: any): Promise<import("discord.js").Message<boolean>> | Promise<import("discord.js").InteractionResponse<boolean>> | null;
}
export default Button;
