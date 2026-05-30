import chromadb
from sentence_transformers import SentenceTransformer
import os

# Initialize Sentence Transformer model locally
# all-MiniLM-L6-v2 is fast and provides good semantic representation
_model = SentenceTransformer('all-MiniLM-L6-v2')

# Setup ChromaDB client (persistent storage)
CHROMA_DB_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "chroma_data")
_chroma_client = chromadb.PersistentClient(path=CHROMA_DB_DIR)

# Get or create the event embeddings collection
_events_collection = _chroma_client.get_or_create_collection(
    name="events",
    metadata={"hnsw:space": "cosine"} # Use cosine similarity for semantic search
)

class EmbeddingService:
    @staticmethod
    def generate_embedding(text: str) -> list[float]:
        """Generate a vector embedding for the given text."""
        return _model.encode(text).tolist()

    @staticmethod
    def build_event_text(event: dict) -> str:
        """Combine event fields into a single string for embedding."""
        parts = [
            event.get("title", ""),
            event.get("category", ""),
            " ".join(event.get("tags", [])),
            event.get("description", "")
        ]
        return " ".join(parts).lower()

    @staticmethod
    def upsert_event_embedding(event_id: str, event_data: dict):
        """Generate embedding for event and store in Vector DB."""
        combined_text = EmbeddingService.build_event_text(event_data)
        embedding = EmbeddingService.generate_embedding(combined_text)
        
        _events_collection.upsert(
            documents=[combined_text],
            embeddings=[embedding],
            metadatas=[{
                "category": event_data.get("category", ""),
                "location_name": event_data.get("location_name", ""),
                "intercollege": str(event_data.get("intercollege", True))
            }],
            ids=[str(event_id)]
        )

    @staticmethod
    def search_similar_events(query_text: str, n_results: int = 10) -> list[dict]:
        """Search Vector DB for semantically similar events."""
        query_embedding = EmbeddingService.generate_embedding(query_text.lower())
        
        results = _events_collection.query(
            query_embeddings=[query_embedding],
            n_results=n_results
        )
        
        formatted_results = []
        if results and results["ids"] and len(results["ids"]) > 0:
            for i in range(len(results["ids"][0])):
                formatted_results.append({
                    "event_id": results["ids"][0][i],
                    "distance": results["distances"][0][i],
                    "metadata": results["metadatas"][0][i] if results["metadatas"] else {}
                })
        return formatted_results
