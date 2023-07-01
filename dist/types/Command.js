"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const util_1 = require("../util");
const common_tags_1 = require("common-tags");
const valLimit = 2 ** 16;
class Command extends discord_js_1.SlashCommandBuilder {
    constructor(client, data) {
        super();
        Object.defineProperty(this, "client", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: client
        });
        Object.defineProperty(this, "ownerOnly", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "clientPermissions", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "userPermissions", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "throttling", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_options", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_throttles", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
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
    run(interaction, args) {
        throw new Error(`Command '${this.name}' has no 'run()' method`);
    }
    throttle(userID) {
        if (!this.throttling || this.client.application?.owner?.id == userID)
            return null;
        let throttle = this._throttles.get(userID);
        if (!throttle) {
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
        if (!this.ownerOnly && !this.userPermissions)
            return true;
        const member = interaction.member;
        if (this.client.application?.owner) {
            if (ownerOverride && this.client.application.owner.id === member.id)
                return true;
            if (this.ownerOnly && (ownerOverride || this.client.application.owner.id !== member.id)) {
                return `The \`${this.name}\` command can only be used by the bot owner.`;
            }
        }
        if (!interaction.guildId || !this.userPermissions)
            return true;
        const channel = interaction.channel;
        const missing = channel.permissionsFor(interaction.user)?.missing(this.userPermissions);
        if (!missing || missing.length < 1)
            return true;
        if (missing.length === 1) {
            return `The \`${this.name}\` command requires you to have the "${util_1.permissions[missing[0]]}" permission.`;
        }
        return (0, common_tags_1.oneLine) `
            The \`${this.name}\` command requires you to have the following permissions:
            ${missing.map(perm => util_1.permissions[perm]).join(', ')}
        `;
    }
    onBlock(interaction, reason, data) {
        switch (reason) {
            case 'permission': {
                if (data.response)
                    return interaction.reply(data.response);
                return interaction.reply({
                    content: `You do not have permission to use the \`${this.name}\` command.`,
                    ephemeral: true
                });
            }
            case 'clientPermissions': {
                const missing = data.missing;
                if (missing.length === 1) {
                    const missingPerm = missing[0];
                    const permission = discord_js_1.PermissionFlagsBits[missingPerm];
                    const reply = {
                        content: `I need the "${util_1.permissions[`${permission}`]}" permission for the \`${this.name}\` command to work.`,
                        ephemeral: true
                    };
                    return interaction.reply(reply);
                }
                const reply = {
                    content: (0, common_tags_1.oneLine) `
					I need the following permissions for the \`${this.name}\` command to work:
					${data.missing.map((perm) => util_1.permissions[`${discord_js_1.PermissionFlagsBits[perm]}`]).join(', ')}`,
                    ephemeral: true
                };
                return interaction.reply(reply);
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
                });
            default:
                return null;
        }
    }
    onError(err, interaction) {
        const response = err.message == 'Cannot read property \'collection\' of undefined'
            ?
                'Promobot is starting its processes. Please retry in a few minutes'
            :
                (0, common_tags_1.stripIndent) `
            An error occured when running the command: \`${err.name}: ${err.message}\`
            You should not have received this error.
            Please contact moderators in this server: https://discord.gg/dXES6RYtAq
        `;
        console.error(err);
        return interaction.replied ? interaction.followUp(response) : interaction.reply(response);
    }
    static transformOption(option, received) {
        return {
            type: option.type,
            name: option.name,
            description: option.description,
            required: (option.type === discord_js_1.ApplicationCommandOptionType.Subcommand || option.type === discord_js_1.ApplicationCommandOptionType.SubcommandGroup ? undefined : option.required),
            choices: 'choices' in option ? option.choices : undefined,
            options: 'options' in option ? option.options?.map(o => this.transformOption(o, received)) : undefined,
            channel_types: 'channelTypes' in option ? option.channelTypes : undefined,
            min_value: 'minValue' in option ? option.minValue : undefined,
            max_value: 'maxValue' in option ? option.maxValue : undefined,
            min_length: 'minLength' in option ? option.minLength : undefined,
            max_length: 'maxLength' in option ? option.maxLength : undefined
        };
    }
    validateInfo(client, data) {
        if (!client)
            throw new Error("Client must be specified");
        if (!data)
            throw new Error("Data must be specified");
        if (data.clientPermissions) {
            if (!Array.isArray(data.clientPermissions))
                throw new TypeError("Command.clientPermissions must be an array");
            for (const perm of data.clientPermissions) {
                if (!util_1.permissions[`${perm}`])
                    throw new RangeError(`Invalid command clientPermission: ${perm}`);
            }
        }
        if (data.userPermissions) {
            if (!Array.isArray(data.userPermissions))
                throw new TypeError("Command.clientPermissions must be an array");
            for (const perm of data.userPermissions) {
                if (!util_1.permissions[`${perm}`])
                    throw new RangeError(`Invalid command clientPermission: ${perm}`);
            }
        }
        if (data.throttling) {
            if (typeof data.throttling !== 'object')
                throw new TypeError("Command throttling must be an object");
            if (typeof data.throttling.usages !== 'number' || isNaN(data.throttling.usages)) {
                throw new TypeError('Command throttling usages must be a number.');
            }
            if (data.throttling.usages < 1)
                throw new RangeError('Command throttling usages must be at least 1.');
            if (typeof data.throttling.duration !== 'number' || isNaN(data.throttling.duration)) {
                throw new TypeError('Command throttling duration must be a number.');
            }
            if (data.throttling.duration < 1)
                throw new RangeError('Command throttling duration must be at least 1.');
        }
        this.validateOptions(data.options);
    }
    validateOptions(options) {
        // if(typeof data.name !== 'string') throw new TypeError('Command name must be a string.');
        // if(data.name !== data.name.toLowerCase()) throw new RangeError('Command name must be lower case');
        // if(!/^[\w-]{1,32}$/.test(data.name)) throw new RangeError(`Command name '${data.name}' does not match the regex /^[\w-]{1,32}$/`);
        // if(typeof data.description !== 'string') throw new TypeError('Command description must be a string.');
        // if(data.description.length < 1) throw new RangeError('Command description length must be greater than 0');
        // if(data.description.length > 100) throw new RangeError('Command description length must be less than or equal to 100')
        // if('defaultPermission' in data && typeof data.defaultPermission !== 'boolean') throw new TypeError('Command default permission must be a boolean');
        if (options) {
            if (!Array.isArray(options))
                throw new TypeError('Command options must be an array');
            if (options.length > 25)
                throw new RangeError('Options length must be 25 or less');
            for (const option of options) {
                this.validateSubcommand(option);
            }
        }
    }
    validateSubcommand(data) {
        if (!discord_js_1.ApplicationCommandOptionType[data.type])
            throw new TypeError(`Subcommand type '${data.type}' is invalid`);
        if (data.name !== data.name.toLowerCase())
            throw new RangeError('Subcommand name must be lower case');
        if (!/^[\w-]{1,32}$/.test(data.name))
            throw new Error(`Subcommand name '${data.name}' does not match the regex /^[\w-]{1,32}$/`);
        if (typeof data.description !== 'string')
            throw new TypeError('Subcommand description must be a string.');
        if ('required' in data && typeof data.required !== 'boolean')
            throw new TypeError('Subcommand "required" property must be a boolean');
        if ('choices' in data) {
            if (!Array.isArray(data.choices))
                throw new TypeError('Subcommand choices must be an array');
            // if(data.type !== 'SUB_COMMAND_GROUP' && data.type !== '2') throw new Error('Subcommand group cannot have the "choices" property');
            if (data.choices.length > 25)
                throw new RangeError('Subcommand choices must be 25 or less');
            for (const choice of data.choices) {
                this.validateChoice(choice);
            }
        }
        if ('options' in data) {
            if (!Array.isArray(data.options))
                throw new TypeError('Subcommand options must be an array');
            if (data.type !== discord_js_1.ApplicationCommandOptionType.Subcommand)
                throw new Error('Subcommand cannot have the "options" property');
            if (data.options.length > 25)
                throw new RangeError('Options length must be 25 or less');
            for (const option of data.options) {
                this.validateSubcommand(option);
            }
        }
        if ('channelTypes' in data) {
            if (!Array.isArray(data.channelTypes))
                throw new TypeError("Command.channelTypes must be an array");
            for (const type of data.channelTypes) {
                if (!discord_js_1.ChannelType[type])
                    throw new RangeError(`Channel type ${type} is not a valid Channel type`);
            }
        }
        if ('minValue' in data) {
            if (data.type === discord_js_1.ApplicationCommandOptionType.Number && typeof data.minValue !== 'number')
                throw new TypeError("Command option minValue must be a Number");
            if (data.type === discord_js_1.ApplicationCommandOptionType.Integer && !Number.isInteger(data.minValue))
                throw new TypeError("Command option minValue must be an Integer");
            if (data.minValue < -valLimit)
                throw new RangeError(`Command option minValue should be greater than ${-valLimit}`);
        }
        if ('maxValue' in data) {
            if (data.type === discord_js_1.ApplicationCommandOptionType.Number && typeof data.maxValue !== 'number')
                throw new TypeError("Command option maxValue must be a Number");
            if (data.type === discord_js_1.ApplicationCommandOptionType.Integer && !Number.isInteger(data.maxValue))
                throw new TypeError("Command option maxValue must be an Integer");
            if (data.maxValue > valLimit)
                throw new RangeError(`Command option maxValue should be less than ${valLimit}`);
        }
        if ('minLength' in data) {
            if (data.type !== discord_js_1.ApplicationCommandOptionType.String)
                throw new Error("Command option minLength only allowed for option type String");
            if (!Number.isInteger(data.minLength))
                throw new TypeError("Command option minLength must be an integer");
            if (data.minLength < 0)
                throw new RangeError("Command option minLength must be greater than or equal to 0");
            if (data.minLength > 6000)
                throw new RangeError("Command option minLength must be lesss than or equal to 6000");
        }
        if ('maxLength' in data) {
            if (data.type !== discord_js_1.ApplicationCommandOptionType.String)
                throw new Error("Command option maxLength only allowed for option type String");
            if (!Number.isInteger(data.maxLength))
                throw new TypeError("Command option maxLength must be an integer");
            if (data.maxLength < 1)
                throw new RangeError("Command option maxLength must be greater than or equal to 1");
            if (data.maxLength > 6000)
                throw new RangeError("Command option maxLength must be lesss than or equal to 6000");
        }
    }
    validateChoice(data) {
        if (typeof data.name !== 'string')
            throw new TypeError("Command choice name must be a string");
        if (typeof data.value !== 'number' && typeof data.value !== 'string')
            throw new TypeError("Command choice value must be a number or a string");
    }
}
exports.default = Command;
