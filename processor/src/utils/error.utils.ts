type ErrorLog = {
  message: string;
  status?: number;
  statusCode?: number;
  code?: string;
  field?: string;
};

export const toErrorLog = (error: unknown): ErrorLog => {
  if (typeof error !== 'object' || error === null) {
    return { message: String(error) };
  }

  const { message, status, statusCode, code, field } = error as Partial<ErrorLog>;

  return { message: String(message), status, statusCode, code, field };
};
