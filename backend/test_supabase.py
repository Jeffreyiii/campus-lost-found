from dotenv import load_dotenv
import os
from supabase import create_client

load_dotenv()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

print("URL:", repr(url))
print("KEY:", repr(key))

client = create_client(url, key)
res = client.table("lost_items").select("*").limit(1).execute()
print("查询结果：", res.data)