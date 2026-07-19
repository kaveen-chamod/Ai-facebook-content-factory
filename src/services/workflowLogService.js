// Purpose: Provide structured logging for the automated content factory workflow.
// Fully Indestructible Hybrid Design: Supports positional, destructured, and direct Error objects.

import { randomUUID } from "crypto";
import { supabase } from "./supabaseService.js";

const VALID_STATUSES = ["success", "failed", "info"];

function validateStep(step) {
  if (!step || typeof step !== "string") {
    throw new Error(`Workflow log step is required and must be a string. Received: ${typeof step}`);
  }
}

function validateStatus(status) {
  if (!VALID_STATUSES.includes(status)) {
    throw new Error(`Invalid workflow log status: ${status}. Valid statuses are ${VALID_STATUSES.join(", ")}.`);
  }
}

async function insertWorkflowLog({ workflow_id, post_id = null, step, status, message = null }) {
  validateStep(step);
  validateStatus(status);

  const workflowId = workflow_id && String(workflow_id).trim().length > 0
    ? String(workflow_id)
    : randomUUID();

  const payload = {
    workflow_id: workflowId,
    post_id: post_id ?? null,
    step: step.trim(),
    status,
    message: message != null ? String(message) : null,
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("workflow_logs")
    .insert(payload)
    .select()
    .single();

  if (error) {
    throw new Error(`Workflow log insert failed: ${error.message}`);
  }

  return data;
}

/**
 * Advanced Helper: Smartly extracts strings and messages from any argument signature.
 */
function parseArgs(arg1, arg2, arg3, arg4) {
  // Scenario 1: Named Object Argument -> logFailure({ workflow_id, step, message, post_id })
  if (arg1 && typeof arg1 === "object" && !(arg1 instanceof Error) && !Array.isArray(arg1)) {
    return {
      workflow_id: arg1.workflow_id,
      post_id: arg1.post_id ?? null,
      step: typeof arg1.step === 'string' ? arg1.step : "Workflow Error",
      message: arg1.message ? String(arg1.message) : null
    };
  }
  
  // Scenario 2: Positional Arguments -> logFailure(workflowId, ...)
  const workflow_id = arg1;
  let step = "Workflow Failed";
  let message = null;
  let post_id = null;

  if (arg2 instanceof Error) {
    // Pattern: logFailure(workflowId, errorObject)
    step = "Workflow Failed";
    message = arg2.message;
  } else if (typeof arg2 === "string") {
    step = arg2;
    if (arg3 instanceof Error) {
      // Pattern: logFailure(workflowId, "Step Name", errorObject)
      message = arg3.message;
    } else if (arg3) {
      // Pattern: logFailure(workflowId, "Step Name", "Message String")
      message = String(arg3);
    }
  }

  if (arg4 && (typeof arg4 === "string" || typeof arg4 === "number")) {
    post_id = arg4;
  }

  return { workflow_id, step, message, post_id };
}

export async function logSuccess(arg1, arg2, arg3, arg4) {
  const args = parseArgs(arg1, arg2, arg3, arg4);
  return insertWorkflowLog({ ...args, status: "success" });
}

export async function logFailure(arg1, arg2, arg3, arg4) {
  const args = parseArgs(arg1, arg2, arg3, arg4);
  return insertWorkflowLog({ ...args, status: "failed" });
}

export async function logInfo(arg1, arg2, arg3, arg4) {
  const args = parseArgs(arg1, arg2, arg3, arg4);
  return insertWorkflowLog({ ...args, status: "info" });
}