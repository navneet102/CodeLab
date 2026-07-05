import { create } from 'zustand';

const useRoomStore = create((set, get) => ({
  // Room data
  room: null,
  isJoined: false,
  username: localStorage.getItem('codesync-username') || '',
  userColor: '#6C3FE2',

  // Active users in the room
  activeUsers: [],

  // Chat messages
  chatMessages: [],

  // Execution state
  executionStatus: null, // null | 'queued' | 'running' | 'completed' | 'error'
  executionResult: null,
  testResults: [],

  // Actions
  setRoom: (room) => set({ room }),
  setJoined: (isJoined) => set({ isJoined }),

  setUsername: (username) => {
    localStorage.setItem('codesync-username', username);
    set({ username });
  },

  setUserColor: (color) => set({ userColor: color }),

  setActiveUsers: (users) => set({ activeUsers: users }),

  addUser: (user) => set((state) => ({
    activeUsers: [...state.activeUsers.filter(u => u.socketId !== user.socketId), user],
  })),

  removeUser: (socketId) => set((state) => ({
    activeUsers: state.activeUsers.filter(u => u.socketId !== socketId),
  })),

  addChatMessage: (message) => set((state) => ({
    chatMessages: [...state.chatMessages, message],
  })),

  setChatMessages: (messages) => set({ chatMessages: messages }),

  setExecutionStatus: (status) => set({ executionStatus: status }),

  setExecutionResult: (result) => set({
    executionResult: result,
    executionStatus: result.status,
    testResults: result.testResults || [],
  }),

  clearExecution: () => set({
    executionStatus: null,
    executionResult: null,
    testResults: [],
  }),

  // Reset everything when leaving a room
  reset: () => set({
    room: null,
    isJoined: false,
    activeUsers: [],
    chatMessages: [],
    executionStatus: null,
    executionResult: null,
    testResults: [],
  }),
}));

export default useRoomStore;
