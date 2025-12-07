const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { getSSHDir, getSSHKeyPath, getSSHConfigPath } = require('./paths');

/**
 * Ensure ~/.ssh directory exists with proper permissions
 */
function ensureSSHDir() {
    const sshDir = getSSHDir();
    if (!fs.existsSync(sshDir)) {
        fs.mkdirSync(sshDir, { mode: 0o700 });
    }
}

/**
 * Generate an SSH key for a profile
 * @param {Object} profile - Profile data
 * @returns {Promise<void>}
 */
function generateSSHKey(profile) {
    return new Promise((resolve, reject) => {
        ensureSSHDir();

        const keyPath = getSSHKeyPath(profile.identifier);

        // Check if key already exists
        if (fs.existsSync(keyPath)) {
            console.log(`  SSH key already exists for ${profile.identifier}, skipping generation`);
            resolve();
            return;
        }

        const args = [
            '-t', 'ed25519',
            '-C', profile.email,
            '-f', keyPath,
            '-N', '' // Empty passphrase
        ];

        const sshKeygen = spawn('ssh-keygen', args, { stdio: 'inherit' });

        sshKeygen.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`ssh-keygen exited with code ${code}`));
            }
        });

        sshKeygen.on('error', (err) => {
            reject(new Error(`Failed to spawn ssh-keygen: ${err.message}`));
        });
    });
}

/**
 * Generate SSH config block for a profile
 * @param {Object} profile - Profile data
 * @returns {string} SSH config block
 */
function generateSSHConfigBlock(profile) {
    return `
# ${profile.identifier} GitHub account
Host github.com-${profile.identifier}
    HostName github.com
    User git
    IdentityFile ~/.ssh/${profile.identifier}
    IdentitiesOnly yes
`;
}

/**
 * Append SSH config entries for all profiles
 * @param {Array<Object>} profiles - Array of profile data
 */
function appendSSHConfig(profiles) {
    ensureSSHDir();

    const configPath = getSSHConfigPath();
    let existingContent = '';

    // Read existing content if file exists
    if (fs.existsSync(configPath)) {
        existingContent = fs.readFileSync(configPath, 'utf8');
    }

    // Generate new config blocks
    const newBlocks = profiles.map(profile => generateSSHConfigBlock(profile)).join('');

    // Append separator and new blocks
    const separator = existingContent.length > 0 ? '\n' : '';
    const newContent = existingContent + separator + newBlocks;

    fs.writeFileSync(configPath, newContent, { mode: 0o600 });
}

/**
 * Get the public key content for a profile
 * @param {string} identifier - Profile identifier
 * @returns {string|null} Public key content or null if not found
 */
function getPublicKey(identifier) {
    const pubKeyPath = getSSHKeyPath(identifier) + '.pub';
    if (fs.existsSync(pubKeyPath)) {
        return fs.readFileSync(pubKeyPath, 'utf8').trim();
    }
    return null;
}

module.exports = {
    ensureSSHDir,
    generateSSHKey,
    generateSSHConfigBlock,
    appendSSHConfig,
    getPublicKey
};
