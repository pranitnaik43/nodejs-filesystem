const express = require("express");
const cors = require("cors");
const fileSerices = require("./Services/file.services");

const app = express();

const PORT = (process.env.PORT) ? (process.env.PORT) : 3001;

app.use(cors());
app.use(express.json());

app.get("/files", (req, res) => fileSerices.getFilesFromGivenDirectory(req, res));
app.post("/create-file", (req, res) => fileSerices.createFileInGivenDirectory(req, res));

app.listen(PORT, () => {
  console.log("Server running at port "+PORT);
});