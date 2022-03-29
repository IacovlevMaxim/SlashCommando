class CommandCall {
    constructor(data) {
        Object.defineProperty(this, 'client', { value: data.client });
        this.commandName = data.commandName;
    }
}

module.exports = CommandCall;