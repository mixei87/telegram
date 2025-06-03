async def test_create_chat(chat_service):
    chat = await chat_service.create_personal_chat(name="Test Chat")
    assert chat.id > 0
    assert chat.name == "Test Chat"
