import { withDb } from "./db";
import { ServerError } from "./ServerError";
import { BunRequest } from "bun";

export type RequestHandler = (req:BunRequest) => Promise<Response>
export type AppHandler<T> = (req: BunRequest) => T | Promise<T>;

export function dbHandler<T extends object>(handler: AppHandler<T>): RequestHandler {
  return async (req: BunRequest): Promise<Response> => {
    return withDb(req, jsonHandler(handler));
  }
}

export function jsonHandler<T extends object>(handler: AppHandler<T>) {
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