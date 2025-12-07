const chalk = require('chalk');
const { promptProfileInfo, promptAddMore, confirmSetup } = require('../utils/prompts');
const { generateSSHKey, appendSSHConfig, getPublicKey } = require('../utils/sshconfig');
const { appendToMainGitconfig, createAllProfileGitconfigs } = require('../utils/gitconfig');
const { saveProfilesToTemp, deleteTempFile } = require('../utils/storage');
const { getSSHKeyPath } = require('../utils/paths');

/**
 * Main setup command handler
 */
async function setupCommand() {
    console.log(chalk.cyan.bold('\n🔧 Git SSH CLI Setup\n'));
    console.log(chalk.gray('This wizard will help you set up Git configurations and SSH keys for multiple profiles.\n'));

    const profiles = [];

    // Collect profiles
    try {
        let addMore = true;

        while (addMore) {
            console.log(chalk.yellow(`\n📝 Profile ${profiles.length + 1}\n`));

            const profile = await promptProfileInfo();
            profiles.push(profile);

            console.log(chalk.green(`✓ Added profile: ${profile.identifier}`));

            addMore = await promptAddMore();
        }

        if (profiles.length === 0) {
            console.log(chalk.yellow('\nNo profiles added. Exiting setup.\n'));
            return;
        }

        // Save to temp storage
        saveProfilesToTemp(profiles);

        // Confirm before proceeding
        console.log(chalk.cyan('\n📋 Profiles to set up:\n'));
        profiles.forEach((profile, index) => {
            console.log(chalk.white(`  ${index + 1}. ${profile.identifier}`));
            console.log(chalk.gray(`     Name: ${profile.fullName}`));
            console.log(chalk.gray(`     Email: ${profile.email}`));
            console.log(chalk.gray(`     Directory: ${profile.directoryPath}`));
            console.log(chalk.gray(`     Branch: ${profile.defaultBranch}`));
        });

        const confirmed = await confirmSetup(profiles.length);

        if (!confirmed) {
            deleteTempFile();
            console.log(chalk.yellow('\nSetup cancelled.\n'));
            return;
        }

        // Generate SSH keys
        console.log(chalk.cyan('\n🔑 Generating SSH keys...\n'));
        for (const profile of profiles) {
            console.log(chalk.white(`  Generating key for ${profile.identifier}...`));
            await generateSSHKey(profile);
            console.log(chalk.green(`  ✓ Generated: ~/.ssh/${profile.identifier}`));
        }

        // Update SSH config
        console.log(chalk.cyan('\n📄 Updating SSH config...\n'));
        appendSSHConfig(profiles);
        console.log(chalk.green('  ✓ Updated ~/.ssh/config'));

        // Update main gitconfig
        console.log(chalk.cyan('\n📄 Updating Git config...\n'));
        appendToMainGitconfig(profiles);
        console.log(chalk.green('  ✓ Updated ~/.gitconfig with includeIf blocks'));

        // Create profile gitconfigs
        console.log(chalk.cyan('\n📄 Creating profile Git configs...\n'));
        createAllProfileGitconfigs(profiles);
        profiles.forEach(profile => {
            console.log(chalk.green(`  ✓ Created ~/.gitconfig-${profile.identifier}`));
        });

        // Clean up temp file
        deleteTempFile();

        // Display public keys for user to add to GitHub
        console.log(chalk.cyan.bold('\n✅ Setup Complete!\n'));
        console.log(chalk.yellow('📋 Add these public keys to your GitHub accounts:\n'));

        for (const profile of profiles) {
            const publicKey = getPublicKey(profile.identifier);
            if (publicKey) {
                console.log(chalk.white.bold(`\n${profile.identifier} (${profile.email}):`));
                console.log(chalk.gray('─'.repeat(60)));
                console.log(chalk.green(publicKey));
                console.log(chalk.gray('─'.repeat(60)));
            }
        }

        console.log(chalk.cyan('\n📖 Usage Instructions:\n'));
        console.log(chalk.white('  When cloning repos, use the profile-specific host:'));
        profiles.forEach(profile => {
            console.log(chalk.gray(`    git clone git@github.com-${profile.identifier}:username/repo.git`));
        });

        console.log(chalk.white('\n  To test SSH connection:'));
        profiles.forEach(profile => {
            console.log(chalk.gray(`    ssh -T git@github.com-${profile.identifier}`));
        });

        console.log('');

    } catch (error) {
        deleteTempFile();
        console.error(chalk.red(`\n❌ Error: ${error.message}\n`));
        process.exit(1);
    }
}

module.exports = { setupCommand };
