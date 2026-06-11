from pathlib import Path


SUPPORTED_TEXT_EXTENSIONS = {".txt", ".md", ".csv"}
SUPPORTED_TEXT_MIME_TYPES = {"text/plain", "text/markdown", "text/csv"}


def is_supported_text_file(filename: str, content_type: str | None) -> bool:
    extension = Path(filename).suffix.lower()
    return extension in SUPPORTED_TEXT_EXTENSIONS or (content_type or "").lower() in SUPPORTED_TEXT_MIME_TYPES


def decode_text_file(content: bytes) -> str:
    return content.decode("utf-8-sig").strip()


def chunk_text(text: str, chunk_size: int = 900, overlap: int = 120) -> list[str]:
    normalized = " ".join(text.split())
    if not normalized:
        return []

    chunks: list[str] = []
    start = 0
    while start < len(normalized):
        end = min(start + chunk_size, len(normalized))
        chunks.append(normalized[start:end])
        if end == len(normalized):
            break
        start = max(0, end - overlap)
    return chunks


def estimate_token_count(text: str) -> int:
    return max(1, len(text.split()))
