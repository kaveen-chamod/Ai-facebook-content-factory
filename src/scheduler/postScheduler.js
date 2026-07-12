// Purpose: Automatically run the complete AI workflow on a schedule.

import cron from "node-cron";
import { runPostWorkflow } from "../services/postWorkflowService.js";

/**
 * Start the automatic scheduler.
 */
export function startPostScheduler() {

    console.log("======================================");
    console.log("AI Facebook Scheduler Started");
    console.log("======================================");

    // Every minute (testing)
    cron.schedule("* * * * *", async () => {

        console.log("");
        console.log("======================================");
        console.log("Running Scheduled Workflow");
        console.log(new Date().toLocaleString());
        console.log("======================================");

        try {

            const result = await runPostWorkflow();

            console.log("");
            console.log("Workflow completed successfully.");

            console.log(JSON.stringify(result, null, 2));

        } catch (error) {

            console.error("");

            console.error("Workflow failed.");

            console.error(error.message);

        }

    });

}