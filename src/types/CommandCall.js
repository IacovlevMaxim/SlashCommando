class CommandCall {
    constructor(data) {
        Object.defineProperty(this, 'client', { value: data.client });
        if(data.commandId) {
            this.commandType = 'interaction';
            this.commandName = data.commandName;
        } else {
            this.commandType = 'message';
            this.commandName = data.content.split(' ').shift().split(this.client.prefix)[1].toLowerCase();
            this.user = data.author;
        }
    }
}

module.exports = CommandCall;