import { ServerError } from "./ServerError";
import { BunRequest } from "bun";

export function jsonResponseWrapper<T extends object>(handler: (req: BunRequest) => T | Promise<T>) {
  return async (req: BunRequest): Promise<Response> => {
    try {
      const result = await handler(req);
      return new Response(JSON.stringify(result), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      if (error instanceof ServerError) {
        return new Response(JSON.stringify({
          error: error.message
        }), {
          status: error.statusCode,
          headers: { "Content-Type": "application/json" },
        });
      } else {
        // Log unexpected errors
        console.error("Unexpected error:", error);
        
        return new Response(JSON.stringify({
          error: "Internal server error"
        }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
    }
  };
}