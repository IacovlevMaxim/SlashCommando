const BaseHandler = require('./BaseHandler');

class ButtonHandler extends BaseHandler {
    constructor(client) {
        super(client);
    }

    get(prefix) {
        return this.buttons.find(b => b.prefix === prefix);
    }

    registerButtonsIn(options) {
        const obj = require('require-all')(options);
		const buttons = [];
		for(const group of Object.values(obj)) {
			for(const button of Object.values(group)) {
				if(buttons.map(b => b.prefix).includes(button.prefix)) throw new Error(`Button with prefix '${button.prefix}' is already registered`);
				buttons.push(button);
			}
		}
		return this.init(buttons);
    }

    recognize(interaction) {
        return this.components.find(b => interaction.customId.startsWith(b.prefix));
    }

	init(buttons) {
		this.owner = this.client.application.owner;
		this.components = buttons.map(button => new button(this.client));
        this.client.on('interactionCreate', interaction => {
            if(interaction.isButton()) return this.onInteraction(interaction);
        });
		return this.components;
	}

	static parseArgs(interaction, button) {
        let values = interaction.customId.split('-');
        values.shift();
        if(values.length > button.options.length) {
            throw new Error("Too many arguments provided");
        }
        const res = {};
        for(let i = 0;i < values.length;i++) {
            const { name, type } = button.options[i];
            let arg = {};
            switch(type) {
                case 'NUMBER':
                    arg[name] = Number(values[i])
                break;
                case 'BOOLEAN':
                    arg[name] = values[i] == 'true';
                break;
                default:
                    arg[name] = values[i];
                break;
            }
            Object.assign(res, arg);
        }
        return res;
	}

    static generateCustomId(button, args) {
        let customIdObj = {};
        for(const option of button.options) {
            customIdObj[option.name] = args[option.name] ?? null;
        }
        return [button.prefix, ...Object.values(customIdObj)].join('-');
    }
}

module.exports = ButtonHandler;