const express = require('express');
const router = express.Router();
const { getExecutionHistory } = require('../controllers/execution.controller');

router.get('/:roomId', getExecutionHistory);

module.exports = router;
