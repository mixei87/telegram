async def test_create_user(user_service):
    user = await user_service.create_user("Alice", "alice@example.com", "secret")

    assert user.name == "Alice"
    assert user.email == "alice@example.com"
    assert user.id is not None
