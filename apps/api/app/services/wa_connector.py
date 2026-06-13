import httpx


class WaConnectorError(RuntimeError):
    pass


class WaConnectorClient:
    def __init__(self, base_url: str) -> None:
        self.base_url = base_url.rstrip("/")

    def start_session(self, chatbot_number_id: str) -> dict:
        return self._request("POST", f"/sessions/{chatbot_number_id}/start")

    def get_session(self, chatbot_number_id: str) -> dict:
        return self._request("GET", f"/sessions/{chatbot_number_id}/status")

    def logout_session(self, chatbot_number_id: str) -> dict:
        return self._request("POST", f"/sessions/{chatbot_number_id}/logout")

    def send_message(self, chatbot_number_id: str, to: str, message: str) -> dict:
        return self._request("POST", f"/sessions/{chatbot_number_id}/send", json={"to": to, "message": message})

    def _request(self, method: str, path: str, json: dict | None = None) -> dict:
        try:
            with httpx.Client(base_url=self.base_url, timeout=10.0) as client:
                response = client.request(method, path, json=json)
                response.raise_for_status()
                return response.json()
        except httpx.HTTPError as exc:
            raise WaConnectorError("WA connector tidak dapat dihubungi") from exc
