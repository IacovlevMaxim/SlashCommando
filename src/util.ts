import { PermissionFlagsBits } from 'discord.js';

type Permissions = {
	[int: string] : string
}

const permissions: Permissions = {};

for(const [ name, int ] of Object.entries(PermissionFlagsBits)) {
	const splitName = name.trim()
		.split(/(?=[A-Z])/)
		.map(n => n.trim())
		.join(' ');
	let obj: Permissions = {};
	const index = `${int}`;
	obj[index] = splitName
	Object.assign(permissions, obj);
}

export {
    permissions
}