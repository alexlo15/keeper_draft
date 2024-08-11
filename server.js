import http from "http";
import fs from "fs/promises";
import path from "path";

const hostname = "127.0.0.1";
const port = 3000;

const loadRankings = async () => {
  const data = await fs.readFile("rankings.json", "utf8");
  return JSON.parse(data);
};

const server = http.createServer(async (req, res) => {
  if (req.url === "/" || req.url === "/index.html") {
    try {
      const data = await fs.readFile(path.join("", "index.html"), "utf8");
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(data);
    } catch (err) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("500 - Internal Server Error");
    }
  } else if (req.url === "/draft.js") {
    try {
      const data = await fs.readFile(path.join("", "draft.js"), "utf8");
      res.writeHead(200, { "Content-Type": "application/javascript" });
      res.end(data);
    } catch (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("404 - Not Found");
    }
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("404 - Not Found");
  }
});



const rankings = loadRankings();
localStorage.setItem('ranks', rankings);

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
