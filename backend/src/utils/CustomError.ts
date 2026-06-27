export class CustomError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    
    // Restore prototype chain
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

