const fs = require('fs');
const { getGitConfigPath, getProfileGitConfigPath, expandTilde, ensureTrailingSlash } = require('./paths');

/**
 * Generate includeIf block for a profile
 * @param {Object} profile - Profile data
 * @returns {string} includeIf block
 */
function generateIncludeIfBlock(profile) {
    const dirPath = ensureTrailingSlash(profile.directoryPath);
    return `[includeIf "gitdir:${dirPath}"]
    path = ~/.gitconfig-${profile.identifier}
`;
}

/**
 * Generate all includeIf blocks for profiles
 * @param {Array<Object>} profiles - Array of profile data
 * @returns {string} Combined includeIf blocks
 */
function generateAllIncludeIfBlocks(profiles) {
    return profiles.map(profile => generateIncludeIfBlock(profile)).join('\n');
}

/**
 * Check if main gitconfig exists
 * @returns {boolean} True if ~/.gitconfig exists
 */
function gitconfigExists() {
    return fs.existsSync(getGitConfigPath());
}

/**
 * Append includeIf blocks to main gitconfig
 * @param {Array<Object>} profiles - Array of profile data
 */
function appendToMainGitconfig(profiles) {
    const gitconfigPath = getGitConfigPath();
    const includeBlocks = generateAllIncludeIfBlocks(profiles);

    let existingContent = '';

    if (gitconfigExists()) {
        existingContent = fs.readFileSync(gitconfigPath, 'utf8');
    }

    // Add separator if file has content
    const separator = existingContent.length > 0 && !existingContent.endsWith('\n') ? '\n\n' : '\n';
    const newContent = existingContent + separator + includeBlocks;

    fs.writeFileSync(gitconfigPath, newContent);
}

/**
 * Generate profile-specific gitconfig content
 * @param {Object} profile - Profile data
 * @returns {string} Gitconfig content
 */
function generateProfileGitconfigContent(profile) {
    return `[user]
    name = ${profile.fullName}
    email = ${profile.email}

[init]
    defaultBranch = ${profile.defaultBranch}
`;
}

/**
 * Create profile-specific gitconfig file
 * @param {Object} profile - Profile data
 */
function createProfileGitconfig(profile) {
    const configPath = getProfileGitConfigPath(profile.identifier);
    const content = generateProfileGitconfigContent(profile);
    fs.writeFileSync(configPath, content);
}

/**
 * Create all profile gitconfig files
 * @param {Array<Object>} profiles - Array of profile data
 */
function createAllProfileGitconfigs(profiles) {
    profiles.forEach(profile => createProfileGitconfig(profile));
}

module.exports = {
    generateIncludeIfBlock,
    generateAllIncludeIfBlocks,
    gitconfigExists,
    appendToMainGitconfig,
    generateProfileGitconfigContent,
    createProfileGitconfig,
    createAllProfileGitconfigs
};
