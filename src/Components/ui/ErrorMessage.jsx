
import React from "react";
import { AlertCircle } from "lucide-react";

function ErrorMessage({
    message = "Something went wrong. Please try again.",
    onRetry,
}) {
    return (
        <div className="error-message" role="alert">
            <AlertCircle size={24} />

            <p>{message}</p>

            {onRetry && (
                <button
                    type="button"
                    onClick={onRetry}
                >
                    Try Again
                </button>
            )}
        </div>
    );
}

export default ErrorMessage;
