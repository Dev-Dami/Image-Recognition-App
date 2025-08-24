const express = require("express");
const path = require("path");
const multer = require("multer");
require("dotenv").config();
const fs = require("fs");
const axios = require("axios");
const sharp = require("sharp");

const port = process.env.PORT || 3000;
const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

const upload = multer({ dest: "uploads/" });
const uploadsDir = path.join(__dirname, "uploads");

if (!fs.existsSync(path.join(__dirname, "public/uploads"))) {
  fs.mkdirSync(path.join(__dirname, "public/uploads"));
}

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/upload", upload.single("image"), async (req, res) => {
  if (!req.file) return res.send("No file uploaded");

  try {
    const uniqueName = `${Date.now()}-${
      path.parse(req.file.originalname).name
    }.png`;
    const targetPath = path.join(__dirname, "public/uploads", uniqueName);

    // Resize and convert to PNG, save directly
    await sharp(req.file.path).resize(224, 224).png().toFile(targetPath);

    const pngBuffer = fs.readFileSync(targetPath);

    const response = await axios({
      method: "post",
      url: "https://api-inference.huggingface.co/models/microsoft/resnet-50",
      headers: {
        Authorization: `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
        "Content-Type": "application/octet-stream",
      },
      data: pngBuffer,
    });

    if (response.data.error)
      return res.send(`API Error: ${response.data.error}`);

    res.render("result", {
      predictions: response.data,
      imageUrl: `/uploads/${uniqueName}`,
    });
  } catch (err) {
    console.error(err);
    res.send("Error processing image.");
  }
});

// Clean up temporary files
fs.readdirSync(uploadsDir).forEach((file) => {
  const filePath = path.join(uploadsDir, file);
  if (fs.lstatSync(filePath).isFile()) {
    fs.unlinkSync(filePath);
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
