const inquirer = require('inquirer');
const { expandTilde } = require('./paths');
const fs = require('fs');

/**
 * Prompt user for a single profile's information
 * @returns {Promise<Object>} Profile data
 */
async function promptProfileInfo() {
    const answers = await inquirer.prompt([
        {
            type: 'input',
            name: 'identifier',
            message: 'Display Identifier:',
            validate: (input) => {
                if (!input.trim()) {
                    return 'Display Identifier is required';
                }
                if (!/^[a-zA-Z0-9_-]+$/.test(input)) {
                    return 'Identifier can only contain letters, numbers, underscores, and hyphens';
                }
                return true;
            },
            filter: (input) => input.trim().toLowerCase()
        },
        {
            type: 'input',
            name: 'fullName',
            message: 'Full Name:',
            validate: (input) => input.trim() ? true : 'Full Name is required'
        },
        {
            type: 'input',
            name: 'email',
            message: 'Email:',
            validate: (input) => {
                if (!input.trim()) {
                    return 'Email is required';
                }
                // Basic email validation
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input)) {
                    return 'Please enter a valid email address';
                }
                return true;
            }
        },
        {
            type: 'input',
            name: 'directoryPath',
            message: 'Full Directory Path:',
            validate: (input) => {
                if (!input.trim()) {
                    return 'Directory Path is required';
                }
                const expanded = expandTilde(input.trim());
                if (!fs.existsSync(expanded)) {
                    return `Directory does not exist: ${expanded}`;
                }
                return true;
            }
        },
        {
            type: 'input',
            name: 'defaultBranch',
            message: 'Default Branch:',
            default: 'main',
            validate: (input) => input.trim() ? true : 'Default Branch is required'
        }
    ]);

    return answers;
}

/**
 * Ask user if they want to add another profile
 * @returns {Promise<boolean>} True if user wants to add more
 */
async function promptAddMore() {
    const { addMore } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'addMore',
            message: 'Do you want to add another profile?',
            default: false
        }
    ]);

    return addMore;
}

/**
 * Confirm before proceeding with setup
 * @param {number} profileCount - Number of profiles to set up
 * @returns {Promise<boolean>} True if user confirms
 */
async function confirmSetup(profileCount) {
    const { confirm } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'confirm',
            message: `Ready to set up ${profileCount} profile(s). This will generate SSH keys and update Git configs. Continue?`,
            default: true
        }
    ]);

    return confirm;
}

module.exports = {
    promptProfileInfo,
    promptAddMore,
    confirmSetup
};
