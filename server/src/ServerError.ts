export class ServerError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.name = "ServerError";
    this.statusCode = statusCode;
  }
}
