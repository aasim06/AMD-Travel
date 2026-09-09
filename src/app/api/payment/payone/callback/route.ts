/**
 * PAYONE Callback Route (Alias to /api/payment/payone/webhook)
 * Handles both legacy callback paths and new webhook URLs interchangeably.
 */
export { POST, GET, dynamic } from "../webhook/route";
