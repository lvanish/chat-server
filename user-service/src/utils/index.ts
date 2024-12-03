import bcrypt from "bcryptjs";

class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(
    statusCode: number,
    message: string | undefined,
    isOperational = true,
    stack = ""
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

const encryptPassword = async (password: string) => {
  const res = await bcrypt.hash(password, 12);
  return res;
};

const isPasswordMatch = async (password: string, userPassword: string) => {
  const res = await bcrypt.compare(password, userPassword);
  return res;
};

export { encryptPassword, isPasswordMatch, ApiError };
