import type { FlightSearchParams, FlightSearchResponse } from "@/types/flight";

export class FlightSearchError extends Error {
  constructor(
    message: string,
    public status?: number
  ) {
    super(message);
    this.name = "FlightSearchError";
  }
}

export async function searchFlights(
  params: FlightSearchParams
): Promise<FlightSearchResponse> {
  let response: Response;

  try {
    response = await fetch("/api/flights/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
  } catch {
    throw new FlightSearchError("Network error — please check your connection.");
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new FlightSearchError(
      body?.error ?? `Request failed with status ${response.status}`,
      response.status
    );
  }

  const data: FlightSearchResponse = await response.json();
  return data;
}
