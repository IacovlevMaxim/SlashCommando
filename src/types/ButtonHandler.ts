import { ApplicationCommandOptionType, Interaction, User, ButtonInteraction, Team } from 'discord.js';
import BaseHandler from './BaseHandler';
import Button from './Button';
import CommandClient from './Client';
import InteractionArgument from './InteractionsArgument';


class ButtonHandler extends BaseHandler<Button, ButtonInteraction> {
    buttons: Button[];
    constructor(client: CommandClient) {
        super(client);
        this.buttons = [];
    }

    get(prefix: string) {
        return this.buttons.find(b => b.prefix === prefix);
    }

    registerButtonsIn(options: string) {
        const obj = require('require-all')(options);
		const buttons = [];
		for(const group of Object.values(obj)) {
			for(const button of Object.values(group as object)) {
				if(buttons.map(b => b.name).includes(button.name)) throw new Error(`Button with name '${button.prefix}' is already registered`);
				buttons.push(button);
			}
		}
		return this.init(buttons);
    }

    recognize(interaction: ButtonInteraction) {
        return this.components.find(b => interaction.customId.startsWith(b.prefix));
    }

	init(buttons: any[]) {
		this.owner = this.client.application?.owner;
		this.components = buttons.map(button => new button(this.client));
        this.client.on('interactionCreate', (interaction: Interaction) => {
            if(interaction.isButton()) return this.onInteraction(interaction);
        });
		return this.components;
	}

	parseArgs(interaction: ButtonInteraction, button: Button) {
        if(!button._options || button._options.length < 1) return {};
        let values = interaction.customId.split('-');
        values.shift();
        if(values.length > button._options.length) {
            throw new Error("Too many arguments provided");
        }
        const res: any = {};
        for(let i = 0;i < values.length;i++) {
            const { name, type } = button._options[i];
            let arg: any = {};
            switch(type) {
                case ApplicationCommandOptionType.Number:
                    arg[name] = Number(values[i])
                break;
                case ApplicationCommandOptionType.Boolean:
                    arg[name] = values[i] === 'true';
                break;
                default:
                    arg[name] = values[i];
                break;
            }
            Object.assign(res, arg);
        }
        return res;
	}

    static generateCustomId(button: Button, args: InteractionArgument) {
        let customIdObj: any = {};
        if(button._options && button._options.length > 0) {
            for(const option of button._options) {
                customIdObj[option.name] = args[option.name] ?? null;
            }
        }
        return [button.prefix, ...Object.values(customIdObj)].join('-');
    }
}

export default ButtonHandler;