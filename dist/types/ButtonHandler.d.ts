import { ButtonInteraction } from 'discord.js';
import BaseHandler from './BaseHandler';
import Button from './Button';
import CommandClient from './Client';
import InteractionArgument from './InteractionsArgument';
declare class ButtonHandler extends BaseHandler<Button, ButtonInteraction> {
    buttons: Button[];
    constructor(client: CommandClient);
    get(prefix: string): Button | undefined;
    registerButtonsIn(options: string): Button[];
    recognize(interaction: ButtonInteraction): Button | undefined;
    init(buttons: any[]): Button[];
    parseArgs(interaction: ButtonInteraction, button: Button): any;
    static generateCustomId(button: Button, args: InteractionArgument): string;
}
export default ButtonHandler;
