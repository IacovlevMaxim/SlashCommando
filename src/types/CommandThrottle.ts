type CommandThrottle = {
    start: number,
    usages: number,
    timeout: NodeJS.Timeout
}

export default CommandThrottle;