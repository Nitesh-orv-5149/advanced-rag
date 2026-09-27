from pypdf import PdfReader
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_mistralai import MistralAIEmbeddings
from langchain_chroma import Chroma
import os

MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")
if not MISTRAL_API_KEY:
    raise RuntimeError("MISTRAL_API_KEY environment variable is not set")

def load_pdf(file_path: str) -> list[Document]:
    reader = PdfReader(file_path)
    return [
        Document(
            page_content=page.extract_text() or "",
            metadata={"source": file_path, "page_number": i},
        )
        for i, page in enumerate(reader.pages)
    ]

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=2000,
    chunk_overlap=200,
    add_start_index=True
)

embeddings = MistralAIEmbeddings(
    model = "mistral-embed",
    api_key = MISTRAL_API_KEY,
    max_concurrent_requests=5,
    max_retries=3
) 

vector_store = Chroma(
    collection_name = "rag-collection",
    embedding_function = embeddings,
    persist_directory = "/data/chroma",
)