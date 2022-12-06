"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BaseHandler {
    constructor(client) {
        Object.defineProperty(this, "components", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "client", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "owner", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        if (!client.application)
            throw new Error("Client application is necessary");
        this.client = client;
        this.components = [];
    }
    //Function that is called when a interaction is received
    async onInteraction(interaction) {
        const component = this.recognize(interaction);
        if (!component)
            return;
        // const noPerms = component.hasPermission(interaction);
        // if(typeof noPerms === 'string') {
        // 	const data = { response: typeof hasPermission === 'string' ? hasPermission : undefined };
        // 	return component.onBlock(interaction, 'permission', data);
        // }
        if (interaction.guildId && interaction.channel && !('recipientId' in interaction.channel) && component.clientPermissions) {
            const missing = interaction.channel.permissionsFor(interaction.client.user).missing(component.clientPermissions, false);
            if (missing.length > 0) {
                const data = { missing };
                return component.onBlock(interaction, 'clientPermissions', data);
            }
        }
        const throttle = component.throttle(interaction.user);
        if (throttle && component.throttling && throttle.usages + 1 > component.throttling.usages) {
            const remaining = (throttle.start + (component.throttling.duration * 1000) - Date.now()) / 1000;
            const data = { throttle, remaining };
            return component.onBlock(interaction, 'throttling', data);
        }
        if (throttle)
            throttle.usages++;
        let args;
        if (component._options && component._options.length > 0) {
            try {
                args = this.parseArgs(interaction, component);
            }
            catch (err) {
                return component.onBlock(interaction, 'invalidArg', {
                    message: `${err}`
                });
            }
        }
        try {
            await component.run(interaction, args);
        }
        catch (err) {
            return component.onError(err, interaction);
        }
    }
}
exports.default = BaseHandler;
