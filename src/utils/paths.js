const os = require('os');
const path = require('path');

/**
 * Get the user's home directory (cross-platform)
 * @returns {string} The home directory path
 */
function getHomeDir() {
    return os.homedir();
}

/**
 * Expand tilde (~) in a path to the full home directory
 * @param {string} inputPath - Path that may contain ~
 * @returns {string} Path with ~ expanded
 */
function expandTilde(inputPath) {
    if (!inputPath) return inputPath;

    if (inputPath.startsWith('~/') || inputPath === '~') {
        return path.join(getHomeDir(), inputPath.slice(1));
    }

    return inputPath;
}

/**
 * Normalize a path for the current OS
 * @param {string} inputPath - Path to normalize
 * @returns {string} Normalized path
 */
function normalizePath(inputPath) {
    return path.normalize(expandTilde(inputPath));
}

/**
 * Get the path to ~/.ssh directory
 * @returns {string} Path to .ssh directory
 */
function getSSHDir() {
    return path.join(getHomeDir(), '.ssh');
}

/**
 * Get the path to ~/.gitconfig
 * @returns {string} Path to .gitconfig
 */
function getGitConfigPath() {
    return path.join(getHomeDir(), '.gitconfig');
}

/**
 * Get the path to a profile-specific gitconfig
 * @param {string} identifier - Profile identifier
 * @returns {string} Path to profile gitconfig
 */
function getProfileGitConfigPath(identifier) {
    return path.join(getHomeDir(), `.gitconfig-${identifier}`);
}

/**
 * Get the path to SSH config file
 * @returns {string} Path to ~/.ssh/config
 */
function getSSHConfigPath() {
    return path.join(getSSHDir(), 'config');
}

/**
 * Get the path to an SSH key for a profile
 * @param {string} identifier - Profile identifier
 * @returns {string} Path to SSH private key
 */
function getSSHKeyPath(identifier) {
    return path.join(getSSHDir(), identifier);
}

/**
 * Ensure path ends with a trailing slash (for gitdir matching)
 * @param {string} dirPath - Directory path
 * @returns {string} Path with trailing slash
 */
function ensureTrailingSlash(dirPath) {
    if (!dirPath.endsWith('/') && !dirPath.endsWith(path.sep)) {
        return dirPath + '/';
    }
    return dirPath;
}

module.exports = {
    getHomeDir,
    expandTilde,
    normalizePath,
    getSSHDir,
    getGitConfigPath,
    getProfileGitConfigPath,
    getSSHConfigPath,
    getSSHKeyPath,
    ensureTrailingSlash
};
