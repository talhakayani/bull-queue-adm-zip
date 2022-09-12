const Queue = require("bull");

const options = {
  defaultJobOptions: {
    backoff: {
      type: "fixed",
      delay: 50000,
    },
    attempts: 100,
    removeOnFail: true,
    removeOnComplete: true,
  },
};

const Service = {
  queues: {},

  hasQueueById(queueId = "root") {
    return !!Service.queues[queueId];
  },

  getQueueById(queueId = "root") {
    if (!Service.queues[queueId]) {
      const queue = new Queue(`piqsol_queue_${queueId}`, options);
      queue.queueId = queueId;

      queue
        // An error occured.
        .on("error", function (error) {
          const stack = error.stack || error.stacktrace || error.trace;
          console.error(
            `[Job Queue][${queueId}][error] Stack: ${stack} `,
            error
          );
        })
        // A Job is waiting to be processed as soon as a worker is idling.
        .on("waiting", function (jobId) {
          console.error(`[Job Queue][${queueId}][waiting] JobId: ${jobId}`);
        })
        // A job has started. You can use `jobPromise.cancel()`` to abort it.
        .on("active", function (job /* , jobPromise */) {
          console.error(`[Job Queue][${queueId}][active] JobId: ${job.id}`);
        })
        // A job has been marked as stalled. This is useful for debugging job
        // workers that crash or pause the event loop.
        .on("stalled", function (job) {
          console.error(`[Job Queue][${queueId}][stalled] JobId: ${job.id}`);
        })
        //   // A job's progress was updated!
        //   .on('progress', function(job, progress) {
        //     console.error('[progress] ' + job.id + progress);
        //   })
        // A job successfully completed with a `result`.
        .on("completed", function (job /* result */) {
          console.error(`[Job Queue][${queueId}][completed] JobId: ${job.id}`);
        })
        // A job failed with reason `err`!
        .on("failed", function (job, error) {
          const stack = error.stack || error.stacktrace || error.trace;
          console.error(
            `[Job Queue][${queueId}][failed] JobId: ${job.id} Stack: ${stack} `,
            error
          );
        })
        //   // The queue has been paused.
        //   .on('paused', function() {
        //     console.error('[paused] ');
        //   })
        //   // The queue has been resumed.
        //   .on('resumed', function(job) {
        //     console.error('[resumed] ' + job.id);
        //   })
        // Old jobs have been cleaned from the queue. `jobs` is an array of cleaned
        // jobs, and `type` is the type of jobs cleaned.
        .on("cleaned", function (jobs, type) {
          console.error(
            `[Job Queue][${queueId}][cleaned] Jobs: ${jobs.length} Type: ${type}`
          );
        })
        // Emitted every time the queue has processed all the waiting jobs
        // (even if there can be some delayed jobs not yet processed)
        .on("drained", function () {
          console.error(`[Job Queue][${queueId}][drained]`);
        })
        // A job successfully removed.
        .on("removed", function (job) {
          console.error(`[Job Queue][${queueId}][removed] JobId: ${job.id}`);
        });

      Service.queues[queueId] = queue;
    }
    return Service.queues[queueId];
  },
};

module.exports = Service;
