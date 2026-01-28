import { withDb } from "./db";
import { ServerError } from "./ServerError";
import { Request, Response } from "express";

export type RequestHandler = (req: Request, res: Response) => Promise<void>
export type AppHandler<T> = (req: Request) => T | Promise<T>;

export function dbHandler<T extends object>(handler: AppHandler<T>): RequestHandler {
  return async (req: Request, res: Response): Promise<void> => {
    return withDb(req, jsonHandler(handler, res));
  }
}

export function jsonHandler<T extends object>(handler: AppHandler<T>, res: Response) {
  return async (req: Request): Promise<void> => {
    try {
      const result = await handler(req);
      res.json(result);
    } catch (error) {
      if (error instanceof ServerError) {
        res.status(error.statusCode).json({
          error: error.message
        });
      } else {
        // Log unexpected errors
        console.error("Unexpected error:", error);
        
        res.status(500).json({
          error: "Internal server error"
        });
      }
    }
  };
}