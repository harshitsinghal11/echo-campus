'use client';
import React, { useEffect, useRef, useState } from 'react';
import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  DocumentData,
  QuerySnapshot,
  Unsubscribe,
  Timestamp
} from 'firebase/firestore';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '@/lib/firebase';
import { useSessionCode } from '@/hooks/useSessionCode';
import { Users, Send } from 'lucide-react';

type Message = {
  id?: string;
  random_code: string;
  message: string;
  createdAt: { seconds: number; nanoseconds: number } | null; // Firestore timestamp
};

export default function AnonChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [isSignedIn, setIsSignedIn] = useState(false);
  const sessionCode = useSessionCode();
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);
  const messagesRef = collection(db, 'chat_messages');
  const isOwnMessage = (code: string) => code === sessionCode;

  // 1) Ensure the client has Firebase anonymous auth (so rules apply)
  useEffect(() => {
    // Sign in anonymously if not signed
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsSignedIn(true);
      } else {
        // not signed in → sign in anonymously
        signInAnonymously(auth).catch((err) => {
          console.error('anon sign-in failed', err);
        });
      }
    });

    return () => unsubAuth();
  }, []);

  // 2) Subscribe to message collection (real-time)
  useEffect(() => {
    const q = query(messagesRef, orderBy('createdAt', 'asc'), limit(500));
    const unsub: Unsubscribe = onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
      const docs = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          random_code: data.random_code,
          message: data.message,
          createdAt: data.createdAt || null,
        } as Message;
      });
      setMessages(docs);
    }, (err) => {
      console.error('snapshot error', err);
    });

    return () => unsub();
  }, []); // run once

  useEffect(() => {
  if (chatContainerRef.current) {
    chatContainerRef.current.scrollTop =
      chatContainerRef.current.scrollHeight;
  }
  }, [messages]);
  async function handleSend(e?: React.FormEvent) {
    e?.preventDefault();
    if (!text.trim() || !sessionCode || !isSignedIn) return;

    const payload = {
      random_code: sessionCode,
      message: text.trim(),
      createdAt: serverTimestamp(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    };

    setText(''); // clear immediately for snappy UI

    try {
      await addDoc(messagesRef, payload);
      // Firestore will send the snapshot to all clients including sender automatically.
    } catch (err) {
      console.error('failed to send message', err);
      // optionally push a local failure notice
    }
  }

  return (
    <div className="h-[calc(100vh-9rem)] md:h-[calc(100vh-4rem)] flex flex-col bg-white/80 backdrop-blur-xl">
      {/* Header */}
      <div className="bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 p-4 md:p-6 text-white shrink-0">
        <div className="flex items-center justify-center gap-2">
          <Users className="w-5 h-5" />
          <span className="text-xl font-semibold">Anonymous Chat</span>
        </div>
      </div>

      {/* Messages */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 md:p-10 space-y-4 bg-linear-to-b from-slate-50/50 to-white/50">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-linear-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Users className="w-8 h-8 text-indigo-600" />
              </div>
              <p className="text-slate-500 text-sm">No messages yet — start the conversation!</p>
            </div>
          </div>
        )}
        {messages.map((m) => {
          const isOwn = isOwnMessage(m.random_code);
          return (
            <div key={m.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
              <div className="max-w-[70%] flex flex-col">
                
                {/* Username + Time */}
                <div className="flex items-center gap-2 mb-1 px-1">
                  <span className={`text-xs font-mono font-semibold ${isOwn ? "text-indigo-600" : "text-slate-600"}`}>
                    {m.random_code}
                  </span>
                  <span className="text-xs text-slate-400">
                    {m.createdAt
                      ? new Date(m.createdAt.seconds * 1000).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })
                      : "..."}
                  </span> 
                </div>

                {/* Message Bubble */}
                <div
                  className={`px-4 py-3 rounded-lg shadow-sm hover:shadow-md transition-all ${isOwn
                    ? "bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-br-sm"
                    : "bg-white text-slate-800 rounded-bl-sm border border-slate-100"
                    }`}
                >
                  <p className="text-sm leading-relaxed">{m.message}</p>
                  
                </div>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-slate-100 shrink-0">
        <div className="flex gap-3">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
            placeholder="Write something (be respectful)"
            className="flex-1 px-4 py-3 text-black border-2 border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-sm bg-slate-50/50"
          />

          <button
            onClick={handleSend}
            className="px-6 py-3 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 font-medium"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>
      </div>

    </div>

  );

}



