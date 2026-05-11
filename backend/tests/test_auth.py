"""
Tests Auth – Unit tests cho auth module.

Chạy: pytest tests/test_auth.py
"""
import pytest


# ---------------------------------------------------------------------------
# Test register
# ---------------------------------------------------------------------------

def test_password_min_length():
    """Kiểm tra validator password_min_length trong RegisterRequest."""
    from app.schemas.auth_schemas import RegisterRequest
    from pydantic import ValidationError

    with pytest.raises(ValidationError):
        RegisterRequest(username="testuser", email="test@test.com", password="short")


def test_username_min_length():
    """Kiểm tra validator username_min_length trong RegisterRequest."""
    from app.schemas.auth_schemas import RegisterRequest
    from pydantic import ValidationError

    with pytest.raises(ValidationError):
        RegisterRequest(username="ab", email="test@test.com", password="password123")


def test_valid_register_request():
    """Kiểm tra RegisterRequest hợp lệ."""
    from app.schemas.auth_schemas import RegisterRequest

    req = RegisterRequest(username="testuser", email="test@test.com", password="password123")
    assert req.username == "testuser"
    assert req.email == "test@test.com"


# ---------------------------------------------------------------------------
# Test security
# ---------------------------------------------------------------------------

def test_password_hash_and_verify():
    """Kiểm tra hash và verify password."""
    from app.core.security import hash_password, verify_password

    plain = "MySecretPassword123"
    hashed = hash_password(plain)

    assert hashed != plain
    assert verify_password(plain, hashed)
    assert not verify_password("WrongPassword", hashed)


def test_create_and_decode_access_token():
    """Kiểm tra tạo và giải mã JWT token."""
    from app.core.security import create_access_token, decode_access_token

    data = {"sub": "test-user-id-123"}
    token = create_access_token(data)

    assert isinstance(token, str)
    payload = decode_access_token(token)
    assert payload["sub"] == "test-user-id-123"
