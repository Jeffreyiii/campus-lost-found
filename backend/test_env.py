from dotenv import load_dotenv
import os

load_dotenv(override=True)

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

print("=== 读取结果 ===")
print("SUPABASE_URL:", url)
print("SUPABASE_KEY:", key)