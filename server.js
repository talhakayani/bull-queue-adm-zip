const AdmZip = require("adm-zip");
const fs = require("fs");
const UploadExtracedDataQueue = require("./service/extracted-data-upload-queue");

async function extractArchive(filepath) {
  try {
    const zip = new AdmZip(filepath);
    const extractedDestination = `./images/${new Date().getTime()}`;
    zip.extractAllToAsync(extractedDestination);
    console.log("processing...");

    setTimeout(() => {
      UploadExtracedDataQueue.add(
        { extractedDestination },
        Math.floor(Math.random() * 9999) + 1
      );
    }, 3000);
    console.log(`Extracted to "${extractedDestination}" successfully`);
  } catch (e) {
    console.log(`Something went wrong. ${e}`);
  }
}

async function main() {
  await extractArchive("./sample2.zip");
}

main();
