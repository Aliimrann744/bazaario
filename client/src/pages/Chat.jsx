import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Send, MessageCircle, ChevronLeft, ArrowLeft } from 'lucide-react';
import api from '../lib/api';
import { Avatar, EmptyState, Skeleton } from '../components/ui/Primitives';
import { timeAgo, formatPkr } from '../lib/format';
import { useAuth } from '../store/auth';

export default function Chat() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const [convs, setConvs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.get('/conversations').then(({ data }) => setConvs(data.items)).finally(() => setLoading(false)); }, []);

  return (
    <div className="container-page py-6">
      <h1 className="mb-4 font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">Messages</h1>
      <div className="card grid h-[70vh] grid-cols-1 overflow-hidden md:grid-cols-[320px_1fr]">
        {/* Inbox */}
        <aside className={`flex flex-col border-r border-line ${id ? 'hidden md:flex' : 'flex'}`}>
          {loading ? <div className="space-y-2 p-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}</div>
            : convs.length === 0 ? <div className="flex flex-1 items-center justify-center p-6 text-center text-sm text-muted">No conversations yet.</div>
              : (
                <div className="flex-1 overflow-y-auto">
                  {convs.map((c) => (
                    <button key={c.id} onClick={() => nav(`/chat/${c.id}`)} className={`flex w-full items-center gap-3 border-b border-line p-3 text-left transition hover:bg-slate-50 ${id === c.id ? 'bg-brand-50' : ''}`}>
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-slate-100">{c.listing?.thumbnail ? <img src={c.listing.thumbnail} alt="" className="h-full w-full object-cover" /> : null}</div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-semibold text-ink">{c.otherUser?.name}</p>
                          {c.unread && <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-brand-500" />}
                        </div>
                        <p className="truncate text-xs text-muted">{c.listing?.title}</p>
                        <p className="truncate text-xs text-slate-400">{c.lastMessage?.body || 'Start the conversation'}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
        </aside>

        {/* Thread */}
        <section className={`${id ? 'flex' : 'hidden md:flex'} flex-col`}>
          {id ? <Thread key={id} id={id} me={user} onBack={() => nav('/chat')} /> : (
            <div className="flex flex-1 items-center justify-center">
              <EmptyState icon={MessageCircle} title="Select a conversation" subtitle="Your messages with buyers and sellers appear here." />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function Thread({ id, me, onBack }) {
  const [messages, setMessages] = useState([]);
  const [conv, setConv] = useState(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  const load = async () => {
    const [{ data: msgs }, { data: list }] = await Promise.all([
      api.get(`/conversations/${id}/messages`),
      api.get('/conversations'),
    ]);
    setMessages(msgs.items);
    setConv(list.items.find((c) => c.id === id) || null);
    setLoading(false);
    api.post(`/conversations/${id}/read`).catch(() => {});
  };
  useEffect(() => { setLoading(true); load(); }, [id]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async (e) => {
    e.preventDefault();
    const body = text.trim(); if (!body) return;
    setText('');
    const optimistic = { id: `tmp-${Date.now()}`, senderId: me.id, body, createdAt: new Date().toISOString() };
    setMessages((m) => [...m, optimistic]);
    try { const { data } = await api.post(`/conversations/${id}/messages`, { body }); setMessages((m) => m.map((x) => x.id === optimistic.id ? data.message : x)); }
    catch { setMessages((m) => m.filter((x) => x.id !== optimistic.id)); }
  };

  return (
    <>
      <div className="flex items-center gap-3 border-b border-line p-3">
        <button onClick={onBack} className="rounded-lg p-1.5 hover:bg-slate-100 md:hidden"><ArrowLeft className="h-5 w-5" /></button>
        <Avatar src={conv?.otherUser?.avatarUrl} name={conv?.otherUser?.name} size={40} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-ink">{conv?.otherUser?.name || 'Conversation'}</p>
          {conv?.listing && <Link to={`/listing/${conv.listing.publicId}`} className="truncate text-xs text-brand-600 hover:underline">{conv.listing.title} · {formatPkr(conv.listing.priceMinor)}</Link>}
        </div>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto bg-slate-50 p-4">
        {loading ? <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className={`h-10 ${i % 2 ? 'ml-auto w-1/2' : 'w-2/3'} rounded-2xl`} />)}</div>
          : messages.map((m) => {
            const mine = m.senderId === me.id;
            return (
              <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${mine ? 'rounded-br-md bg-brand-gradient text-white' : 'rounded-bl-md bg-white text-ink shadow-sm'}`}>
                  <p className="whitespace-pre-line">{m.body}</p>
                  <p className={`mt-0.5 text-[10px] ${mine ? 'text-white/70' : 'text-slate-400'}`}>{timeAgo(m.createdAt)}</p>
                </div>
              </div>
            );
          })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={send} className="flex items-center gap-2 border-t border-line p-3">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message…" className="input" />
        <button className="btn-primary !px-3.5"><Send className="h-4.5 w-4.5" style={{ width: 18, height: 18 }} /></button>
      </form>
    </>
  );
}
