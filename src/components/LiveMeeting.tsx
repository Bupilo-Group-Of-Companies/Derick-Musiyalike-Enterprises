import React, { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Users } from 'lucide-react';
import { motion } from 'motion/react';

interface LiveMeetingProps {
  roomId?: string;
  userId: string;
  userName: string;
  onLeave: () => void;
}

interface Peer {
  userId: string;
  stream: MediaStream;
}

const LiveMeeting: React.FC<LiveMeetingProps> = ({ roomId = 'general', userId, userName, onLeave }) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remotePeers, setRemotePeers] = useState<Peer[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  
  const socketRef = useRef<Socket | null>(null);
  const peersRef = useRef<{ [key: string]: RTCPeerConnection }>({});
  const localVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        socketRef.current = io();
        
        // Define createPeerConnection inside useEffect to access stream
        const createPeerConnection = (remoteUserId: string, isInitiator: boolean) => {
          const pc = new RTCPeerConnection({
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' }
            ]
          });

          peersRef.current[remoteUserId] = pc;

          stream.getTracks().forEach(track => pc.addTrack(track, stream));

          pc.onicecandidate = (event) => {
            if (event.candidate) {
              socketRef.current?.emit('ice-candidate', event.candidate, remoteUserId);
            }
          };

          pc.ontrack = (event) => {
            console.log('Received remote track from:', remoteUserId);
            setRemotePeers(prev => {
              if (prev.find(p => p.userId === remoteUserId)) return prev;
              return [...prev, { userId: remoteUserId, stream: event.streams[0] }];
            });
          };

          if (isInitiator) {
            const createOffer = async () => {
              try {
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                socketRef.current?.emit('offer', offer, remoteUserId);
              } catch (err) {
                console.error('Error creating offer:', err);
              }
            };
            createOffer();
          }

          return pc;
        };

        socketRef.current.emit('join-room', roomId, userId, userName);

        socketRef.current.on('user-connected', (remoteUserId: string, remoteUserName: string) => {
          console.log('User connected:', remoteUserId);
          createPeerConnection(remoteUserId, true);
        });

        socketRef.current.on('offer', async (offer: RTCSessionDescriptionInit, remoteUserId: string) => {
          console.log('Received offer from:', remoteUserId);
          const pc = createPeerConnection(remoteUserId, false);
          await pc.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socketRef.current?.emit('answer', answer, remoteUserId);
        });

        socketRef.current.on('answer', async (answer: RTCSessionDescriptionInit, remoteUserId: string) => {
          console.log('Received answer from:', remoteUserId);
          const pc = peersRef.current[remoteUserId];
          if (pc) {
            await pc.setRemoteDescription(new RTCSessionDescription(answer));
          }
        });

        socketRef.current.on('ice-candidate', async (candidate: RTCIceCandidateInit, remoteUserId: string) => {
          const pc = peersRef.current[remoteUserId];
          if (pc) {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          }
        });

        socketRef.current.on('user-disconnected', (remoteUserId: string) => {
          console.log('User disconnected:', remoteUserId);
          if (peersRef.current[remoteUserId]) {
            peersRef.current[remoteUserId].close();
            delete peersRef.current[remoteUserId];
          }
          setRemotePeers(prev => prev.filter(p => p.userId !== remoteUserId));
        });

      } catch (err) {
        console.error('Error accessing media devices:', err);
        alert('Could not access camera/microphone. Please check permissions.');
        onLeave();
      }
    };

    init();

    return () => {
      localStream?.getTracks().forEach(track => track.stop());
      socketRef.current?.disconnect();
      Object.values(peersRef.current).forEach(pc => pc.close());
    };
  }, [roomId, userId, userName]);

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => track.enabled = !track.enabled);
      setIsVideoOff(!isVideoOff);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center justify-between bg-black/50 backdrop-blur-md absolute top-0 left-0 right-0 z-10">
        <div className="flex items-center gap-2 text-white">
          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm">Live Meeting</h3>
            <p className="text-[10px] text-gray-300">Room: {roomId}</p>
          </div>
        </div>
        <div className="bg-red-600 px-3 py-1 rounded-full text-[10px] font-bold text-white animate-pulse">
          LIVE
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto mt-16 mb-20">
        {/* Local Video */}
        <div className="relative aspect-video bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 shadow-2xl">
          <video 
            ref={localVideoRef} 
            autoPlay 
            muted 
            playsInline 
            className={`w-full h-full object-cover transform scale-x-[-1] ${isVideoOff ? 'hidden' : ''}`} 
          />
          {isVideoOff && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-white">{userName.charAt(0)}</span>
              </div>
            </div>
          )}
          <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1 rounded-lg text-white text-xs font-bold backdrop-blur-sm">
            You {isMuted && '(Muted)'}
          </div>
        </div>

        {/* Remote Videos */}
        {remotePeers.map(peer => (
          <RemoteVideo key={peer.userId} peer={peer} />
        ))}
      </div>

      {/* Controls */}
      <div className="p-6 flex items-center justify-center gap-6 bg-black/50 backdrop-blur-md absolute bottom-0 left-0 right-0">
        <button 
          onClick={toggleMute}
          className={`p-4 rounded-full transition-all ${isMuted ? 'bg-red-600 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
        >
          {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </button>
        
        <button 
          onClick={onLeave}
          className="p-4 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all shadow-lg shadow-red-600/30 transform hover:scale-110"
        >
          <PhoneOff className="w-8 h-8" />
        </button>

        <button 
          onClick={toggleVideo}
          className={`p-4 rounded-full transition-all ${isVideoOff ? 'bg-red-600 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
        >
          {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
        </button>
      </div>
    </div>
  );
};

const RemoteVideo: React.FC<{ peer: Peer }> = ({ peer }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = peer.stream;
    }
  }, [peer.stream]);

  return (
    <div className="relative aspect-video bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 shadow-2xl">
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        className="w-full h-full object-cover" 
      />
      <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1 rounded-lg text-white text-xs font-bold backdrop-blur-sm">
        User {peer.userId.substr(0, 4)}
      </div>
    </div>
  );
};

export default LiveMeeting;
