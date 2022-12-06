import BaseHandler from './BaseHandler';
import ContextMenu from './ContextMenu';
import { ContextMenuCommandInteraction } from 'discord.js';
import CommandClient from './Client';
declare class ContextMenuHandler extends BaseHandler<ContextMenu, ContextMenuCommandInteraction> {
    contextMenus: ContextMenu[];
    constructor(client: CommandClient);
    recognize(interaction: ContextMenuCommandInteraction): ContextMenu | undefined;
    parseArgs(interaction: ContextMenuCommandInteraction, component?: ContextMenu | undefined): never[];
    registerContextMenusIn(options: string): Promise<{
        name: string;
        name_localizations?: Partial<Record<"en-US" | "en-GB" | "bg" | "zh-CN" | "zh-TW" | "hr" | "cs" | "da" | "nl" | "fi" | "fr" | "de" | "el" | "hi" | "hu" | "it" | "ja" | "ko" | "lt" | "no" | "pl" | "pt-BR" | "ro" | "ru" | "es-ES" | "sv-SE" | "th" | "tr" | "uk" | "vi", string | null>> | undefined;
        type: import("discord.js").ContextMenuCommandType;
        default_permission: boolean | undefined;
        default_member_permissions: string | null | undefined;
        dm_permission: boolean | undefined;
    }[]>;
    registerContextMenus(contextMenus: any[]): Promise<{
        name: string;
        name_localizations?: Partial<Record<"en-US" | "en-GB" | "bg" | "zh-CN" | "zh-TW" | "hr" | "cs" | "da" | "nl" | "fi" | "fr" | "de" | "el" | "hi" | "hu" | "it" | "ja" | "ko" | "lt" | "no" | "pl" | "pt-BR" | "ro" | "ru" | "es-ES" | "sv-SE" | "th" | "tr" | "uk" | "vi", string | null>> | undefined;
        type: import("discord.js").ContextMenuCommandType;
        default_permission: boolean | undefined;
        default_member_permissions: string | null | undefined;
        dm_permission: boolean | undefined;
    }[]>;
    init(contextMenus: any[]): ContextMenu[];
    static transformContextMenu(contextMenu: ContextMenu): {
        name: string;
        name_localizations?: Partial<Record<"en-US" | "en-GB" | "bg" | "zh-CN" | "zh-TW" | "hr" | "cs" | "da" | "nl" | "fi" | "fr" | "de" | "el" | "hi" | "hu" | "it" | "ja" | "ko" | "lt" | "no" | "pl" | "pt-BR" | "ro" | "ru" | "es-ES" | "sv-SE" | "th" | "tr" | "uk" | "vi", string | null>> | undefined;
        type: import("discord.js").ContextMenuCommandType;
        default_permission: boolean | undefined;
        default_member_permissions: string | null | undefined;
        dm_permission: boolean | undefined;
    };
}
export default ContextMenuHandler;
