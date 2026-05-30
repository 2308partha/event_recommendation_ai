# inspect_chroma.py
import os
import chromadb
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from dotenv import load_dotenv

load_dotenv()

def check_my_vectors():
    print("🤖 Connecting to local persistent ChromaDB client...")
    
    # 1. Initialize client matching your main path configuration
    chroma_client = chromadb.PersistentClient(path="./chroma_db")
    
    # 2. Safely fetch the collection name your seeder used
    try:
        collection = chroma_client.get_collection(name="campus_events")
    except Exception:
        print("❌ Error: Could not find a collection named 'campus_events'. Seed may have failed or path is wrong.")
        return

    # 3. Pull all documents, metadatas, and ids out of the collection
    data = collection.get()
    
    total_items = len(data["ids"])
    print(f"📦 Total Vectors Successfully Indexed: {total_items}\n")
    
    if total_items == 0:
        print("⚠️ The collection exists but it is completely empty.")
        return

    # 4. Print out the seeded mappings to verify matching IDs
    print("--- SEEDED CORE ARTIFACTS ---")
    for idx in range(total_items):
        print(f"🔹 Vector Reference ID: {data['ids'][idx]}")
        print(f"📜 Extracted Document Text:\n    {data['documents'][idx]}")
        print(f"📌 Attached Metadata Map (Cross-checking with MongoDB): {data['metadatas'][idx]}")
        print("-" * 50)

if __name__ == "__main__":
    check_my_vectors()