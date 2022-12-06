import BaseHandler from "./types/BaseHandler";
import Button from "./types/Button";
import ButtonHandler from "./types/ButtonHandler";
import Command from "./types/Command";
import CommandHandler from "./types/CommandHandler";
import ContextMenu from "./types/ContextMenu";
import ContextMenuHandler from "./types/ContextMenuHandler";
import { permissions } from "./util"; 
import Client from "./types/Client";

export {
    BaseHandler, 
    Button,
    ButtonHandler,
    Client,
    Command,
    CommandHandler,
    ContextMenu,
    ContextMenuHandler,
    permissions
}

// module.exports = {
//     BaseHandler: require('./types/BaseHandler'),
//     Button: require('./types/Button'),
//     ButtonHandler: require('./types/ButtonHandler'),
//     Client: require('./types/Client'),
//     Command: require('./types/Command'),
//     CommandHandler: require('./types/CommandHandler'),
//     ContextMenu: require('./types/ContextMenu'),
//     ContextMenuHandler: require('./types/ContextMenuHandler'),
//     permissions: require('./util').permissions
// }