export const SAFE_ERROR_MESSAGE = "We hit a snag. Please try again in a moment.";

const maybeParseJson = (value: unknown): unknown => {
  if (typeof value !== "string") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
};

export const getDataMessage = (
  data: unknown,
  fallback: string = SAFE_ERROR_MESSAGE
): string => {
  const parsed = maybeParseJson(data);

  if (parsed && typeof parsed === "object") {
    const message =
      (parsed as { message?: unknown; detail?: unknown; error?: unknown }).message ??
      (parsed as { message?: unknown; detail?: unknown; error?: unknown }).detail ??
      (parsed as { message?: unknown; detail?: unknown; error?: unknown }).error;

    if (typeof message === "string" && message.trim().length > 0) {
      return message;
    }
  }

  return fallback;
};

export const getErrorMessage = (
  error: unknown,
  fallback: string = SAFE_ERROR_MESSAGE
): string => {
  if (!error) {
    return fallback;
  }

  if (typeof error === "string" && error.trim().length > 0) {
    return error;
  }

  if (typeof error === "object") {
    const withMessage = error as { message?: unknown; userMessage?: unknown; data?: unknown; response?: { data?: unknown } };

    if (typeof withMessage.userMessage === "string" && withMessage.userMessage.trim().length > 0) {
      return withMessage.userMessage;
    }

    const responseMessage = getDataMessage(withMessage.response?.data, "");
    if (responseMessage) {
      return responseMessage;
    }

    const dataMessage = getDataMessage(withMessage.data, "");
    if (dataMessage) {
      return dataMessage;
    }

    if (typeof withMessage.message === "string" && withMessage.message.trim().length > 0) {
      return withMessage.message;
    }
  }

  return fallback;
};