import { runPostWorkflow } from '../src/services/postWorkflowService.js';

const result = await runPostWorkflow();

console.log(JSON.stringify(result, null, 2));