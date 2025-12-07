#!/usr/bin/env node

const { program } = require('commander');
const { setupCommand } = require('../src/commands/setup');
const pkg = require('../package.json');

program
    .name('gitssh')
    .description('A CLI tool for managing Git configurations and SSH keys across multiple project directories')
    .version(pkg.version);

program
    .command('setup')
    .description('Set up Git configurations and SSH keys for multiple profiles')
    .action(setupCommand);

program.parse(process.argv);
