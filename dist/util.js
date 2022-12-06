"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.permissions = void 0;
const discord_js_1 = require("discord.js");
const permissions = {};
exports.permissions = permissions;
for (const [name, int] of Object.entries(discord_js_1.PermissionFlagsBits)) {
    const splitName = name.trim()
        .split(/(?=[A-Z])/)
        .map(n => n.trim())
        .join(' ');
    let obj = {};
    const index = `${int}`;
    obj[index] = splitName;
    Object.assign(permissions, obj);
}
