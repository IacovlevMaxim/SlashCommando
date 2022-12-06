import { ApplicationCommandOption, BaseInteraction, InteractionResponse, Message, User } from "discord.js";
import InteractionArgument from './InteractionsArgument';
import BaseCommandThrottle from "./BaseCommandThrottle.type";
import CommandThrottle from './CommandThrottle';
declare type Response = Message | InteractionResponse;
declare type BlockReason = 'permission' | 'clientPermissions' | 'throttling' | 'invalidArg' | string;
interface BaseCommand {
    clientPermissions?: bigint[];
    throttling?: BaseCommandThrottle;
    _options?: ApplicationCommandOption[];
    run(interaction: BaseInteraction, args?: InteractionArgument[]): void | Response | Promise<void> | Promise<Response>;
    hasPermission(interaction: BaseInteraction, ownerOverride?: boolean): boolean | string;
    onBlock(interaction: BaseInteraction, reason?: BlockReason, data?: any): Promise<Response> | void | null | undefined;
    onError(err: Error, interaction: BaseInteraction): Promise<Response> | null;
    throttle(userID: User | string): CommandThrottle | null;
}
export default BaseCommand;
