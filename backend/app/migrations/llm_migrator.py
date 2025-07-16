import csv
from ollama import Client
import ast
from typing import Dict, Any, List
from sqlmodel import Session
from app.models import Book
from sqlmodel import create_engine, select
import os
from dotenv import load_dotenv
from app import models
import json
import pandas as pd
import sqlite3

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

import os

def get_file_type(file_path: str) -> str:
    ext = os.path.splitext(file_path)[1].lower()
    if ext == ".csv":
        return "csv"
    elif ext == ".json":
        return "json"
    elif ext in [".xls", ".xlsx"]:
        return "excel"
    elif ext == ".db":
        return "sqlite"
    else:
        return "unknown"


def read_csv_header(csv_path: str, sample_size: int = 3) -> List[str]:
    with open(csv_path, encoding="utf-8") as f:
        reader = csv.DictReader(f)
        return reader.fieldnames or []

def ask_ollama_for_field_map(csv_header: List[str], target_fields: List[str]) -> Dict[str, Any]:
    prompt = f"""
You are a backend dev assistant.  
Given a CSV file with columns: {csv_header}  
And a target DB model with fields: {target_fields}  

ONLY output a valid Python dictionary literal mapping CSV columns to model fields.  
NO explanations, NO text, NO greetings.
Example output: {{"author_name": "author", "title": "title", "cover_url": "image_url"}}
If they are in russian, translate them to english and make this mapping/output.
"""
    client = Client(host="http://host.docker.internal:11435")
    response = client.chat(
        model="llama2-7b",
        messages=[{"role": "user", "content": prompt}]
    )
    content = response["message"]["content"]

    try:
        dict_start = content.find("{")
        dict_end = content.rfind("}") + 1
        dict_str = content[dict_start:dict_end]
        field_map = ast.literal_eval(dict_str)
    except Exception as e:
        print("Failed to parse field map from Ollama response:")
        print(content)
        raise e

    return field_map

def read_csv(csv_path: str) -> List[Dict[str, Any]]:
    with open(csv_path, encoding="utf-8") as f:
        reader = csv.DictReader(f)
        return list(reader)

def read_json(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)

def read_excel(path):
    df = pd.read_excel(path)
    return df.to_dict(orient="records")

def read_sqlite(path, query):
    conn = sqlite3.connect(path)
    cursor = conn.cursor()
    cursor.execute(query)
    columns = [desc[0] for desc in cursor.description]
    rows = cursor.fetchall()
    conn.close()
    return [dict(zip(columns, row)) for row in rows]

def map_row(row: Dict[str, Any], field_map: Dict[str, Any], model_fields: set) -> Dict[str, Any]:
    mapped = {}
    for src_key, tgt_key in field_map.items():
        if not tgt_key or tgt_key not in model_fields or tgt_key == "id":
            continue
        if src_key not in row:
            continue

        value = row[src_key]
        if tgt_key in {"year", "library_id", "rating", "pages_count", "quantity"}:
            if value == "" or value is None:
                value = None
            else:
                try:
                    value = int(value)
                except Exception:
                    value = None
        mapped[tgt_key] = value
    mapped.pop("id", None)
    return mapped

def insert_books(file_path: str, library_email: str):
    target_fields = [
        "id", "library_id", "title", "author", "description",
        "year", "image_url", "isbn", "genre", "rating",
        "pages_count", "publisher"
    ]

    file_type = get_file_type(file_path)

    if file_type == "csv":
        data_rows = read_csv(file_path)
        csv_header = read_csv_header(file_path)
        field_map = ask_ollama_for_field_map(csv_header, list(target_fields))
    elif file_type == "json":
        data_rows = read_json(file_path)
        if len(data_rows) > 0:
            json_keys = list(data_rows[0].keys())
        else:
            json_keys = []
        field_map = ask_ollama_for_field_map(json_keys, list(target_fields))
    elif file_type == "excel":
        data_rows = read_excel(file_path)
        if len(data_rows) > 0:
            excel_keys = list(data_rows[0].keys())
        else:
            excel_keys = []
        field_map = ask_ollama_for_field_map(excel_keys, list(target_fields))
    elif file_type == "sqlite":
        data_rows = read_sqlite(file_path, query="SELECT * FROM books")
        if len(data_rows) > 0:
            sqlite_keys = list(data_rows[0].keys())
        else:
            sqlite_keys = []
        field_map = ask_ollama_for_field_map(sqlite_keys, list(target_fields))
    else:
        raise ValueError(f"Unsupported file type: {file_type}")
    
    engine = create_engine(DATABASE_URL, echo=False)

    with Session(engine) as session:
        library_id = session.exec(select(models.Library.id).where(models.Library.email == library_email)).first()
        if not library_id:
            raise ValueError(f"Library with email '{library_email}' not found")
        
        for row in data_rows:
            data = map_row(row, field_map, Book.model_fields.keys())
            if "description" not in data or not data["description"]:
                data["description"] = "Описание отсутствует"
            if "image_url" not in data or not data["image_url"]:
                data["image_url"] = ""
            if "genre" not in data or not data["genre"]:
                data["genre"] = "Неизвестный жанр"
            if "rating" not in data or data["rating"] is None:
                data["rating"] = 0
            if "pages_count" not in data or data["pages_count"] is None:
                data["pages_count"] = 0
            if "publisher" not in data or not data["publisher"]:
                data["publisher"] = "Неизвестный издатель"
            if "year" not in data or data["year"] is None:
                data["year"] = 0
            if "isbn" not in data or not data["isbn"]:
                data["isbn"] = "Неизвестный ISBN"
            if "quantity" not in data or data["quantity"] is None:
                data["quantity"] = 1
            data["library_id"] = library_id
            book = Book(**data)
            session.add(book)
            session.commit()
            session.refresh(book)
            library_book = models.LibraryBook(library_id=book.library_id, book_id=book.id, quantity=data["quantity"])
            session.add(library_book)
        session.commit()

    print(f"Inserted {len(data_rows)} books from {file_path} into library with email '{library_email}'.")

if __name__ == "__main__":
    import sys
    if len(sys.argv) != 3:
        print("Usage: python llm_migrator.py path/to/db <library_email>")
        exit(1)
    file_path = sys.argv[1]
    library_email = sys.argv[2]

    insert_books(file_path, library_email)
