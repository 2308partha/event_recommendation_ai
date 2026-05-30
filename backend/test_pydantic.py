import sys
from models.user_model import UserCreateModel
from pydantic import ValidationError

try:
    user = UserCreateModel(
        clerk_user_id='123',
        name='Test',
        email='test@test.com',
        image_url='https://example.com',
        role='student'
    )
    print("Success:", user)
except ValidationError as e:
    print('ValidationError:', e)
    sys.exit(1)
