
import React from "react";
import { LoaderCircle } from "lucide-react";

function LoadingState({ message = "Loading weather information..." }) {
    return (
        <div className="loading-state" role="status">
            <LoaderCircle
                className="loading-spinner"
                size={36}
            />

            <p>{message}</p>
        </div>
    );
}

export default LoadingState;
