from copy import deepcopy
from datetime import datetime, timezone
from uuid import uuid4


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class MemoryRepository:
    def __init__(self) -> None:
        self.chatbot_numbers = [
            {
                "id": "bot-1",
                "bot_name": "Layanan Desa Sukamaju",
                "phone_number": "+62 812-3456-7001",
                "provider": "Meta Cloud API",
                "webhook_secret": "desa-sukamaju-secret",
                "status": "active",
                "connection_status": "connected",
                "updated_at": "2026-06-11T08:10:00+07:00",
            }
        ]
        self.data_sources = [
            {
                "id": "source-1",
                "title": "SOP Surat Domisili",
                "category": "Administrasi",
                "source_type": "file",
                "content_text": None,
                "file_name": "sop-surat-domisili.pdf",
                "mime_type": "application/pdf",
                "original_size": 1840000,
                "compressed_size": 1210000,
                "indexing_status": "completed",
                "updated_at": "2026-06-10T10:00:00+07:00",
            },
            {
                "id": "source-2",
                "title": "Jadwal Posyandu Juni 2026",
                "category": "Kesehatan",
                "source_type": "text",
                "content_text": "Posyandu Balita dilaksanakan setiap Rabu minggu kedua pukul 08.00 WIB.",
                "file_name": None,
                "mime_type": None,
                "original_size": 4200,
                "compressed_size": 4200,
                "indexing_status": "completed",
                "updated_at": "2026-06-09T09:00:00+07:00",
            },
        ]
        self.faqs = [
            {
                "id": "faq-1",
                "question": "Apa syarat membuat surat domisili?",
                "answer": "Warga membawa fotokopi KTP, KK, dan surat pengantar RT/RW ke kantor desa.",
                "keywords": "domisili,surat,keterangan",
                "threshold": 0.82,
                "is_active": True,
                "updated_at": "2026-06-08T11:00:00+07:00",
            }
        ]
        self.chat_logs = [
            {
                "id": "msg-1",
                "session_id": "session-1",
                "citizen_phone": "+62 813-1111-2222",
                "message_text": "Apa syarat membuat surat domisili?",
                "answer_text": "Warga membawa fotokopi KTP, KK, dan surat pengantar RT/RW ke kantor desa.",
                "answer_source": "faq",
                "confidence_score": 0.91,
                "retrieved_context": [],
                "faq_match_score": 0.91,
                "review_status": "normal",
                "created_at": "2026-06-11T09:15:00+07:00",
            },
            {
                "id": "msg-2",
                "session_id": "session-2",
                "citizen_phone": "+62 813-3333-4444",
                "message_text": "Jadwal posyandu bulan ini kapan?",
                "answer_text": "Posyandu Balita dilaksanakan Rabu minggu kedua pukul 08.00 WIB di balai desa.",
                "answer_source": "rag",
                "confidence_score": 0.84,
                "retrieved_context": [
                    {
                        "title": "Jadwal Posyandu Juni 2026",
                        "snippet": "Posyandu Balita dilaksanakan setiap Rabu minggu kedua pukul 08.00 WIB.",
                        "score": 0.87,
                    }
                ],
                "faq_match_score": None,
                "review_status": "normal",
                "created_at": "2026-06-11T09:25:00+07:00",
            },
        ]
        self.ai_settings = {
            "provider": "gemini",
            "model_name": "gemini-1.5-flash",
            "system_prompt": "Anda adalah chatbot layanan warga. Jawab hanya berdasarkan konteks.",
            "top_k": 5,
            "faq_threshold": 0.8,
            "api_key": "",
            "fallback_answer": "Informasi tersebut belum tersedia di sistem.",
        }

    def list(self, name: str) -> list[dict]:
        return deepcopy(getattr(self, name))

    def create(self, name: str, payload: dict, prefix: str) -> dict:
        item = {
            "id": f"{prefix}-{uuid4().hex[:8]}",
            **payload,
            "updated_at": now_iso(),
        }
        if name == "chatbot_numbers":
            item["connection_status"] = "connected" if item["status"] == "active" else "disconnected"
        if name == "data_sources":
            item["compressed_size"] = int((item.get("original_size") or len(item.get("content_text") or "")) * 0.72)
            item["indexing_status"] = "pending"
        getattr(self, name).insert(0, item)
        return deepcopy(item)

    def update(self, name: str, item_id: str, payload: dict) -> dict | None:
        collection = getattr(self, name)
        for index, item in enumerate(collection):
            if item["id"] == item_id:
                updated = {**item, **payload, "id": item_id, "updated_at": now_iso()}
                if name == "chatbot_numbers":
                    updated["connection_status"] = "connected" if updated["status"] == "active" else "disconnected"
                if name == "data_sources":
                    updated["compressed_size"] = int((updated.get("original_size") or len(updated.get("content_text") or "")) * 0.72)
                collection[index] = updated
                return deepcopy(updated)
        return None

    def delete(self, name: str, item_id: str) -> bool:
        collection = getattr(self, name)
        before = len(collection)
        setattr(self, name, [item for item in collection if item["id"] != item_id])
        return len(getattr(self, name)) != before


repo = MemoryRepository()
