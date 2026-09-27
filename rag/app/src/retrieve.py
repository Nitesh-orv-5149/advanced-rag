from app.src.ingest import vector_store

def retrieve(query: str, k: int = 4):
    return vector_store.similarity_search(query, k=k)
