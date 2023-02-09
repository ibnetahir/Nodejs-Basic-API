const router = require('express').Router();

const user = require('./routes/auth');
const note = require('./routes/notes');

router.use('/api', note);
router.use('/api', user);

module.exports = router;