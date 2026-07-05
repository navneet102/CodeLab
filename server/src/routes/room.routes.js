const express = require('express');
const router = express.Router();
const { createRoom, getRoomByCode, listRooms } = require('../controllers/room.controller');

router.post('/', createRoom);
router.get('/', listRooms);
router.get('/:inviteCode', getRoomByCode);

module.exports = router;
