const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://ephemeral-platypus-47038b.netlify.app",
    ],
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post("/create-watchlist", (req, res) => {
  const { watchList, author } = req.body;
  if (!watchList || !author) {
    return res.status(400).send("Missing parameters");
  }

  const currentDate = new Date()
    .toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replace(/\//g, "-");

  // Use regex to match ticker patterns like 'ABCI' or 'ABCD'
  const tickerRegex = /\b[A-Z]{3,4}\b/g;
  const tickers = watchList.match(tickerRegex);

  if (!tickers) {
    return res.status(400).send("No tickers found");
  }

  const content = tickers.join(",");
  const fileName = `${author}-${currentDate}.txt`;
  const filePath = path.join(__dirname, fileName);

  fs.writeFile(filePath, content, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error writing file");
    }

    res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");
    res.setHeader("Content-disposition", `attachment; filename=${fileName}`);

    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error sending file");
      }

      // Delete the file after sending it to the client
      fs.unlink(filePath, (err) => {
        if (err) console.error(`Error deleting ${filePath}:`, err);
      });
    });
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
