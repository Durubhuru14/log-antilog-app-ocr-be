# LogSolve Backend – Image-Based Math Expression Extractor

> ⚠️ **Note:** This is the **backend** of the LogSolve app.
> For the full monorepo with frontend and backend combined, visit:
> 👉 [https://github.com/Durubhuru14/LogSolve](https://github.com/Durubhuru14/LogSolve)

---

## 📦 What It Does

This backend receives a **handwritten or printed math expression image**, sends it to **Gemini (Gemma 3 27B)** via the **Google GenAI API**, and returns a **cleaned expression string** in a format similar to how humans solve log-based math problems.

---

## 🧠 AI Model & Prompt

- **Model:** Gemma 3 27B (via Gemini API)
- **Library:** `@google/genai`
- **Prompt:** Custom prompt to extract and normalize mathematical expressions (e.g., multiplication, division, power, trig, π, angle units).

### 🧪 Example Outputs

| Input Expression | Output String |
|------------------|---------------|
| 0.3173 × 0.123² ÷ sin(30°) | `0.3173,0.123^2 ÷ sin(30 deg)` |
| sin(0.328ᶜ) | `sin(0.328 rad)` |
| 2 * π ÷ cos(π radian) | `2,pi ÷ cos(pi rad)` |

---

## 🗃️ API Endpoint

### `POST /api/calc-from-image`

**Form-Data Field:**
`image` – the PNG image to process.

**Returns:**
```json
{
  "result": "0.431,0.341"
}
```

📁 Project Structure

```
backend/
├── uploads/            # Temporary image storage
├── server.js           # Express API server
├── .env                # API keys (not committed)
├── package.json
```

🔐 .env Configuration

Make a .env file in the root directory:
```bash
API_KEY="your_gemini_api_key"
```
Get your key from Google AI Studio after creating a project on Google Cloud Console.

📦 Dependencies

All required in package.json:
```json
{
  "@google/genai": "^1.6.0",
  "cors": "^2.8.5",
  "dotenv": "^16.5.0",
  "express": "^5.1.0",
  "form-data": "^4.0.3",
  "mime": "^4.0.7",
  "multer": "^2.0.1",
  "node-fetch": "^3.3.2"
}
```

🚀 Dev Scripts
```bash
npm run dev      # Run server with nodemon
npm start        # Run server normally
```

📦 Install & Run
```bash
npm install
npm run dev
```

Server runs at:
🔗 http://localhost:3000