import { Client } from "discord.js";
import CommandHandler from './CommandHandler';
import ButtonHandler from './ButtonHandler';
import ContextMenuHandler from './ContextMenuHandler';
declare class CommandClient extends Client {
    commandHandler: CommandHandler;
    contextMenusHandler: ContextMenuHandler;
    buttonHandler: ButtonHandler;
    prefix: string;
    commandoOptions: unknown;
    constructor(options: any);
    registerCommandsIn(options: string): Promise<{
        ownerOnly?: boolean | undefined;
        clientPermissions?: bigint[] | undefined;
        userPermissions?: bigint[] | undefined;
        throttling?: import("./BaseCommandThrottle.type").default | undefined;
        _options?: import("discord.js").ApplicationCommandOption[] | undefined;
        client: CommandClient;
        name: string;
        name_localizations?: Partial<Record<"en-US" | "en-GB" | "bg" | "zh-CN" | "zh-TW" | "hr" | "cs" | "da" | "nl" | "fi" | "fr" | "de" | "el" | "hi" | "hu" | "it" | "ja" | "ko" | "lt" | "no" | "pl" | "pt-BR" | "ro" | "ru" | "es-ES" | "sv-SE" | "th" | "tr" | "uk" | "vi", string | null>> | undefined;
        description: string;
        description_localizations?: Partial<Record<"en-US" | "en-GB" | "bg" | "zh-CN" | "zh-TW" | "hr" | "cs" | "da" | "nl" | "fi" | "fr" | "de" | "el" | "hi" | "hu" | "it" | "ja" | "ko" | "lt" | "no" | "pl" | "pt-BR" | "ro" | "ru" | "es-ES" | "sv-SE" | "th" | "tr" | "uk" | "vi", string | null>> | undefined;
        options: import("discord.js").ToAPIApplicationCommandOptions[];
        default_permission: boolean | undefined;
        default_member_permissions: string | null | undefined;
        dm_permission: boolean | undefined;
    }[]>;
    registerContextMenusIn(options: string): Promise<{
        name: string;
        name_localizations?: Partial<Record<"en-US" | "en-GB" | "bg" | "zh-CN" | "zh-TW" | "hr" | "cs" | "da" | "nl" | "fi" | "fr" | "de" | "el" | "hi" | "hu" | "it" | "ja" | "ko" | "lt" | "no" | "pl" | "pt-BR" | "ro" | "ru" | "es-ES" | "sv-SE" | "th" | "tr" | "uk" | "vi", string | null>> | undefined;
        type: import("discord.js").ContextMenuCommandType;
        default_permission: boolean | undefined;
        default_member_permissions: string | null | undefined;
        dm_permission: boolean | undefined;
    }[]>;
    registerButtonsIn(options: string): Promise<import("./Button").default[]>;
    validateInfo(options: {
        prefix: string;
    }): void;
}
export default CommandClient;
