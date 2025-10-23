import { useState, useEffect } from 'react';
import { useChat } from './hooks/useChat';
import { ChatWindow } from './components/ChatWindow';
import { ChatInput } from './components/ChatInput';
import { EscalationBanner } from './components/EscalationBanner';
import { MessageSquare, RefreshCw, Sparkles } from 'lucide-react';

function App() {
  const [userId, setUserId] = useState<string>('');
  const [showEscalationBanner, setShowEscalationBanner] = useState(false);

  useEffect(() => {
    let id = localStorage.getItem('supportUserId');
    if (!id) {
      id = `user_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      localStorage.setItem('supportUserId', id);
    }
    setUserId(id);
  }, []);

  const { messages, session, isLoading, error, sendMessage, startNewSession } = useChat(userId);

  useEffect(() => {
    if (session?.escalated) {
      setShowEscalationBanner(true);
    }
  }, [session?.escalated]);

  if (!userId) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Initializing...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8 h-screen flex flex-col max-w-4xl">
        {/* Header */}
        <div className="bg-white rounded-t-2xl shadow-sm border border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">AI Customer Support</h1>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Powered by intelligent conversation engine
                </p>
              </div>
            </div>
            <button
              onClick={startNewSession}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              New Chat
            </button>
          </div>

          {session && (
            <div className="mt-3 flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Session:</span>
                <span className="font-mono text-slate-700">{session.id.slice(0, 8)}...</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Status:</span>
                <span
                  className={`px-2 py-0.5 rounded-full font-medium ${
                    session.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : session.status === 'escalated'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {session.status}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Escalation Banner */}
        {showEscalationBanner && session?.escalated && (
          <EscalationBanner
            reason={session.escalation_reason}
            onDismiss={() => setShowEscalationBanner(false)}
          />
        )}

        {/* Chat Area */}
        <div className="flex-1 bg-white border-x border-slate-200 flex flex-col overflow-hidden">
          <ChatWindow messages={messages} isLoading={isLoading} />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-x border-red-200 px-4 py-2">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Input Area */}
        <div className="bg-white rounded-b-2xl shadow-sm border border-slate-200 overflow-hidden">
          <ChatInput
            onSend={sendMessage}
            disabled={isLoading || session?.status === 'escalated'}
            placeholder={
              session?.status === 'escalated'
                ? 'Chat escalated to support team...'
                : 'Type your message...'
            }
          />
        </div>

        {/* Footer */}
        <div className="mt-4 text-center">
          <p className="text-xs text-slate-500">
            This AI assistant uses contextual memory and intelligent FAQ matching.
            Questions are automatically escalated when needed.
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
