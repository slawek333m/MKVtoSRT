import express from "express";
import multer from "multer";
import { extract } from "mkv-extract";
import fs from "fs";
import { convert } from "subtitle-converter";


const app = express();
const upload = multer({ dest: "uploads/" });

// 🔥 Twój tłumacz SRT (tu wstawiasz własną funkcję)
async function translateSRT(text, targetLang = "pl") {
  return text; // na razie bez tłumaczenia
}

app.post("/extract", upload.single("file"), async (req, res) => {
  try {
    const mkvPath = req.file.path;

    // 1. Wyciągamy napisy ASS
    const assPath = mkvPath + ".ass";
    await extract(mkvPath, { tracks: ["subtitles"], output: assPath });

    // 2. Konwersja ASS → SRT (bez FFmpeg)
    const assContent = fs.readFileSync(assPath, "utf8");
    const srtText = await convert(assContent, { format: "srt" });

    // 3. Tłumaczenie
    const translated = await translateSRT(srtText, "pl");

    // 4. Zwracamy gotowy SRT
    res.setHeader("Content-Type", "text/plain");
    res.send(translated);

    // 5. Sprzątanie
    fs.unlinkSync(mkvPath);
    fs.unlinkSync(assPath);

  } catch (err) {
    console.error(err);
    res.status(500).send("Błąd podczas przetwarzania pliku");
  }
});

app.listen(3000, () => console.log("Serwer działa na porcie 3000"));
