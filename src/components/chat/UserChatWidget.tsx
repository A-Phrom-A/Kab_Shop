'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Paperclip, Send, X, Image as ImageIcon, Video, Mic, ChevronDown, Smile } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { usePathname } from 'next/navigation';

const STICKERS = [
  { id: 'Wecandoit', url: '/stickers/Wecandoit.png' },
  { id: 'receive', url: '/stickers/receive.png' },
  { id: 'wait', url: '/stickers/wait.png' },
  { id: 'in_progress', url: '/stickers/in%20progress.png' },
  { id: 'stun', url: '/stickers/stun.png' },
  { id: 'cry', url: '/stickers/cry.png' },
  { id: 'dizzy', url: '/stickers/dizzy.png' },
  { id: 'Happy', url: '/stickers/Happy.png' },
  { id: 'hello', url: '/stickers/hello.png' },
  { id: 'sad', url: '/stickers/sad.png' },
  { id: 'sorry', url: '/stickers/sorry.png' },
  { id: 'Thank_you', url: '/stickers/Thank%20you.png' }
];

export function UserChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();


  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) {
        checkOrCreateRoom(data.session.user.id);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (session) checkOrCreateRoom(session.user.id);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (roomId) {
      const channel = supabase
        .channel(`room:${roomId}`)
        .on('postgres_changes', { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'chat_messages',
            filter: `room_id=eq.${roomId}`
        }, (payload) => {
          setMessages(prev => [...prev, payload.new]);
          scrollToBottom();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [roomId]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const checkOrCreateRoom = async (userId: string) => {
    // Check if user already has a support room
    const { data: existingRoom } = await supabase
      .from('chat_rooms')
      .select('id')
      .eq('type', 'support')
      .eq('participant1_id', userId)
      .single();

    if (existingRoom) {
      setRoomId(existingRoom.id);
      fetchMessages(existingRoom.id);
    } else {
      // Create new support room
      const { data: newRoom } = await supabase
        .from('chat_rooms')
        .insert({
          type: 'support',
          participant1_id: userId,
          // participant2_id is null until an admin claims it, or just leave it null
        })
        .select('id')
        .single();
        
      if (newRoom) setRoomId(newRoom.id);
    }
  };

  const fetchMessages = async (id: string) => {
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('room_id', id)
      .order('created_at', { ascending: true });
    
    if (data) {
      setMessages(data);
      scrollToBottom();
    }
  };

  const sendMessage = async (type: 'text' | 'image' | 'video' | 'audio' | 'sticker', content: string) => {
    if (!roomId || !session?.user) return;
    if (type === 'text' && !content.trim()) return;

    await supabase.from('chat_messages').insert({
      room_id: roomId,
      sender_id: session.user.id,
      message_type: type,
      content: content
    });

    if (type === 'text') setInputText('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video' | 'audio') => {
    if (!e.target.files || e.target.files.length === 0 || !roomId || !session?.user) return;
    const file = e.target.files[0];
    
    if (file.size > 10 * 1024 * 1024) {
      alert("File is too large. Maximum size is 10MB.");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${roomId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('chat-media')
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('chat-media')
        .getPublicUrl(fileName);

      await sendMessage(type, publicUrl);
    } catch (err: any) {
      alert("Upload error: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const renderMessageContent = (msg: any) => {
    switch (msg.message_type) {
      case 'image':
        return <img src={msg.content} alt="Attachment" className="rounded-lg max-w-[200px] cursor-pointer" onClick={() => window.open(msg.content, '_blank')} />;
      case 'video':
        return <video src={msg.content} controls className="rounded-lg max-w-[200px]" />;
      case 'audio':
        return <audio src={msg.content} controls className="max-w-[200px]" />;
      case 'sticker':
        return <img src={msg.content} alt="Sticker" className="w-24 h-24 object-contain drop-shadow-md bg-transparent" />;
      default:
        return <p className="whitespace-pre-wrap break-words">{msg.content}</p>;
    }
  };

  // Don't show widget on admin pages
  if (pathname.startsWith('/admin')) {
    return null;
  }

  // If not logged in, clicking the button could redirect to login, or suggest logging in.
  if (!session) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <a href="/auth/login" className="w-14 h-14 rounded-full bg-gold text-black flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:scale-110 transition-transform cursor-pointer">
          <MessageSquare size={24} />
        </a>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[350px] h-[500px] max-h-[70vh] glass-dark rounded-2xl border border-white/20 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">
          
          {/* Header */}
          <div className="p-4 bg-black/40 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-black font-bold">
                K
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">kabshop Support</h3>
                <p className="text-[10px] text-green-400 font-medium">Online</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/50 hover:text-white transition-colors">
              <ChevronDown size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-white/50 text-sm mt-10">
                Send a message to start chatting with our support team.
              </div>
            ) : (
              messages.map(msg => {
                const isMine = msg.sender_id === session.user.id;
                return (
                  <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl p-3 ${
                      isMine ? 'bg-gold text-black rounded-tr-sm' : 'bg-black/60 border border-white/10 rounded-tl-sm'
                    }`}>
                      {renderMessageContent(msg)}
                      <p className={`text-[10px] text-right mt-1 ${isMine ? 'text-black/60' : 'text-white/40'}`}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="relative p-3 bg-black/40 border-t border-white/10">
            {/* Stickers Drawer */}
            {showStickers && (
              <div className="absolute bottom-full left-0 right-0 mb-2 mx-3 bg-neutral-900 border border-white/20 rounded-xl p-3 shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex justify-between items-center mb-2 px-1">
                  <span className="text-xs font-bold text-white/50 uppercase tracking-wider">Stickers</span>
                  <button onClick={() => setShowStickers(false)} className="text-white/40 hover:text-white"><X size={14}/></button>
                </div>
                <div className="grid grid-cols-4 gap-2 max-h-[160px] overflow-y-auto p-1 custom-scrollbar">
                  {STICKERS.map(s => (
                    <button 
                      key={s.id} 
                      onClick={() => {
                        sendMessage('sticker', s.url);
                        setShowStickers(false);
                      }}
                      className="hover:scale-110 hover:bg-white/5 transition-all p-1 rounded-lg flex items-center justify-center pointer-events-auto"
                    >
                      <img src={s.url} alt={s.id} className="w-16 h-16 object-contain" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex bg-black/40 border border-white/10 rounded-xl overflow-hidden focus-within:border-gold transition-colors">
              <div className="flex items-center pl-2 gap-1 text-white/50">
                <label className="p-1.5 hover:text-gold hover:bg-white/5 rounded-full cursor-pointer transition-colors" title="Image">
                  <ImageIcon size={16} />
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'image')} disabled={uploading} />
                </label>
                <label className="p-1.5 hover:text-gold hover:bg-white/5 rounded-full cursor-pointer transition-colors" title="Video">
                  <Video size={16} />
                  <input type="file" accept="video/mp4,video/quicktime,video/webm" className="hidden" onChange={(e) => handleFileUpload(e, 'video')} disabled={uploading} />
                </label>
                <button onClick={() => setShowStickers(!showStickers)} className={`p-1.5 rounded-full transition-colors ${showStickers ? 'text-gold bg-white/10' : 'hover:text-gold hover:bg-white/5'}`} title="Sticker">
                  <Smile size={16} />
                </button>
              </div>
              <input 
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') sendMessage('text', inputText);
                }}
                disabled={uploading}
                placeholder="Type a message..."
                className="flex-1 bg-transparent px-2 py-3 text-sm outline-none w-full"
              />
              <button 
                onClick={() => sendMessage('text', inputText)}
                disabled={!inputText.trim() || uploading}
                className="px-3 text-gold hover:text-gold/80 disabled:opacity-50 transition-colors"
              >
                {uploading ? <div className="w-4 h-4 border-2 border-gold border-t-transparent rounded-full animate-spin"/> : <Send size={18} />}
              </button>
            </div>
          </div>

        </div>
      )}

      {/* Bubble Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:scale-110 transition-transform ${isOpen ? 'bg-black border border-white/20 text-white' : 'bg-gold text-black'}`}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>

    </div>
  );
}
