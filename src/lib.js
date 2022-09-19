const crypto = require('crypto');

const newId = () => crypto.randomBytes(16).toString('hex');

module.exports = {
	newId,
};
