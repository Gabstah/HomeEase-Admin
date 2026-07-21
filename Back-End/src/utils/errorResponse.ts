export const errorResponse = (statusCode: number, message: string) => ({
  success: false,
  statusCode,
  message,
});
