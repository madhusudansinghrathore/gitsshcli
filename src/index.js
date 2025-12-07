/**
 * Git SSH CLI Tool
 * A cross-platform CLI for managing Git configurations and SSH keys
 */

module.exports = {
    setupCommand: require('./commands/setup').setupCommand,
    utils: {
        paths: require('./utils/paths'),
        prompts: require('./utils/prompts'),
        gitconfig: require('./utils/gitconfig'),
        sshconfig: require('./utils/sshconfig'),
        storage: require('./utils/storage')
    }
};
