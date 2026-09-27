from langchain_mistralai import ChatMistralAI
from langchain_core.prompts import ChatPromptTemplate
import os

MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")

llm = ChatMistralAI(
    model = "mistral-small-latest",
    api_key = MISTRAL_API_KEY,
    temperature = 0.7,
    max_retries = 2,
)

SYSTEM_PROMPT = """You are a helpful assistant answering questions using only the provided context.
If the context doesn't contain the answer, say you don't know. Cite sources inline using [source].

Context:
{context}
"""

prompt = ChatPromptTemplate.from_messages([
    ("system", SYSTEM_PROMPT),
    ("human", "{question}"),
])

def format_docs(docs):
    return "\n\n".join(
        f"[{doc.metadata.get('source', 'unknown')}]\n{doc.page_content}"
        for doc in docs
    )