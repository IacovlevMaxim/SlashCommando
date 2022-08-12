const { PermissionFlagsBits } = require('discord.js');
const permissions = {}

for(const [ name, int ] of Object.entries(PermissionFlagsBits)) {
	const splitName = name.trim()
		.split(/(?=[A-Z])/)
		.map(n => n.trim())
		.join(' ');
	let obj = {};
	obj[int] = splitName
	Object.assign(permissions, obj);
}

module.exports = {
    permissions
}