const fs = require('fs');
const path = require('path');
const os = require('os');

const TEMP_FILE_NAME = '.gitssh-profiles-temp.json';

/**
 * Get the path to the temporary profiles file
 * @returns {string} Path to temp file
 */
function getTempFilePath() {
    return path.join(os.homedir(), TEMP_FILE_NAME);
}

/**
 * Save profiles to temporary JSON file
 * @param {Array<Object>} profiles - Array of profile data
 */
function saveProfilesToTemp(profiles) {
    const tempPath = getTempFilePath();
    fs.writeFileSync(tempPath, JSON.stringify(profiles, null, 2));
}

/**
 * Load profiles from temporary JSON file
 * @returns {Array<Object>|null} Array of profiles or null if file doesn't exist
 */
function loadProfilesFromTemp() {
    const tempPath = getTempFilePath();
    if (fs.existsSync(tempPath)) {
        const content = fs.readFileSync(tempPath, 'utf8');
        return JSON.parse(content);
    }
    return null;
}

/**
 * Delete the temporary profiles file
 */
function deleteTempFile() {
    const tempPath = getTempFilePath();
    if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
    }
}

module.exports = {
    getTempFilePath,
    saveProfilesToTemp,
    loadProfilesFromTemp,
    deleteTempFile
};
