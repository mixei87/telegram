# from uuid import uuid4
# import pytest
#
# from src.schemas.message import MessageCreate
#
#
# def test_send_message(async_session, client):
#     user_data = {"name": "Alice", "email": "alice@example.com", "password": "secret"}
#     chat_data = {"name": "Test Chat"}
#
#     user_response = client.post("/users/", json=user_data)
#     chat_response = client.post("/chats/create_personal/", json=chat_data)
#
#     message_data = MessageCreate(
#         external_id=str(uuid4()),
#         chat_id=chat_response.json()["id"],
#         sender_id=user_response.json()["id"],
#         text="Привет!"
#     )
#
#     response = client.post("/messages/", json=message_data.model_dump())
#
#     assert response.status_code == 200
#     result = response.json()
#     assert result["text"] == "Привет!"
#     assert result["is_read"] == False
