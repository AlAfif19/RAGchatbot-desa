import re
from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class ReplyCandidate:
    answer: str
    source: str
    confidence: float | None
    faq_id: int | None = None
    retrieved_context: list[dict[str, Any]] | None = None


def tokenize(value: str) -> set[str]:
    return {token for token in re.findall(r"[a-zA-Z0-9]+", value.lower()) if len(token) > 2}


def overlap_score(query: str, candidate: str) -> float:
    query_tokens = tokenize(query)
    if not query_tokens:
        return 0.0
    candidate_tokens = tokenize(candidate)
    if not candidate_tokens:
        return 0.0
    return len(query_tokens & candidate_tokens) / len(query_tokens)


def choose_reply(message: str, faqs: list[Any], chunks: list[Any], ai_settings: dict[str, Any]) -> ReplyCandidate:
    best_faq = None
    best_faq_score = 0.0
    for faq in faqs:
        score = overlap_score(message, " ".join([faq.question, faq.answer, faq.keywords or ""]))
        if score > best_faq_score:
            best_faq = faq
            best_faq_score = score

    threshold = float(ai_settings.get("faq_threshold", 0.8))
    if best_faq is not None and best_faq_score >= threshold:
        return ReplyCandidate(
            answer=best_faq.answer,
            source="faq",
            confidence=best_faq_score,
            faq_id=best_faq.id,
            retrieved_context=[],
        )

    ranked_chunks = []
    for chunk in chunks:
        score = overlap_score(message, chunk.chunk_text)
        if score >= 0.5:
            ranked_chunks.append((score, chunk))
    ranked_chunks.sort(key=lambda item: item[0], reverse=True)

    top_k = int(ai_settings.get("top_k", 5))
    selected_chunks = ranked_chunks[:top_k]
    if selected_chunks:
        context = [
            {
                "title": chunk.data_source.title,
                "snippet": chunk.chunk_text,
                "score": score,
            }
            for score, chunk in selected_chunks
        ]
        return ReplyCandidate(
            answer=f"Berdasarkan data yang tersedia: {selected_chunks[0][1].chunk_text}",
            source="rag",
            confidence=selected_chunks[0][0],
            retrieved_context=context,
        )

    return ReplyCandidate(
        answer=str(ai_settings.get("fallback_answer") or "Informasi tersebut belum tersedia di sistem."),
        source="fallback",
        confidence=None,
        retrieved_context=[],
    )
