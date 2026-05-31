import { useState, useEffect, useRef } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Hash, KanbanSquare, MessageSquare } from "lucide-react";
import { useParams } from "react-router-dom";

interface Message {
  user: string;
  text: string;
}

interface Task {
  id: string;
  content: string;
}

interface Columns {
  [key: string]: {
    name: string;
    items: Task[];
  };
}

const initialColumns: Columns = {
  todo: { name: "To Do", items: [{ id: "t1", content: "Design UI" }, { id: "t2", content: "Setup DB" }] },
  inProgress: { name: "In Progress", items: [{ id: "t3", content: "Auth setup" }] },
  done: { name: "Done", items: [{ id: "t4", content: "Project Init" }] }
};

export default function HackerRoom() {
  const { roomId } = useParams<{ roomId: string }>();
  const activeRoom = roomId || "general";
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMsg, setInputMsg] = useState("");
  const ws = useRef<WebSocket | null>(null);

  const [columns, setColumns] = useState<Columns>(initialColumns);
  const [newTask, setNewTask] = useState("");

  useEffect(() => {
    ws.current = new WebSocket(`ws://localhost:8000/api/hacker-rooms/ws/${activeRoom}`);
    ws.current.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      setMessages((prev) => [...prev, msg]);
    };
    return () => {
      ws.current?.close();
    };
  }, [activeRoom]);

  const sendMessage = () => {
    if (inputMsg.trim() && ws.current) {
      ws.current.send(inputMsg);
      setInputMsg("");
    }
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination } = result;

    if (source.droppableId !== destination.droppableId) {
      const sourceCol = columns[source.droppableId];
      const destCol = columns[destination.droppableId];
      const sourceItems = [...sourceCol.items];
      const destItems = [...destCol.items];
      const [removed] = sourceItems.splice(source.index, 1);
      destItems.splice(destination.index, 0, removed);
      
      setColumns({
        ...columns,
        [source.droppableId]: { ...sourceCol, items: sourceItems },
        [destination.droppableId]: { ...destCol, items: destItems }
      });
    } else {
      const column = columns[source.droppableId];
      const copiedItems = [...column.items];
      const [removed] = copiedItems.splice(source.index, 1);
      copiedItems.splice(destination.index, 0, removed);
      
      setColumns({
        ...columns,
        [source.droppableId]: { ...column, items: copiedItems }
      });
    }
  };

  const addTask = () => {
    if (!newTask.trim()) return;
    const newId = `t-${Date.now()}`;
    const col = columns["todo"];
    setColumns({
      ...columns,
      todo: { ...col, items: [...col.items, { id: newId, content: newTask }] }
    });
    setNewTask("");
  };

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl h-[calc(100vh-80px)] flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-500/10 rounded-xl">
          <Hash className="w-6 h-6 text-blue-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hacker Room: {activeRoom}</h1>
          <p className="text-muted-foreground mt-1">Persistent workspace for your team.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-grow min-h-0">
        
        {/* Kanban Board */}
        <Card className="flex-grow flex flex-col border-border/50 bg-muted/10 shadow-sm overflow-hidden">
          <CardHeader className="py-4 border-b border-border/50 bg-muted/30">
            <CardTitle className="flex items-center text-lg gap-2">
              <KanbanSquare className="w-5 h-5 text-primary" /> Team Board
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-grow overflow-auto p-4">
            <div className="flex gap-2 mb-6">
              <Input 
                placeholder="Add new task..." 
                value={newTask} 
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTask()}
              />
              <Button onClick={addTask}>Add</Button>
            </div>
            
            <DragDropContext onDragEnd={onDragEnd}>
              <div className="flex gap-4 h-[calc(100%-60px)]">
                {Object.entries(columns).map(([colId, column]) => (
                  <div key={colId} className="flex-1 min-w-[200px] flex flex-col bg-muted/30 rounded-lg p-3">
                    <h3 className="font-semibold text-sm mb-3 text-muted-foreground px-1 uppercase tracking-wider">{column.name}</h3>
                    <Droppable droppableId={colId}>
                      {(provided, snapshot) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className={`flex-grow rounded-md transition-colors ${snapshot.isDraggingOver ? 'bg-primary/5' : ''}`}
                        >
                          {column.items.map((item, index) => (
                            <Draggable key={item.id} draggableId={item.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`p-3 mb-2 bg-background border border-border/50 rounded shadow-sm text-sm ${snapshot.isDragging ? 'shadow-md opacity-90' : ''}`}
                                >
                                  {item.content}
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                ))}
              </div>
            </DragDropContext>
          </CardContent>
        </Card>

        {/* Chat */}
        <Card className="w-full lg:w-[400px] flex flex-col border-border/50 shadow-sm shrink-0">
          <CardHeader className="py-4 border-b border-border/50 bg-muted/30">
            <CardTitle className="flex items-center text-lg gap-2">
              <MessageSquare className="w-5 h-5 text-blue-500" /> Live Chat
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col p-0 min-h-[300px]">
            <div className="flex-grow overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && <p className="text-center text-sm text-muted-foreground mt-10">No messages yet. Say hi!</p>}
              {messages.map((m, i) => (
                <div key={i} className="flex flex-col">
                  <span className="text-xs font-semibold text-muted-foreground mb-1">{m.user}</span>
                  <div className="bg-primary/10 text-foreground px-3 py-2 rounded-lg rounded-tl-none self-start max-w-[85%] text-sm">
                    {m.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-border/50 bg-muted/10 flex gap-2">
              <Input 
                placeholder="Type a message..." 
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              />
              <Button size="icon" onClick={sendMessage} className="shrink-0"><Send className="w-4 h-4" /></Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
