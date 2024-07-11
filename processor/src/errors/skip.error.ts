class SkipError extends Error {
  statusCode: number;
  message: string;

  constructor(message: string) {
    super(message);
    this.statusCode = 200;
    this.message = message;
  }
}

export default SkipError;
