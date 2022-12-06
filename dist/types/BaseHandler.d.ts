import { BaseInteraction, Team, User } from "discord.js";
import InteractionArgument from './InteractionsArgument';
import BaseCommand from './BaseCommand';
import CommandClient from './Client';
declare abstract class BaseHandler<T extends BaseCommand, I extends BaseInteraction> {
    components: T[];
    client: CommandClient;
    owner?: User | Team | null;
    constructor(client: CommandClient);
    abstract init(components: T[]): void;
    abstract recognize(interaction: I): T | undefined;
    abstract parseArgs(interaction: I, component?: T): InteractionArgument[];
    onInteraction(interaction: I): Promise<any>;
}
export default BaseHandler;
