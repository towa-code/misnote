from uuid import UUID

from pydantic import BaseModel, EmailStr, Field, field_validator

# bcrypt が受け付ける上限。日本語は UTF-8 で 1 文字 3 バイトなので、
# 文字数ではなくバイト数で見ないと 72 文字でも上限を超える。
MAX_PASSWORD_BYTES = 72


class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    name: str = Field(min_length=1)

    @field_validator("password")
    @classmethod
    def password_fits_bcrypt(cls, value: str) -> str:
        if len(value.encode("utf-8")) > MAX_PASSWORD_BYTES:
            raise ValueError(f"password must be at most {MAX_PASSWORD_BYTES} bytes")
        return value


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: UUID
    email: str
    name: str

    model_config = {"from_attributes": True}
