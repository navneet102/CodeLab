import { useState, useEffect, useRef, useCallback } from 'react';
import Peer from 'simple-peer';
import { getSocket } from '../services/socket';
import useRoomStore from '../store/roomStore';

const STUN_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
];

const useVoiceChat = (roomId) => {
  const { activeUsers } = useRoomStore();
  const [micEnabled, setMicEnabled] = useState(false);
  const [speakersEnabled, setSpeakersEnabled] = useState(true);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [activeSpeaker, setActiveSpeaker] = useState(null);

  const localStreamRef = useRef(null);
  const peersRef = useRef({});
  const audioContextRef = useRef(null);
  const analysersRef = useRef({});
  const animationFrameRef = useRef(null);
  const socketRef = useRef(getSocket());
  const socket = socketRef.current;

  // Initialize Web Audio API for volume detection
  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
  }, []);

  // Monitor audio levels to detect active speaker
  const monitorAudioLevels = useCallback(() => {
    if (!audioContextRef.current) return;

    let maxVolume = 0;
    let currentSpeaker = null;

    Object.entries(analysersRef.current).forEach(([socketId, analyser]) => {
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(dataArray);
      
      const average = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
      if (average > maxVolume && average > 15) { // Threshold for speaking
        maxVolume = average;
        currentSpeaker = socketId;
      }
    });

    setActiveSpeaker(currentSpeaker);
    animationFrameRef.current = requestAnimationFrame(monitorAudioLevels);
  }, []);

  useEffect(() => {
    if (Object.keys(remoteStreams).length > 0) {
      if (!animationFrameRef.current) {
        monitorAudioLevels();
      }
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
        setActiveSpeaker(null);
      }
    }
  }, [remoteStreams, monitorAudioLevels]);

  const createPeer = useCallback((targetSocketId, initiator, stream) => {
    const peer = new Peer({
      initiator,
      stream,
      config: { iceServers: STUN_SERVERS },
    });

    peersRef.current[targetSocketId] = peer;

    peer.on('signal', (signal) => {
      socket.emit('webrtc:signal', {
        to: targetSocketId,
        signal,
      });
    });

    peer.on('stream', (remoteStream) => {
      setRemoteStreams((prev) => ({ ...prev, [targetSocketId]: remoteStream }));

      // Setup audio analysis for this stream
      initAudioContext();
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
      
      try {
        const source = audioContextRef.current.createMediaStreamSource(remoteStream);
        const analyser = audioContextRef.current.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        analysersRef.current[targetSocketId] = analyser;
      } catch (e) {
        console.error('Error connecting stream to analyser', e);
      }
    });

    peer.on('error', (err) => {
      console.error('Peer error', err);
    });
    
    peer.on('close', () => {
      // cleanup done in handleUserLeft
    });

    return peer;
  }, [socket, initAudioContext]);
  
  // Handle new users joining
  useEffect(() => {
    if (!socket.connected || !roomId) return;

    const handleUserJoined = (user) => {
      const targetSocketId = user.socketId;
      if (targetSocketId !== socket.id && !peersRef.current[targetSocketId]) {
        // We act as initiator for users who join after us
        createPeer(targetSocketId, true, localStreamRef.current);
      }
    };

    const handleUserLeft = ({ socketId }) => {
      if (peersRef.current[socketId]) {
        peersRef.current[socketId].destroy();
        delete peersRef.current[socketId];
      }
      if (analysersRef.current[socketId]) {
        delete analysersRef.current[socketId];
      }
      setRemoteStreams((prev) => {
        const newStreams = { ...prev };
        delete newStreams[socketId];
        return newStreams;
      });
      if (activeSpeaker === socketId) setActiveSpeaker(null);
    };

    socket.on('room:user-joined', handleUserJoined);
    socket.on('room:user-left', handleUserLeft);

    return () => {
      socket.off('room:user-joined', handleUserJoined);
      socket.off('room:user-left', handleUserLeft);
    };
  }, [socket, roomId, createPeer, activeSpeaker]);

  // Handle incoming signaling
  useEffect(() => {
    const handleSignal = ({ from, signal }) => {
      let peer = peersRef.current[from];

      if (!peer) {
        // If we receive a signal from someone we don't have a peer for, create one.
        peer = createPeer(from, false, localStreamRef.current);
      }

      peer.signal(signal);
    };

    socket.on('webrtc:signal', handleSignal);
    return () => {
      socket.off('webrtc:signal', handleSignal);
    };
  }, [socket, createPeer]);

  const toggleMic = async () => {
    if (!micEnabled) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        localStreamRef.current = stream;
        setMicEnabled(true);

        // Add stream to all existing peers
        Object.values(peersRef.current).forEach((peer) => {
          if (!peer.destroyed) {
             peer.addStream(stream);
          }
        });
      } catch (err) {
        console.error('Error accessing microphone:', err);
        alert('Could not access microphone. Please check permissions.');
      }
    } else {
      if (localStreamRef.current) {
        // Remove stream from all peers
        Object.values(peersRef.current).forEach((peer) => {
          if (!peer.destroyed) {
            peer.removeStream(localStreamRef.current);
          }
        });

        localStreamRef.current.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
      }
      setMicEnabled(false);
    }
  };

  const toggleSpeakers = () => {
    setSpeakersEnabled(!speakersEnabled);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(console.error);
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      Object.values(peersRef.current).forEach((peer) => {
        if (!peer.destroyed) peer.destroy();
      });
    };
  }, []);

  return {
    micEnabled,
    speakersEnabled,
    toggleMic,
    toggleSpeakers,
    remoteStreams,
    activeSpeaker,
  };
};

export default useVoiceChat;
