"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.permissions = exports.ContextMenuHandler = exports.ContextMenu = exports.CommandHandler = exports.Command = exports.Client = exports.ButtonHandler = exports.Button = exports.BaseHandler = void 0;
const BaseHandler_1 = require("./types/BaseHandler");
exports.BaseHandler = BaseHandler_1.default;
const Button_1 = require("./types/Button");
exports.Button = Button_1.default;
const ButtonHandler_1 = require("./types/ButtonHandler");
exports.ButtonHandler = ButtonHandler_1.default;
const Command_1 = require("./types/Command");
exports.Command = Command_1.default;
const CommandHandler_1 = require("./types/CommandHandler");
exports.CommandHandler = CommandHandler_1.default;
const ContextMenu_1 = require("./types/ContextMenu");
exports.ContextMenu = ContextMenu_1.default;
const ContextMenuHandler_1 = require("./types/ContextMenuHandler");
exports.ContextMenuHandler = ContextMenuHandler_1.default;
const util_1 = require("./util");
Object.defineProperty(exports, "permissions", { enumerable: true, get: function () { return util_1.permissions; } });
const Client_1 = require("./types/Client");
exports.Client = Client_1.default;
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
