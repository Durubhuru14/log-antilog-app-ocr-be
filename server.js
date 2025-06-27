import "dotenv/config";
import express from "express";
import multer from "multer";
import fs from "fs/promises";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(
  cors({
    origin: "*",
  })
);

app.get("/", (req, res) => {
  res.send(
    "Welcome to the Math Expression Extractor API! Use POST /api/calc-from-image with an image file."
  );
});

const ai = new GoogleGenAI({
  apiKey: process.env.API_KEY,
});
const model = "gemma-3-27b-it";

app.post("/api/calc-from-image", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image provided" });

    const imagePath = req.file.path;
    const imageBytes = await fs.readFile(imagePath);

    const contents = [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              data: imageBytes.toString("base64"),
              mimeType: "image/png",
            },
          },
          {
            text: `You are a mathematical expression extractor.
Read the handwritten or printed math expression from the image. The expression may include:
1. Multiplication terms:
    - Symbols: *, x, ×, or implicit
    - Example: 0.3173 * 0.123 → 0.3173,0.123
2. Division terms:
    - Keywords: "divided by", or symbols: / or ÷
    - Treat the first division point as the split between numerator and denominator
3. Powers:
    - Written as “to the power”, or "^"
    - Example: 0.123 to the power 2 → 0.123^2
4. Trigonometric functions:
    - sin, cos, tan
    - With angles: sin(30°), sin(pi rad), cos(2ᶜ)
5. Angle units:
    - Degrees: "°", "deg", "degree" → normalize to "deg"
    - Radians: "rad", "radian", or a superscript "c" (e.g., $2^c$, $0.328^c$) → normalize to "rad"
6. Constants:
    - "π", "pi", "Pi" → always convert to "pi" in output
Output Should Be like the following:
A single string like this:
term1,term2,... ÷ term1,term2,...
- Terms before division = multiplication group
- Terms after division = division group
- No extra symbols like "*", "c", or "π"
Examples:
- Input: 0.3173 * 0.123 power to 2 divided by sin(30°)
  Output: "0.3173,0.123^2 ÷ sin(30 deg)"
- Input: 2 * π divided by cos(π radian)
  Output: "2,pi ÷ cos(pi rad)"
- Input: sin(2ᶜ) * 0.5 divided by tan(pi)
  Output: "sin(2 rad),0.5 ÷ tan(pi)"
- Input: cos(0.323ᶜ) / 0.1
  Output: "cos(0.323 rad) ÷ 0.1"
- Input: sin(0.328ᶜ)
  Output: "sin(0.328 rad)"
- Input: tan(5ᶜ)
  Output: "tan(5 rad)"
- Input: 1.5 divided by tan(45 degree)
  Output: "1.5 / tan(45 deg)"

Do NOT evaluate anything. Just normalize and return the cleaned expression exactly as described.
Return only the string, no explanation.`,
          },
        ],
      },
    ];

    console.log("📥 Image uploaded:", imagePath);
    console.log("🤖 Sending request to Gemini...");

    const response = await ai.models.generateContentStream({
      model,
      contents,
      config: { responseMimeType: "text/plain" },
    });

    let finalResult = "";
    for await (const chunk of response) {
      if (chunk.text) {
        console.log("📤 AI Chunk:", chunk.text);
        finalResult += chunk.text;
      } else {
        console.log("⚠️ Skipped non-text chunk");
      }
    }

    const result = finalResult.trim();
    console.log("✅ Done. Result:", result);
    await fs.unlink(imagePath);

    res.json({ result });
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ error: "Failed to process image" });
  }
});

app.listen(3000, () => {
  console.log("🚀 Server running at http://localhost:3000");
});
