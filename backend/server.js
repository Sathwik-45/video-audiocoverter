const express = require("express");
const multer = require("multer");
const ffmpeg = require("fluent-ffmpeg");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());

// 🔧 IMPORTANT: set ffmpeg path for Render
ffmpeg.setFfmpegPath("/usr/bin/ffmpeg");

// Root route
app.get("/", (req, res) => {
  res.send("Video to Audio Converter API is running");
});

// Health check
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// Multer config (50MB limit)
const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
});

// Convert video to MP3
app.post("/convert", upload.single("video"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const inputPath = req.file.path;
  const outputPath = `${inputPath}.mp3`;

  ffmpeg(inputPath)
    .noVideo()
    .audioCodec("libmp3lame")
    .audioBitrate("128k")        // ✅ Faster, good quality
    .outputOptions([
      "-preset veryfast",        // ✅ Speed boost
      "-vn"
    ])
    .on("end", () => {
      res.download(outputPath, "audio.mp3", (err) => {
        // cleanup
        fs.unlink(inputPath, () => {});
        fs.unlink(outputPath, () => {});
      });
    })
    .on("error", (err) => {
      console.error("FFmpeg error:", err.message);
      fs.unlink(inputPath, () => {});
      return res.status(500).json({ error: "Conversion failed" });
    })
    .save(outputPath);
});

// Use Render PORT
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT}`);
});
