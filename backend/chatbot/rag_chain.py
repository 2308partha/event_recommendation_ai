# chatbot/rag_chain.py
import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_chroma import Chroma
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
llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.3)

# CRITICAL: Dimension alignment. Ensure this matches what you used in seed_data.py!
embeddings = GoogleGenerativeAIEmbeddings(
    model="gemini-embedding-2-preview",
    google_api_key=os.getenv("GEMINI_API_KEY") # 👈 FORCE PASS KEY HERE
)
# =======================================================
# 2. VECTORSTORE RETRIEVERS CONFIGURATION
# =======================================================
# Primary collection: Tracks local campus hackathons, design sprints, etc.
events_vectorstore = Chroma(
    collection_name="campus_events",
    embedding_function=embeddings,
    persist_directory="./chroma_db"
)
events_retriever = events_vectorstore.as_retriever(search_kwargs={"k": 2})

# Secondary collection: Tracks the scraped AI Agent technical knowledge documents
agent_vectorstore = Chroma(
    collection_name="agent_knowledge",
    embedding_function=embeddings,
    persist_directory="./chroma_db"
)
agent_retriever = agent_vectorstore.as_retriever(search_kwargs={"k": 2})


# =======================================================
# 3. CONVERSATIONAL RAG PROMPT ARCHITECTURE
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
# 4. CORE INTEGRATED ASSISTANT ENGINE ENTRYPOINT
# =======================================================

async def get_chatbot_response(session_id: str, user_message: str) -> str:
    """
    Coordinates session state management through Redis, pools contexts 
    dynamically across live MongoDB records and Chroma vector collections manually, 
    and returns an optimized reply.
    """
    # 1. Pull message histories directly from your modular manager.py utility function
    history = get_redis_chat_history(session_id)
    
    # 2. Dynamic Database State Fetching: Pull all live MongoDB event records
    mongo_context = ""
    try:
        from database.db import db
        
        mongo_events = await db["events"].find({}).to_list(None)
        if mongo_events:
            mongo_context += "\n--- MongoDB Current Live Event Database ---\n"
            for ev in mongo_events:
                mongo_context += (
                    f"Event ID: {str(ev.get('_id'))}\n"
                    f"Event Title: {ev.get('title')}\n"
                    f"Host College: {ev.get('host_college')}\n"
                    f"NIRF Ranking: {ev.get('nirf_ranking')}\n"
                    f"Is Intercollege: {ev.get('is_intercollege')}\n"
                    f"Location Name: {ev.get('location_name')}\n"
                    f"Tags: {', '.join(ev.get('tags', []))}\n"
                    f"Registration Count: {ev.get('registration_count')}\n"
                    f"Registration Deadline: {ev.get('registration_deadline')}\n"
                    f"Event Date: {ev.get('event_date')}\n"
                    f"Is Open: {ev.get('is_open')}\n\n"
                )
            # Append general registration and rules guidelines so the chatbot can always answer these platform-wide questions
            mongo_context += (
                "\n--- Platform Event Registration Process & Wallet Incentives ---\n"
                "To register for any event (including the National GenAI Hackathon 2026 or the Advanced Data Structures Meetup), "
                "a student simply opens the event's detailed information card or views the event grid on the platform dashboard, "
                "and clicks the purple 'Register Now' button. Registration is completely instantaneous, decreases the remaining seats "
                "count by one, adds the event to their 'registered_events' list in MongoDB, awards the user +50 Coins in their wallet, "
                "and unlocks milestone profile badges (like 'Active Attendee' or 'Hackathon Builder')!\n\n"
            )
    except Exception as mongo_err:
        print(f"Chroma-fallback mode active. MongoDB query error: {str(mongo_err)}")
    
    # 3. Dynamic Knowledge Pooling: Query both context vectors concurrently
    event_docs = await events_retriever.ainvoke(user_message)
    agent_docs = await agent_retriever.ainvoke(user_message)
    
    # Blend combined results cleanly into a consolidated text block
    combined_docs = mongo_context
    for doc in event_docs:
        combined_docs += f"\n[Source: Campus Events] Context: {doc.page_content}\n"
    for doc in agent_docs:
        combined_docs += f"\n[Source: Agent Tech Docs] Context: {doc.page_content}\n"

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