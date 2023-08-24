class AppError extends Error {
  public readonly name: string;

  public readonly httpCode: number;

  constructor(name: string, httpCode: number, description: string) {
    super(description);

    Object.setPrototypeOf(this, new.target.prototype);

    this.name = name;
    this.httpCode = httpCode;

    Error.captureStackTrace(this);
  }
}

export default AppError;
