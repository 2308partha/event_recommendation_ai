# chatbot/rag_chain.py
import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, AIMessage
from langchain_core.output_parsers import StrOutputParser

# Clean external imports from your modular Session Manager
from chatbot.manager import get_redis_chat_history, save_redis_chat_history

# Load environment keys from your local root .env file
load_dotenv()

# =======================================================
# 1. CORE AI ENGINES & EMBEDDINGS SETUP
# =======================================================
llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    temperature=0.3,
    google_api_key=os.getenv("GEMINI_API_KEY")
)

# ChromaDB explicitly skipped due to loading constraints as requested by the user.
# Embeddings logic removed for a lightweight, purely DB-contextual assistant.

# =======================================================
# 2. CONVERSATIONAL RAG PROMPT ARCHITECTURE
# =======================================================
system_prompt = (
    "You are Nexus AI, a highly capable student assistant managing campus events and "
    "technical domain knowledge. Use the provided sections of retrieved context to "
    "accurately answer the user's question.\n\n"
    "If you do not know the answer or if the context does not explicitly contain "
    "the information, inform the user clearly that you cannot find that specific detail "
    "in your current knowledge bank. Do not make up facts or generate hallucinations.\n\n"
    "Retrieved System Context:\n{context}"
)

contextual_prompt = ChatPromptTemplate.from_messages([
    ("system", system_prompt),
    MessagesPlaceholder(variable_name="chat_history"),
    ("human", "{input}"),
])

# Modern LCEL Replacement Chain
rag_chain = contextual_prompt | llm | StrOutputParser()


# =======================================================
# 3. CORE INTEGRATED ASSISTANT ENGINE ENTRYPOINT
# =======================================================

async def get_chatbot_response(session_id: str, user_message: str) -> str:
    """
    Coordinates session state management through Redis, pools contexts 
    dynamically ONLY from live MongoDB records (bypassing Chroma), 
    and returns an optimized reply.
    """
    # 1. Pull message histories directly from your modular manager.py utility function
    history = get_redis_chat_history(session_id)
    
    # 2. Dynamic Database State Fetching: Pull a limited subset of live MongoDB event records
    mongo_context = ""
    try:
        from database.db import db
        
        # Limit to 5 events to prevent context overload
        mongo_events = await db["events"].find({}).limit(5).to_list(None)
        if mongo_events:
            mongo_context += "\n--- MongoDB Current Live Event Database ---\n"
            for ev in mongo_events:
                mongo_context += (
                    f"Event Title: {ev.get('title')}\n"
                    f"Category: {ev.get('category')}\n"
                    f"Tags: {', '.join(ev.get('tags', []))}\n"
                    f"Registration Deadline: {ev.get('registration_deadline')}\n\n"
                )
            
            mongo_context += (
                "\n--- Platform General Knowledge ---\n"
                "To register for any event, a student clicks the purple 'Register Now' button. "
                "Registration is instantaneous and awards the user +50 Coins in their wallet.\n\n"
            )
    except Exception as mongo_err:
        print(f"MongoDB query error: {str(mongo_err)}")
    
    # We no longer query events_retriever or agent_retriever to save on loading time/memory constraints.
    combined_docs = mongo_context

    # 4. Direct execution over our modern LCEL stream pipeline
    ai_answer = await rag_chain.ainvoke({
        "input": user_message,
        "chat_history": history,
        "context": combined_docs
    })
    
    # 5. Append message tracking turns to sustain interaction state
    history.append(HumanMessage(content=user_message))
    history.append(AIMessage(content=ai_answer))
    
    # 6. Push serialization arrays back out using your external manager utility
    save_redis_chat_history(session_id, history)
    
    return ai_answer