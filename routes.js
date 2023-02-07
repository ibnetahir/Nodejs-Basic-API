const user = require('./routes/auth');
const note = require('./routes/notes');

const mymodule = {user, note}

module.exports = mymodule;