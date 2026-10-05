from google import genai
from dotenv import load_dotenv
import os

load_dotenv()

print("Testing Gemini 2.5 Flash...")
print("-" * 40)

for i in range(1, 8):

    key = os.getenv(f"GEMINI_API_KEY_{i}")

    if not key:
        print(f"Key {i}: NOT FOUND")
        continue

    client = None

    try:
        client = genai.Client(api_key=key)

        response = client.models.generate_content(
            model="gemini-3.8-flash",
            contents="Reply only with OK"
        )

        print(f"Key {i}: WORKING ✅")

    except Exception as e:
        print(f"Key {i}: FAILED ❌")
        print(f"Reason: {str(e)[:200]}")

    finally:
        if client:
            try:
                client.close()
            except Exception:
                pass

print("-" * 40)
print("Test completed.")