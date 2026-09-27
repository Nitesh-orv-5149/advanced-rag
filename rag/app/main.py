import tempfile
from typing import Optional

from fastapi import FastAPI, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.src.pipeline import ingest_pdf, answer_query

app = FastAPI(title="advanced-rag")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/ingest")
async def ingest(file: UploadFile):
    with tempfile.NamedTemporaryFile(suffix=".pdf") as tmp:
        tmp.write(await file.read())
        tmp.flush()
        result = ingest_pdf(tmp.name)
    return {"filename": file.filename, **result}


class QueryRequest(BaseModel):
    query: str
    k: int = 4


@app.post("/query")
def query(req: QueryRequest):
    return answer_query(req.query, req.k)


@app.post("/chat")
async def chat(query: str = Form(...), k: int = Form(4), file: Optional[UploadFile] = None):
    if file is not None:
        with tempfile.NamedTemporaryFile(suffix=".pdf") as tmp:
            tmp.write(await file.read())
            tmp.flush()
            ingest_pdf(tmp.name)
    return answer_query(query, k)
