// Purpose: Schedule two sequential runs per day (9:00 & 18:00 America/New_York)
// and run two sequential workflows with a 60s pause between them.
import cron from "node-cron";
import { runPostWorkflow } from "../services/postWorkflowService.js";

let isRunning = false; // guard to prevent overlapping scheduled batches

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Start the automatic scheduler.
 */
export function startPostScheduler() {

    console.log("======================================");
    console.log("🚀 AI Facebook Scheduler Started (US)");
    console.log("======================================");

    // Exact cron expression: run at 09:00 and 18:00 daily
    const SCHEDULE_EXPRESSION = "0 9,18 * * *";

    console.log(`⏰ Next workflow schedule: [ ${SCHEDULE_EXPRESSION} ] (America/New_York)`);

    cron.schedule(
        SCHEDULE_EXPRESSION,
        async () => {
            if (isRunning) {
                console.warn("Scheduled batch already running. Skipping this trigger to avoid overlap.");
                return;
            }

            isRunning = true;

            console.log("");
            console.log("======================================");
            console.log("⚙️ Running Scheduled Workflow Batch (2 posts sequentially)");
            console.log(`🕒 ${new Date().toLocaleString()}`);
            console.log("======================================");

            try {
                // POST 1
                console.log("Starting post 1 of 2...");
                const result1 = await runPostWorkflow();
                if (result1 && result1.success) {
                    console.log("Post 1 completed successfully.");

                    console.log("Waiting 60s to prevent API rate limiting before post 2...");
                    await delay(60000);

                    console.log("Starting post 2 of 2...");
                    const result2 = await runPostWorkflow();
                    if (result2 && result2.success) {
                        console.log("Post 2 completed successfully.");
                    } else {
                        console.warn("Post 2 failed or returned unsuccessful result.", result2);
                    }

                } else {
                    // If first post failed, skip the second to avoid cascading errors
                    console.error("Post 1 failed; skipping post 2 to avoid further rate/API issues.", result1);
                }

                console.log("");
                console.log("✅ Scheduled batch completed.");
            } catch (error) {
                console.error("");
                console.error("❌ Scheduled batch encountered an error.");
                console.error(error && error.message ? error.message : error);
            } finally {
                isRunning = false;
            }

            console.log(`\n⏳ Waiting for next scheduled trigger...`);
        },
        {
            timezone: "America/New_York",
        }
    );

}