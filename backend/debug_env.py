import os
from pathlib import Path
from dotenv import dotenv_values

BASE_DIR = Path('.')
env_path = BASE_DIR / '.env'
print(f'.env path exists: {env_path.exists()} at {env_path.absolute()}')

env_dict = dotenv_values(env_path)
print(f'EMAIL_HOST_USER in .env: {bool(env_dict.get("EMAIL_HOST_USER"))}')
print(f'EMAIL_HOST_PASSWORD in .env: {bool(env_dict.get("EMAIL_HOST_PASSWORD"))}')

print(f'EMAIL_HOST_USER in os.environ: {bool(os.environ.get("EMAIL_HOST_USER"))}')
print(f'EMAIL_HOST_PASSWORD in os.environ: {bool(os.environ.get("EMAIL_HOST_PASSWORD"))}')

print('Checking if values match...')
print(f'User match: {env_dict.get("EMAIL_HOST_USER") == os.environ.get("EMAIL_HOST_USER")}')
print(f'Password match: {env_dict.get("EMAIL_HOST_PASSWORD") == os.environ.get("EMAIL_HOST_PASSWORD")}')
