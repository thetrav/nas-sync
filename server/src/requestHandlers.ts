import { ServerError } from "./ServerError.ts";
import express from "express";

export type Request = express.Request;
export type Response = express.Response;
export type RequestHandler = (req: Request, res: Response) => Promise<void>;
export type AppHandler<I, O> = (params: I) => O | Promise<O>;

export function get<I,O>(ah: AppHandler<I,O>): RequestHandler {
  return async (req: Request, res: Response): Promise<void> => {
    try {
       const result = await ah({...req.params, ...req.query} as I);
       res.json(result);
    } catch (error) {
      if (error instanceof ServerError) {
        res.status(error.statusCode).json({
          error: error.message,
        });
      } else {
        // Log unexpected errors
        console.error("Unexpected error:", error);

        res.status(500).json({
          error: "Internal server error",
        });
      }
    }
  };
}

export const del = get;

export function post<I,O>(ah: AppHandler<I,O>): RequestHandler {
  return async (req: Request, res: Response): Promise<void> => {
    try {
       const result = await ah(req.body as I);
       res.json(result);
    } catch (error) {
      if (error instanceof ServerError) {
        res.status(error.statusCode).json({
          error: error.message,
        });
      } else {
        // Log unexpected errors
        console.error("Unexpected error:", error);

        res.status(500).json({
          error: "Internal server error",
        });
      }
    }
  };
}

