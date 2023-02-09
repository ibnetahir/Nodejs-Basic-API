const bcrypt = require('bcryptjs');

const genSalt = bcrypt.genSalt;
const hash = bcrypt.hash;
const compare = bcrypt.compare;

module.exports = {
    genSalt,
    hash,
    compare
}