import { SlashCommandBuilder, 
        ApplicationCommandOption, 
        ApplicationCommandOptionType, 
        PermissionFlagsBits,
        ChannelType, 
        CommandInteraction, 
        GuildMember, 
        BaseGuildTextChannel, 
        PermissionsString,
        RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord.js';
import { permissions } from '../util';
import { stripIndent, oneLine } from 'common-tags';
import CommandClient from './Client';
import BaseCommand from './BaseCommand';
import CommandThrottle from './CommandThrottle';
import BaseCommandThrottle from "./BaseCommandThrottle.type";
import InteractionArgument from './InteractionsArgument';
const valLimit = 2 ** 16;

class Command extends SlashCommandBuilder implements BaseCommand {
    ownerOnly?: boolean;
    clientPermissions?: bigint[];
    userPermissions?: bigint[];
    throttling?: BaseCommandThrottle;
    _options?: ApplicationCommandOption[];
    private _throttles: Map<string, CommandThrottle>;

    constructor(public client: CommandClient, data: any) {
        super();
        this.validateInfo(client, data);
        this.setName(data.name)
            .setDescription(data.description)
            .setDMPermission(data.dm_permission)
            .setDefaultMemberPermissions(data.default_member_permissions);
        this._options = data.options ?? null;
        this.ownerOnly = Boolean(data.ownerOnly);
        this.clientPermissions = data.clientPermissions ?? null;
        this.userPermissions = data.userPermissions ?? null;
        this.throttling = data.throttling ?? null;
        this._throttles = new Map();
    }

    run(interaction: CommandInteraction, args: InteractionArgument[]) {
        throw new Error(`Command '${this.name}' has no 'run()' method`);
    }

    throttle(userID: string) {
		if(!this.throttling || this.client.application?.owner?.id == userID) return null;

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

    hasPermission(interaction: CommandInteraction, ownerOverride = true) {
        if(!this.ownerOnly && !this.userPermissions) return true;

        const member = interaction.member as GuildMember;
        if(this.client.application?.owner) {
            if(ownerOverride && this.client.application.owner.id === member.id) return true;

            if(this.ownerOnly && (ownerOverride || this.client.application.owner.id !== member.id)) {
                return `The \`${this.name}\` command can only be used by the bot owner.`;
            }
        }

        if(!interaction.guildId || !this.userPermissions) return true;

        const channel = interaction.channel as BaseGuildTextChannel;
        const missing = channel.permissionsFor(interaction.user)?.missing(this.userPermissions);

        if(!missing || missing.length < 1) return true;

        if(missing.length === 1) {
            return `The \`${this.name}\` command requires you to have the "${permissions[missing[0]]}" permission.`;
        }
        return oneLine`
            The \`${this.name}\` command requires you to have the following permissions:
            ${missing.map(perm => permissions[perm]).join(', ')}
        `;
    }

    onBlock(interaction: CommandInteraction, reason: string, data: any) {
		switch(reason) {
			case 'permission': {
				if(data.response) return interaction.reply(data.response);
				return interaction.reply({
                    content: `You do not have permission to use the \`${this.name}\` command.`,
                    ephemeral: true
                });
			}
			case 'clientPermissions': {
                const missing = data.missing as string[];
				if(missing.length === 1) {
                    const missingPerm = missing[0] as PermissionsString;
                    const permission = PermissionFlagsBits[missingPerm];
                    const reply = {
                        content: `I need the "${permissions[`${permission}`]}" permission for the \`${this.name}\` command to work.`,
                        ephemeral: true
                    };
                    return interaction.reply(reply);
				}
                const reply = {
                    content: oneLine`
					I need the following permissions for the \`${this.name}\` command to work:
					${data.missing.map((perm: string) => permissions[`${PermissionFlagsBits[perm as PermissionsString]}`]).join(', ')}`,
                    ephemeral: true
                };
				return interaction.reply(reply)
			}
			case 'throttling': {
				return interaction.reply({
                    content: `You may not use the \`${this.name}\` command again for another ${data.remaining.toFixed(1)} seconds.`,
                    ephemeral: true
                });
			}
            case 'invalidArg':
                return interaction.reply({
                    content: data.message,
                    ephemeral: true
                })
			default:
				return null;
		}
	}

    onError(err: Error, interaction: CommandInteraction) {
        const response = err.message == 'Cannot read property \'collection\' of undefined' 
                         ? 
                         'Promobot is starting its processes. Please retry in a few minutes'
                         :
                         stripIndent`
            An error occured when running the command: \`${err.name}: ${err.message}\`
            You should not have received this error.
            Please contact moderators in this server: https://discord.gg/dXES6RYtAq
        `;
        console.error(err);
        return interaction.replied ? interaction.followUp(response) : interaction.reply(response);
    }

    static transformOption(option: ApplicationCommandOption, received: any): any {
        const stringType = ApplicationCommandOptionType[option.type];
        return {
            type: typeof option.type === 'number' ? option.type : ApplicationCommandOptionType[option.type],
            name: option.name,
            description: option.description,
            required:
              (option.type === ApplicationCommandOptionType.Subcommand || option.type === ApplicationCommandOptionType.SubcommandGroup ? undefined : option.required ),
            choices: 'choices' in option ? option.choices : undefined,
            options: 'options' in option ? option.options?.map(o => this.transformOption(o, received)) : undefined,
            channel_types: 'channelTypes' in option ? option.channelTypes : undefined,
            min_value: 'minValue' in option ? option.minValue : undefined,
            max_value: 'maxValue' in option ? option.maxValue : undefined,
            min_length: 'minLength' in option ? option.minLength : undefined,
            max_length: 'maxLength' in option ? option.maxLength : undefined
        };
    }

    validateInfo(client: CommandClient, data: Command) {
        if(!client) throw new Error("Client must be specified");
        if(!data) throw new Error("Data must be specified");
        if(data.clientPermissions) {
            if(!Array.isArray(data.clientPermissions)) throw new TypeError("Command.clientPermissions must be an array");
            for(const perm of data.clientPermissions) {
                if(!permissions[`${perm}`]) throw new RangeError(`Invalid command clientPermission: ${perm}`);
            }
        }
        if(data.userPermissions) {
            if(!Array.isArray(data.userPermissions)) throw new TypeError("Command.clientPermissions must be an array");
            for(const perm of data.userPermissions) {
                if(!permissions[`${perm}`]) throw new RangeError(`Invalid command clientPermission: ${perm}`);
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
        this.validateOptions(data.options as any[]);
    }

    validateOptions(options: any[]) {
        // if(typeof data.name !== 'string') throw new TypeError('Command name must be a string.');
        // if(data.name !== data.name.toLowerCase()) throw new RangeError('Command name must be lower case');
        // if(!/^[\w-]{1,32}$/.test(data.name)) throw new RangeError(`Command name '${data.name}' does not match the regex /^[\w-]{1,32}$/`);

        // if(typeof data.description !== 'string') throw new TypeError('Command description must be a string.');
        // if(data.description.length < 1) throw new RangeError('Command description length must be greater than 0');
        // if(data.description.length > 100) throw new RangeError('Command description length must be less than or equal to 100')

        // if('defaultPermission' in data && typeof data.defaultPermission !== 'boolean') throw new TypeError('Command default permission must be a boolean');
        if(options) {
            if(!Array.isArray(options)) throw new TypeError('Command options must be an array');
            if(options.length > 25) throw new RangeError('Options length must be 25 or less');
            for(const option of options) {
                this.validateSubcommand(option);
            }
        }   
    }

    validateSubcommand(data: ApplicationCommandOption) {
        if(!ApplicationCommandOptionType[data.type]) throw new TypeError(`Subcommand type '${data.type}' is invalid`);
        if(data.name !== data.name.toLowerCase()) throw new RangeError('Subcommand name must be lower case');
        if(!/^[\w-]{1,32}$/.test(data.name)) throw new Error(`Subcommand name '${data.name}' does not match the regex /^[\w-]{1,32}$/`);
        if(typeof data.description !== 'string') throw new TypeError('Subcommand description must be a string.');
        if('required' in data && typeof data.required !== 'boolean') throw new TypeError('Subcommand "required" property must be a boolean');
        if('choices' in data) {
            if(!Array.isArray(data.choices)) throw new TypeError('Subcommand choices must be an array');
            // if(data.type !== 'SUB_COMMAND_GROUP' && data.type !== '2') throw new Error('Subcommand group cannot have the "choices" property');
            if(data.choices.length > 25) throw new RangeError('Subcommand choices must be 25 or less');
            for(const choice of data.choices) {
                this.validateChoice(choice);
            }
        } 
        if('options' in data) {
            if(!Array.isArray(data.options)) throw new TypeError('Subcommand options must be an array');
            if(data.type !== ApplicationCommandOptionType.Subcommand) throw new Error('Subcommand cannot have the "options" property')
            if(data.options.length > 25) throw new RangeError('Options length must be 25 or less');
            for(const option of data.options) {
                this.validateSubcommand(option)
            }
        }
        if('channelTypes' in data) {
            if(!Array.isArray(data.channelTypes)) throw new TypeError("Command.channelTypes must be an array");
            for(const type of data.channelTypes) {
                if(!ChannelType[type]) throw new RangeError(`Channel type ${type} is not a valid Channel type`);
            }
        }
        if('minValue' in data) {
            if(data.type === ApplicationCommandOptionType.Number && typeof data.minValue !== 'number') throw new TypeError("Command option minValue must be a Number");
            if(data.type === ApplicationCommandOptionType.Integer && !Number.isInteger(data.minValue)) throw new TypeError("Command option minValue must be an Integer");
            if(data.minValue! < -valLimit) throw new RangeError(`Command option minValue should be greater than ${-valLimit}`); 
        }
        if('maxValue' in data) {
            if(data.type === ApplicationCommandOptionType.Number && typeof data.maxValue !== 'number') throw new TypeError("Command option maxValue must be a Number");
            if(data.type === ApplicationCommandOptionType.Integer && !Number.isInteger(data.maxValue)) throw new TypeError("Command option maxValue must be an Integer");
            if(data.maxValue! > valLimit) throw new RangeError(`Command option maxValue should be less than ${valLimit}`);
        }
        if('minLength' in data) {
            if(data.type !== ApplicationCommandOptionType.String) throw new Error("Command option minLength only allowed for option type String");
            if(!Number.isInteger(data.minLength)) throw new TypeError("Command option minLength must be an integer");
            if(data.minLength! < 0) throw new RangeError("Command option minLength must be greater than or equal to 0");
            if(data.minLength! > 6000) throw new RangeError("Command option minLength must be lesss than or equal to 6000");
        }
        if('maxLength' in data) {
            if(data.type !== ApplicationCommandOptionType.String) throw new Error("Command option maxLength only allowed for option type String");
            if(!Number.isInteger(data.maxLength)) throw new TypeError("Command option maxLength must be an integer");
            if(data.maxLength! < 1) throw new RangeError("Command option maxLength must be greater than or equal to 1");
            if(data.maxLength! > 6000) throw new RangeError("Command option maxLength must be lesss than or equal to 6000");
        }
    }

    validateChoice(data: { name: string, value: number | string}) {
        if(typeof data.name !== 'string') throw new TypeError("Command choice name must be a string");
        if(typeof data.value !== 'number' && typeof data.value !== 'string') throw new TypeError("Command choice value must be a number or a string");
    }
}

export default Command;