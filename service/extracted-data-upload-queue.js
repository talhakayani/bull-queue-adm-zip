const Queue = require("./queue");
const fs = require("fs");

const uploadExtracedDataQueue = Queue.getQueueById("extracted-data-upload");

const UploadExtracedDataQueue = {
  async run(job) {
    try {
      const { extractedDestination } = job.data;
      const destinationExists = fs.existsSync(extractedDestination);
      console.log(
        "🚀 ~ file: extracted-data-upload-queue.js ~ line 11 ~ run ~ destinationExists",
        destinationExists
      );

      if (!destinationExists) {
        console.log("Destination not exists retrying");
        return false;
      }

      fs.rm(
        extractedDestination,
        { recursive: true, force: true, maxRetries: 10 },
        (err) => {
          if (err) {
            console.log(
              "🚀 ~ file: extracted-data-upload-queue.js ~ line 23 ~ fs.rmdir ~ err",
              err
            );
            return false;
          }
        }
      );
    } catch (err) {
      console.log(
        "🚀 ~ file: extracted-data-upload-queue.js ~ line 23 ~ run ~ err",
        err
      );
      return false;
    }
  },
  async add(data, jobId) {
    return uploadExtracedDataQueue.add("extracted-data-upload", data, {
      jobId,
    });
  },
};

uploadExtracedDataQueue.process(
  "extracted-data-upload",
  1,
  UploadExtracedDataQueue.run.bind(UploadExtracedDataQueue)
);

module.exports = UploadExtracedDataQueue;
