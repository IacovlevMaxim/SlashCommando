import { Client }  from "discord.js";
import CommandHandler from './CommandHandler';
import ButtonHandler from './ButtonHandler';
import ContextMenuHandler from './ContextMenuHandler';

class CommandClient extends Client {
    commandHandler!: CommandHandler;
    contextMenusHandler!: ContextMenuHandler;
    buttonHandler!: ButtonHandler;
    prefix: string;
    commandoOptions: unknown;
    constructor(options: any) {
        super(options);
        this.validateInfo(options.commandoOptions);
        this.prefix = options.commandoOptions.prefix;
        this.commandoOptions = options.commandoOptions || null;
    }

    async registerCommandsIn(options: string) {
        this.commandHandler = new CommandHandler(this);
        return this.commandHandler.registerCommandsIn(options);
    }

    async registerContextMenusIn(options: string) {
        this.contextMenusHandler = new ContextMenuHandler(this);
        return this.contextMenusHandler.registerContextMenusIn(options);
    }

    async registerButtonsIn(options: string) {
        this.buttonHandler = new ButtonHandler(this);
        return this.buttonHandler.registerButtonsIn(options);
    }

    validateInfo(options: { prefix: string }) {
        if(!options?.prefix) throw new Error("Prefix must be defined");
        if(options.prefix !== options.prefix.toLowerCase()) throw new RangeError("Prefix must be lower-case");
    }
}

export default CommandClient;