const { Constants } = require('discord.js');
const { permissions } = require('../util');
const { stripIndent, oneLine } = require('common-tags');

class Command {
    constructor(client, data) {
        this.validateInfo(client, data);
        Object.defineProperty(this, 'client', { value: client });
        this.name = data.name;
        this.description = data.description;
        this.options = data.options ?? null;
        this.defaultPermission = data.defaultPermission ?? null;
        this.ownerOnly = Boolean(data.ownerOnly);
        this.clientPermissions = data.clientPermissions ?? null;
        this.userPermissions = data.userPermissions ?? null;
        this.throttling = data.throttling ?? null;
        this._throttles = new Map();
    }

    execute(interaction, args) {
        throw new Error(`Command '${this.name}' has no 'execute()' method`);
    }

    throttle(userID) {
		if(!this.throttling || this.client.application.owner.id == userID) return null;

		let throttle = this._throttles.get(userID);
		if(!throttle) {
			throttle = {
				start: Date.now(),
				usages: 0,
				timeout: setTimeout(() => {
					this._throttles.delete(userID);
				}, this.throttling.duration * 1000)
			};
			this._throttles.set(userID, throttle);
		}

		return throttle;
	}

    hasPermission(interaction, ownerOverride = true) {
        if(!this.ownerOnly && !this.userPermissions) return true;
		if(ownerOverride && this.client.application.owner.id === interaction.member.id) return true;

		if(this.ownerOnly && (ownerOverride || !this.client.application.owner.id === interaction.member.id)) {
			return `The \`${this.name}\` command can only be used by the bot owner.`;
		}

		if(this.userPermissions) {
			const missing = interaction.channel.permissionsFor(interaction.user).missing(this.userPermissions);
			if(missing.length > 0) {
				if(missing.length === 1) {
					return `The \`${this.name}\` command requires you to have the "${permissions[missing[0]]}" permission.`;
				}
				return oneLine`
					The \`${this.name}\` command requires you to have the following permissions:
					${missing.map(perm => permissions[perm]).join(', ')}
				`;
			}
		}
        return true;
    }

    onBlock(interaction, reason, data) {
		switch(reason) {
			case 'permission': {
				if(data.response) return interaction.reply(data.response);
				return interaction.reply(`You do not have permission to use the \`${this.name}\` command.`);
			}
			case 'clientPermissions': {
				if(data.missing.length === 1) {
					return interaction.reply(
						`I need the "${permissions[data.missing[0]]}" permission for the \`${this.name}\` command to work.`
					);
				}
				return interaction.reply(oneLine`
					I need the following permissions for the \`${this.name}\` command to work:
					${data.missing.map(perm => permissions[perm]).join(', ')}
				`);
			}
			case 'throttling': {
				return interaction.reply(
					`You may not use the \`${this.name}\` command again for another ${data.remaining.toFixed(1)} seconds.`
				);
			}
			default:
				return null;
		}
	}

    onError(err, interaction) {
        const owner = this.client.application.owner;
        return interaction.reply(stripIndent`
            An error occured when running the command: \`${err.name}: ${err.message}\`
            You should not have received this error.
            Please contact ${owner.username}#${owner.tag} in this server: https://discord.gg/dXES6RYtAq
        `);
    }

    static transformOption(option, received) {
        const stringType = typeof option.type === 'string' ? option.type : Constants.ApplicationCommandOptionTypes[option.type];
        return {
          type: typeof option.type === 'number' ? option.type : Constants.ApplicationCommandOptionTypes[option.type],
          name: option.name,
          description: option.description,
          required:
            option.required ?? (stringType === 'SUB_COMMAND' || stringType === 'SUB_COMMAND_GROUP' ? undefined : false),
          choices: option.choices,
          options: option.options?.map(o => this.transformOption(o, received)),
        };
    }

    validateInfo(client, data) {
        if(!client) throw new Error("Client must be specified");
        if(!data) throw new Error("Data must be specified");
        if(data.clientPermissions) {
            if(!Array.isArray(data.clientPermissions)) throw new TypeError("Command.clientPermissions must be an array");
            for(const perm of data.clientPermissions) {
                if(!permissions[perm]) throw new RangeError(`Invalid command clientPermission: ${perm}`);
            }
        }
        if(data.userPermissions) {
            if(!Array.isArray(data.userPermissions)) throw new TypeError("Command.clientPermissions must be an array");
            for(const perm of data.userPermissions) {
                if(!permissions[perm]) throw new RangeError(`Invalid command clientPermission: ${perm}`);
            }
        }
        if(data.throttling) {
            if(typeof data.throttling !== 'object') throw new TypeError("Command throttling must be an object");
            if(typeof data.throttling.usages !== 'number' || isNaN(data.throttling.usages)) {
				throw new TypeError('Command throttling usages must be a number.');
			}
			if(data.throttling.usages < 1) throw new RangeError('Command throttling usages must be at least 1.');
			if(typeof data.throttling.duration !== 'number' || isNaN(data.throttling.duration)) {
				throw new TypeError('Command throttling duration must be a number.');
			}
			if(data.throttling.duration < 1) throw new RangeError('Command throttling duration must be at least 1.');
        }
        this.validateCommand(data);
    }

    validateCommand(data) {
        if(typeof data.name !== 'string') throw new TypeError('Command name must be a string.');
        if(data.name !== data.name.toLowerCase()) throw new RangeError('Command name must be lower case');
        if(!/^[\w-]{1,32}$/.test(data.name)) throw new RangeError(`Command name '${data.name}' does not match the regex /^[\w-]{1,32}$/`);

        if(typeof data.description !== 'string') throw new TypeError('Command description must be a string.');
        if(data.description.length < 1) throw new RangeError('Command description length must be greater than 0');
        if(data.description.length > 100) throw new RangeError('Command description length must be less than or equal to 100')

        if('defaultPermission' in data && typeof data.defaultPermission !== 'boolean') throw new TypeError('Command default permission must be a boolean');
        if(data.options) {
            if(!Array.isArray(data.options)) throw new TypeError('Command options must be an array');
            if(data.options.length > 25) throw new RangeError('Options length must be 25 or less');
            for(const option of data.options) {
                this.validateSubcommand(option);
            }
        }   
    }

    validateSubcommand(data) {
        if(!Constants.ApplicationCommandOptionTypes[data.type]) throw new TypeError(`Subcommand type '${data.type}' is invalid`);
        if(data.name !== data.name.toLowerCase()) throw new RangeError('Subcommand name must be lower case');
        if(!/^[\w-]{1,32}$/.test(data.name)) throw new Error(`Subcommand name '${data.name}' does not match the regex /^[\w-]{1,32}$/`);
        if(typeof data.description !== 'string') throw new TypeError('Subcommand description must be a string.');
        if('required' in data && typeof data.required !== 'boolean') throw new TypeError('Subcommand "required" property must be a boolean');
        if(data.choices) {
            if(!Array.isArray(data.choices)) throw new TypeError('Subcommand choices must be an array');
            // if(data.type !== 'SUB_COMMAND_GROUP' && data.type !== '2') throw new Error('Subcommand group cannot have the "choices" property');
            if(data.choices.length > 25) throw new RangeError('Subcommand choices must be 25 or less');
            for(const choice of data.choices) {
                this.validateChoice(choice);
            }
        } 
        if(data.options) {
            if(!Array.isArray(data.options)) throw new TypeError('Subcommand options must be an array');
            if(data.type !== 'SUB_COMMAND' && data.type !== '1') throw new Error('Subcommand cannot have the "options" property')
            if(data.options.length > 25) throw new RangeError('Options length must be 25 or less');
            for(const option of data.options) {
                this.validateSubcommand(option)
            }
        }
    }

    validateChoice(data) {
        if(typeof data.name !== 'string') throw new TypeError("Command choice name must be a string");
        if(typeof data.value !== 'number' && typeof data.value !== 'string') throw new TypeError("Command choice value must be a number or a string");
    }
}

module.exports = Command;