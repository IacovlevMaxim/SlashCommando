const InteractionResponses = require('../../node_modules/discord.js/src/structures/interfaces/InteractionResponses.js');
const { Interaction, InteractionWebhook } = require('discord.js');

class InteractionCall extends Interaction {
    constructor(client, options) {
        super(client, {
            // data: {
                ...options,
                token: options.token,
                channel_id: options.channelId,
                guild_id: options.guildId,
                application_id: options.applicationId
            // }
        });
        this.commandType = 'interaction';
        this.commandName = options.commandName;
        this.webhook = new InteractionWebhook(this.client, this.applicationId, this.token);
    }

    parseArgs(interaction) {
		const args = Object.assign({}, ...interaction.options?._hoistedOptions.map(o => {
			let res = {};
			res[o.name] = o.value;
			return res;
		}));
		return args;
	}

    deferReply() {}
    reply() {}
    fetchReply() {}
    editReply() {}
    deleteReply() {}
    followUp() {}
}

InteractionResponses.applyToClass(InteractionCall, ['deferUpdate', 'update']);

module.exports = InteractionCall;