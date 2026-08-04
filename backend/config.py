"""
Shared configuration for the backend (Supabase, environment variables).
"""
import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
SERVICE_ROLE_KEY = os.environ.get("SERVICE_ROLE_KEY")
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Need to set SUPABASE_URL and SUPABASE_KEY in .env file")
