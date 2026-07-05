import { useEffect, useCallback } from 'react';
import { connectSocket, disconnectSocket, getSocket } from '../services/socket';
import useRoomStore from '../store/roomStore';

const useSocket = (roomId) => {
  const {
    setRoom, setJoined, setUserColor, setActiveUsers,
    addUser, removeUser, addChatMessage,
    setExecutionStatus, setExecutionResult,
    username, reset,
  } = useRoomStore();

  useEffect(() => {
    if (!roomId || !username) return;

    const socket = connectSocket();

    // Connection events
    socket.on('connect', () => {
      console.log('🔌 Connected to server');
    });

    // Room events
    socket.on('room:joined', ({ room, color }) => {
      setRoom(room);
      setJoined(true);
      setUserColor(color);
      setActiveUsers(room.activeUsers || []);
      if (room.chat) {
        useRoomStore.getState().setChatMessages(room.chat);
      }
    });

    socket.on('room:user-joined', (user) => {
      addUser(user);
    });

    socket.on('room:user-left', ({ socketId }) => {
      removeUser(socketId);
    });

    socket.on('room:error', ({ message }) => {
      console.error('Room error:', message);
    });

    // Chat events
    socket.on('chat:message', (message) => {
      addChatMessage(message);
    });

    // Execution events
    socket.on('code:status', ({ status }) => {
      setExecutionStatus(status);
    });

    socket.on('code:result', (result) => {
      setExecutionResult(result);
    });

    socket.on('code:error', ({ message }) => {
      setExecutionResult({
        status: 'error',
        stderr: message,
        stdout: '',
        exitCode: 1,
      });
    });

    return () => {
      socket.off('connect');
      socket.off('room:joined');
      socket.off('room:user-joined');
      socket.off('room:user-left');
      socket.off('room:error');
      socket.off('chat:message');
      socket.off('code:status');
      socket.off('code:result');
      socket.off('code:error');
    };
  }, [roomId, username]);

  // Join room
  const joinRoom = useCallback((inviteCode) => {
    const socket = getSocket();
    if (socket.connected) {
      socket.emit('room:join', { inviteCode, username });
    }
  }, [username]);

  // Leave room
  const leaveRoom = useCallback(() => {
    const socket = getSocket();
    socket.emit('room:leave');
    reset();
    disconnectSocket();
  }, [reset]);

  // Send chat message
  const sendMessage = useCallback((message) => {
    const socket = getSocket();
    socket.emit('chat:message', { message });
  }, []);

  // Run code
  const runCode = useCallback((language, code, stdin = '') => {
    const socket = getSocket();
    useRoomStore.getState().clearExecution();
    socket.emit('code:run', { language, code, stdin });
  }, []);

  // Run tests
  const runTests = useCallback((language, code, testCases) => {
    const socket = getSocket();
    useRoomStore.getState().clearExecution();
    socket.emit('code:run-tests', { language, code, testCases });
  }, []);

  return {
    joinRoom,
    leaveRoom,
    sendMessage,
    runCode,
    runTests,
  };
};

export default useSocket;
