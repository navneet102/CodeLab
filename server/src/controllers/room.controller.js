const Room = require('../models/Room');

// Create a new room
exports.createRoom = async (req, res, next) => {
  try {
    const { title, description, language, mode, starterCode, testCases, owner } = req.body;

    if (!title || !owner) {
      return res.status(400).json({ error: 'Title and owner are required' });
    }

    // Generate a unique invite code
    let inviteCode;
    let isUnique = false;
    while (!isUnique) {
      inviteCode = Room.generateInviteCode();
      const existing = await Room.findOne({ inviteCode });
      if (!existing) isUnique = true;
    }

    console.log("Ran till ch1")
    const room = await Room.create({
      title,
      description: description || '',
      inviteCode,
      language: language || 'python',
      mode: mode || 'collaborate',
      starterCode: starterCode || '',
      testCases: testCases || [],
      owner,
      participants: [owner],
    });

    console.log("Ran till ch2")

    res.status(201).json({
      success: true,
      room: {
        _id: room._id,
        title: room.title,
        description: room.description,
        inviteCode: room.inviteCode,
        language: room.language,
        mode: room.mode,
        starterCode: room.starterCode,
        testCases: room.testCases,
        owner: room.owner,
        isActive: room.isActive,
        createdAt: room.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get room by invite code
exports.getRoomByCode = async (req, res, next) => {
  try {
    const { inviteCode } = req.params;
    const room = await Room.findOne({ inviteCode: inviteCode.toUpperCase() });

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    res.json({ success: true, room });
  } catch (error) {
    next(error);
  }
};

// List active rooms and recent sessions
exports.listRooms = async (req, res, next) => {
  try {
    const activeRooms = await Room.find({ isActive: true })
      .select('title inviteCode language mode owner activeUsers description participants createdAt')
      .sort({ createdAt: -1 })
      .limit(50);

    const recentSessions = await Room.find({ isActive: false })
      .select('title inviteCode language mode owner activeUsers description participants createdAt closedAt updatedAt')
      .sort({ updatedAt: -1 })
      .limit(10);

    res.json({
      success: true,
      activeRooms,
      recentSessions,
    });
  } catch (error) {
    next(error);
  }
};
