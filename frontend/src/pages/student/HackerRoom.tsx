import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Users, MessageSquare, Award, Terminal } from "lucide-react";
import { getRecommendedPeers } from "../../services/api";

interface Peer {
  id: string;
  name: string;
  email: string;
  image_url: string;
  branch: string;
  skills: string[];
  shared_events: string[];
  is_mentor: boolean;
}

interface Message {
  user: string;
  text: string;
}

export default function PeerNetwork() {
  const [peers, setPeers] = useState<Peer[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeChatPeer, setActiveChatPeer] = useState<Peer | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMsg, setInputMsg] = useState("");

  useEffect(() => {
    async function loadPeers() {
      const data = await getRecommendedPeers();
      setPeers(data);
      setLoading(false);
    }
    loadPeers();
  }, []);

  const sendMessage = () => {
    if (inputMsg.trim() && activeChatPeer) {
      setMessages((prev) => [...prev, { user: "You", text: inputMsg }]);
      
      // Mock peer response
      setTimeout(() => {
        setMessages((prev) => [...prev, { user: activeChatPeer.name, text: "Hey! Happy to connect and share my experience. Let me know what you need help with!" }]);
      }, 1000);
      
      setInputMsg("");
    }
  };

  const openChat = (peer: Peer) => {
    setActiveChatPeer(peer);
    setMessages([]);
  };

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl h-[calc(100vh-80px)] flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-purple-500/10 rounded-xl">
          <Users className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Peer & Mentorship Network</h1>
          <p className="text-muted-foreground mt-1">Connect with teammates and students who outperformed you in shared events.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-grow min-h-0">
        
        {/* Peer Network Grid */}
        <div className="flex-grow flex flex-col overflow-y-auto pr-2">
          {loading ? (
            <div className="flex justify-center mt-20">
              <div className="animate-pulse flex space-x-4">
                <div className="rounded-full bg-slate-200 dark:bg-slate-700 h-10 w-10"></div>
                <div className="flex-1 space-y-6 py-1">
                  <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-48"></div>
                  <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-32"></div>
                </div>
              </div>
            </div>
          ) : peers.length === 0 ? (
            <div className="text-center mt-20 text-muted-foreground flex flex-col items-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Award className="w-8 h-8 opacity-40" />
              </div>
              <h3 className="font-semibold text-lg text-foreground mb-1">No Peers Found Yet</h3>
              <p>Keep participating in events to build your network and connect with peers!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {peers.map(peer => (
                <Card key={peer.id} className="border-border/50 bg-background shadow-sm hover:shadow-md transition-all overflow-hidden group">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <img src={peer.image_url} alt={peer.name} className="w-14 h-14 rounded-full border-2 border-border/50 object-cover" />
                      <div className="flex-grow min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-bold text-lg leading-tight truncate">{peer.name}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3 truncate">{peer.branch}</p>
                        
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {peer.skills.slice(0, 3).map(skill => (
                            <span key={skill} className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] uppercase font-bold rounded-md">
                              {skill}
                            </span>
                          ))}
                        </div>

                        {peer.is_mentor ? (
                          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg mb-4">
                            <p className="text-xs text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1.5 uppercase tracking-wide">
                              <Award className="w-3.5 h-3.5" /> 
                              Outperformed you in
                            </p>
                            <ul className="list-disc list-inside text-xs font-medium mt-1.5 space-y-1">
                              {peer.shared_events.map((evt, i) => (
                                <li key={i} className="truncate">{evt}</li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg mb-4">
                            <p className="text-xs text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1.5 uppercase tracking-wide">
                              <Users className="w-3.5 h-3.5" /> 
                              Teammate / Peer in
                            </p>
                            <ul className="list-disc list-inside text-xs font-medium mt-1.5 space-y-1">
                              {peer.shared_events.map((evt, i) => (
                                <li key={i} className="truncate">{evt}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        <Button 
                          variant={activeChatPeer?.id === peer.id ? "default" : "outline"} 
                          className="w-full text-xs h-9 font-semibold" 
                          onClick={() => openChat(peer)}
                        >
                          <MessageSquare className="w-3.5 h-3.5 mr-2" /> 
                          {activeChatPeer?.id === peer.id ? "Chatting..." : "Connect & Message"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Live Chat Panel */}
        <Card className="w-full lg:w-[400px] flex flex-col border-border/50 shadow-sm shrink-0 bg-muted/10 h-full overflow-hidden">
          <CardHeader className="py-4 border-b border-border/50 bg-background/50">
            <CardTitle className="flex items-center text-lg gap-2">
              <MessageSquare className="w-5 h-5 text-blue-500" /> 
              {activeChatPeer ? `Chat with ${activeChatPeer.name.split(' ')[0]}` : "Direct Messages"}
            </CardTitle>
            {activeChatPeer && <CardDescription className="text-xs font-medium text-muted-foreground">{activeChatPeer.is_mentor ? 'Mentorship Channel' : 'Peer Network Channel'}</CardDescription>}
          </CardHeader>
          <CardContent className="flex-grow flex flex-col p-0 overflow-hidden">
            {!activeChatPeer ? (
              <div className="flex-grow flex flex-col items-center justify-center text-muted-foreground opacity-50 p-6 text-center">
                <Terminal className="w-12 h-12 mb-4" />
                <p className="text-sm font-medium">Select a peer from the network to initiate a direct connection.</p>
              </div>
            ) : (
              <>
                <div className="flex-grow overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 && (
                    <div className="text-center p-4 bg-primary/5 rounded-xl border border-primary/10">
                      <p className="text-sm font-medium text-primary">Ask {activeChatPeer.name.split(' ')[0]} about {activeChatPeer.shared_events[0]}!</p>
                    </div>
                  )}
                  {messages.map((m, i) => (
                    <div key={i} className={`flex flex-col ${m.user === "You" ? "items-end" : "items-start"}`}>
                      <span className="text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-wider">{m.user}</span>
                      <div className={`px-3.5 py-2.5 rounded-2xl max-w-[85%] text-sm shadow-sm ${m.user === "You" ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-background border border-border/50 text-foreground rounded-tl-sm"}`}>
                        {m.text}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-border/50 bg-background flex gap-2">
                  <Input 
                    placeholder={`Message ${activeChatPeer.name.split(' ')[0]}...`} 
                    value={inputMsg}
                    onChange={(e) => setInputMsg(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    className="bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary/50"
                  />
                  <Button size="icon" onClick={sendMessage} className="shrink-0 rounded-full h-10 w-10">
                    <Send className="w-4 h-4 ml-[-2px]" />
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
