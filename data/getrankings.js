import puppeteer from "puppeteer";
import fs from "fs";

const getQuotes = async () => {
  // Start a Puppeteer session with:
  // - a visible browser (`headless: false` - easier to debug because you'll see the browser in action)
  // - no default viewport (`defaultViewport: null` - website page will in full width and height)
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });

  // Open a new page
  const page = await browser.newPage();

  // On this new page:
  // - open the "http://quotes.toscrape.com/" website
  // - wait until the dom content is loaded (HTML is ready)
  await page.goto(
    "https://www.fantasypros.com/nfl/rankings/ppr-cheatsheets.php",
    {
      waitUntil: "domcontentloaded",
    }
  );

  await page.waitForSelector(".fp-id-26352");

  // Get page data
  const rankings = await page.evaluate(() => {
    // Fetch the first element with class "quote"
    const row = document.querySelectorAll(".player-row");

    let ranks = [];

    row.forEach((el) => {
      // Fetch the sub-elements from the previously fetched quote element
      // Get the displayed text and return it (`.innerText`)
      ranks.push({
        rank: el.querySelector(".sticky-cell-one").innerText,
        name: el.querySelector(".player-cell-name").innerText,
        posrank:
          el.querySelector(".player-cell").parentElement.nextSibling.innerText,
        byewk:
          el.querySelector(".player-cell").parentElement.nextSibling.nextSibling
            .innerText,
      });
    });

    return ranks;
  });

  // Display the quotes
  console.log(rankings);

  fs.writeFile("rankings.json", JSON.stringify(rankings, null, 2), (err) => {
    if (err) throw err;
    console.log("JSON file has been saved.");
  });

  // Close the browser
  await browser.close();
};

// Start the scraping
getQuotes();

// //Load HTTP module
// const http = require("http");
// const hostname = "127.0.0.1";
// const port = 3000;

// //Create HTTP server and listen on port 3000 for requests
// const server = http.createServer((req, res) => {
//   //Set the response HTTP header with HTTP status and Content type
//   res.statusCode = 200;
//   res.setHeader("Content-Type", "text/plain");
//   res.end("Hello World\n");
// });

// //listen for request on port 3000, and as a callback function have the port listened on logged
// server.listen(port, hostname, () => {
//   console.log(`Server running at http://${hostname}:${port}/`);

// });
