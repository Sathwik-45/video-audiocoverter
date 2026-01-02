const express = require("express");
const multer = require("multer");
const ffmpeg = require("fluent-ffmpeg");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());

// storage for uploaded files
const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 50 * 1024 * 1024 // ✅ 50 MB
  },
});

// convert video to audio
app.post("/convert", (req, res) => {
  upload.single("video")(req, res, (err) => {

    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          error: "File too large. Max allowed size is 50 MB."
        });
      }
      return res.status(500).json({ error: "Upload error" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const inputPath = req.file.path;
    const outputPath = `${inputPath}.mp3`;

    ffmpeg(inputPath)
      .toFormat("mp3")
      .on("end", () => {
        res.download(outputPath, "audio.mp3", () => {
          fs.unlinkSync(inputPath);
          fs.unlinkSync(outputPath);
        });
      })
      .on("error", () => {
        res.status(500).json({ error: "Conversion failed" });
      })
      .save(outputPath);
  });
});


app.listen(5000, () => {
  console.log("✅ Backend running on http://localhost:5000");
});
