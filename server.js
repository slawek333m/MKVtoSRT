import express from "express";
import multer from "multer";
import { extract } from "mkv-extract";
import fs from "fs";
import { execSync } from "child_process";

const app = express();
const upload = multer({ dest: "uploads/" });

// 🔥 Twój tłumacz SRT (tu wstawiasz własną funkcję)
async function translateSRT(text, targetLang = "pl") {
  // tu wstawiasz swój tłumacz
  return text; // na razie zwracamy bez zmian
}

app.post("/extract", upload.single("file"), async (req, res) => {
  try {
    const mkvPath = req.file.path;

    // 1. Wyciągamy napisy ASS
    const assPath = mkvPath + ".ass";
    await extract(mkvPath, { tracks: ["subtitles"], output: assPath });

    // 2. Konwersja ASS → SRT (ffmpeg)
    const srtPath = mkvPath + ".srt";
    execSync(`ffmpeg -i ${assPath} ${srtPath}`);

    // 3. Wczytujemy SRT
    let srtText = fs.readFileSync(srtPath, "utf8");

    // 4. Tłumaczenie
    const translated = await translateSRT(srtText, "pl");

    // 5. Zwracamy gotowy SRT
    res.setHeader("Content-Type", "text/plain");
    res.send(translated);

    // 6. Sprzątanie
    fs.unlinkSync(mkvPath);
    fs.unlinkSync(assPath);
    fs.unlinkSync(srtPath);

  } catch (err) {
    console.error(err);
    res.status(500).send("Błąd podczas przetwarzania pliku");
  }
});

app.listen(3000, () => console.log("Serwer działa na porcie 3000"));
