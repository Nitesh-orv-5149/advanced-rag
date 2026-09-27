from langchain_core.output_parsers import StrOutputParser

from app.src.ingest import load_pdf, text_splitter, vector_store
from app.src.retrieve import retrieve
from app.src.generate import prompt, llm, format_docs

answer_chain = prompt | llm | StrOutputParser()


def ingest_pdf(file_path: str) -> dict:
    pages = load_pdf(file_path)
    chunks = text_splitter.split_documents(pages)
    offset = vector_store._collection.count()
    for i, chunk in enumerate(chunks):
        chunk.metadata["chunk_number"] = offset + i
    ids = vector_store.add_documents(chunks)
    return {"pages": len(pages), "chunks": len(chunks), "embedded": len(ids)}


def answer_query(query: str, k: int = 4) -> dict:
    docs = retrieve(query, k)
    if not docs:
        return {"answer": "No documents have been ingested yet.", "chunk_numbers": []}
    answer = answer_chain.invoke({"context": format_docs(docs), "question": query})
    return {"answer": answer, "chunk_numbers": [d.metadata.get("chunk_number") for d in docs]}
