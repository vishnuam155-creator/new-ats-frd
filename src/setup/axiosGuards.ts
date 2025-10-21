import axios from "axios";
import { SAFE_ERROR_MESSAGE } from "@/lib/safeErrors";

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error && typeof error === "object") {
      (error as { userMessage?: string }).userMessage = SAFE_ERROR_MESSAGE;

      if (error.response && typeof error.response === "object") {
        const responseData = error.response.data as Record<string, unknown> | undefined;
        if (responseData && typeof responseData === "object") {
          responseData.userMessage = SAFE_ERROR_MESSAGE;
          if (typeof responseData.message !== "string" || responseData.message.trim().length === 0) {
            responseData.message = SAFE_ERROR_MESSAGE;
          }
        }
      }
    }

    return Promise.reject(error);
  }
);