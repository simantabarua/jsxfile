const express = require("express");
const cors = require("cors");
const fs = require("fs");
const archiver = require("archiver");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // Allow all domains
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.get("/", (req, res) => {
  res.send("jsx sever is running");
});

app.post("/generate-files", async (req, res) => {
  try {
    const files = req.body.fileName
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1));

    for (const file of files) {
      // Generate the JavaScript code
      const code = `
        const ${file} = () => {
          return (
            <div>${file}</div>
          )
        }

        export default ${file};`;

      // Write the code to a file
      await fs.promises.writeFile(`${file}.jsx`, code);
      console.log(`The file ${file}.jsx has been saved!`);
    }

    // Create a zip file containing the generated files
    const zipFile = "./generated_files.zip";
    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.pipe(fs.createWriteStream(zipFile));
    files.forEach((file) => {
      archive.file(`${file}.jsx`, { name: `${file}.jsx` });
    });
    await archive.finalize();
    //remove .jsx file
    files.forEach(async (file) => {
      try {
        await fs.promises.unlink(`${file}.jsx`);
      } catch (err) {
        console.error(err);
      }
    });
    res.status(200).send("Files generated successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

// Download file
app.get("/download", (req, res) => res.download("./generated_files.zip"));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
