"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const ButtonHandler_1 = require("./ButtonHandler");
const util_1 = require("../util");
const common_tags_1 = require("common-tags");
class Button extends discord_js_1.ButtonBuilder {
    constructor(client, data) {
        super(data);
        Object.defineProperty(this, "client", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: client
        });
        Object.defineProperty(this, "prefix", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "ownerOnly", {
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
        Object.defineProperty(this, "_throttles", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.validateInfo(client, data);
        this.prefix = data.prefix;
        this._options = data.options;
        this.ownerOnly = Boolean(data.ownerOnly);
        this.clientPermissions = data.clientPermissions ?? null;
        this.userPermissions = data.userPermissions ?? null;
        this.throttling = data.throttling ?? null;
        this._throttles = new Map();
    }
    //this.options.filter(o => o.required).map(o => o.name);
    //Object.keys(args)
    generate(args) {
        if (this._options && this._options?.length > 0) {
            const argNames = Object.entries(args).filter(e => e[1] !== undefined && e[1] !== null).map(e => e[0]);
            const reqArgNames = this._options.filter(o => ('required' in o && o.required)).map(o => o.name);
            if (!reqArgNames.every(a => argNames.includes(a))) {
                const diff = reqArgNames.filter(a => !argNames.includes(a));
                return `Missing required arguments: ${diff.join(', ')}`;
            }
        }
        const customId = ButtonHandler_1.default.generateCustomId(this, args);
        let button = new discord_js_1.ButtonBuilder();
        if (this.data.label)
            button.setLabel(this.data.label);
        if (this.data.emoji)
            button.setEmoji(this.data.emoji);
        if ('url' in this.data && this.data.url) {
            button.setURL(this.data.url);
        }
        else {
            button
                .setDisabled(Boolean(this.data.disabled))
                .setCustomId(customId);
            if (this.data.style)
                button.setStyle(this.data.style);
        }
        return button;
    }
    validateInfo(client, data) {
        if (!client)
            throw new Error("Client must be defined");
        if (!data)
            throw new Error("Button data must be defined");
        if (typeof data.prefix !== 'string')
            throw new TypeError("Button prefix must be string");
        if (data.prefix.length < 2)
            throw new RangeError("Button prefix length must be at least 2 characters");
        if (data.prefix.length > 18)
            throw new RangeError("Button prefix length must be less than 18 characters");
        if (data.clientPermissions) {
            if (!Array.isArray(data.clientPermissions))
                throw new TypeError("Button.clientPermissions must be an array");
            for (const perm of data.clientPermissions) {
                if (!util_1.permissions[perm])
                    throw new RangeError(`Invalid button clientPermission: ${perm}`);
            }
        }
        if (data.userPermissions) {
            if (!Array.isArray(data.userPermissions))
                throw new TypeError("Button.clientPermissions must be an array");
            for (const perm of data.userPermissions) {
                if (!util_1.permissions[perm])
                    throw new RangeError(`Invalid button clientPermission: ${perm}`);
            }
        }
        if (data.throttling) {
            if (typeof data.throttling !== 'object')
                throw new TypeError("Button throttling must be an object");
            if (typeof data.throttling.usages !== 'number' || isNaN(data.throttling.usages)) {
                throw new TypeError('Button throttling usages must be a number.');
            }
            if (data.throttling.usages < 1)
                throw new RangeError('Button throttling usages must be at least 1.');
            if (typeof data.throttling.duration !== 'number' || isNaN(data.throttling.duration)) {
                throw new TypeError('Button throttling duration must be a number.');
            }
            if (data.throttling.duration < 1)
                throw new RangeError('Button throttling duration must be at least 1.');
        }
        if (data.options)
            this.validateOptions(data.options);
    }
    validateOptions(data) {
        if (!Array.isArray(data))
            throw new TypeError("Options must be an array");
        if (data.length > 5)
            throw new RangeError("Options length must be 5 or less");
        for (const option of data) {
            if (typeof option.name !== 'string')
                throw new TypeError("Option name must be a string");
            if ('required' in option && typeof option.required !== 'boolean')
                throw new TypeError('Option "required" property must be a boolean');
        }
        const reqs = data.map(o => ('required' in o && o.required));
        if (!reqs.sort().reverse().every((o, i) => o === reqs[i]))
            throw new Error("Required options must come first");
    }
    run(interaction, args) {
        throw new Error(`Button '${this.prefix}' must have a 'run()' method`);
    }
    /**
     * Option:
     * name
     * required
     */
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
    hasPermission(interaction, ownerOverride = true) {
        if (!this.ownerOnly && !this.userPermissions)
            return true;
        const member = interaction.member;
        if (this.client.application?.owner) {
            if (ownerOverride && this.client.application.owner.id === member.id)
                return true;
            if (this.ownerOnly && (ownerOverride || this.client.application.owner.id !== member.id)) {
                return `The \`${this.prefix}\` command can only be used by the bot owner.`;
            }
        }
        if (!interaction.guildId || !this.userPermissions)
            return true;
        const channel = interaction.channel;
        const missing = channel.permissionsFor(interaction.user)?.missing(this.userPermissions);
        if (!missing || missing.length < 1)
            return true;
        if (missing.length === 1) {
            return `The \`${this.prefix}\` command requires you to have the "${util_1.permissions[missing[0]]}" permission.`;
        }
        return (0, common_tags_1.oneLine) `
            The \`${this.prefix}\` command requires you to have the following permissions:
            ${missing.map(perm => util_1.permissions[perm]).join(', ')}
        `;
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
    onBlock(interaction, reason, data) {
        switch (reason) {
            case 'permission': {
                if (data.response)
                    return interaction.reply(data.response);
                return interaction.reply({
                    content: `You do not have permission to use the \`${this.prefix}\` command.`,
                    ephemeral: true
                });
            }
            case 'clientPermissions': {
                const missing = data.missing;
                if (missing.length === 1) {
                    const missingPerm = missing[0];
                    const permission = discord_js_1.PermissionFlagsBits[missingPerm];
                    const reply = {
                        content: `I need the "${util_1.permissions[`${permission}`]}" permission for the \`${this.prefix}\` command to work.`,
                        ephemeral: true
                    };
                    return interaction.reply(reply);
                }
                const reply = {
                    content: (0, common_tags_1.oneLine) `
					I need the following permissions for the \`${this.prefix}\` command to work:
					${data.missing.map((perm) => util_1.permissions[`${discord_js_1.PermissionFlagsBits[perm]}`]).join(', ')}`,
                    ephemeral: true
                };
                return interaction.reply(reply);
            }
            case 'throttling': {
                return interaction.reply({
                    content: `You may not use the \`${this.prefix}\` command again for another ${data.remaining.toFixed(1)} seconds.`,
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
}
exports.default = Button;
