
import { useState, useEffect } from "react";

function useTheme() {
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem("weather-app-theme");

        return savedTheme || "light";
    });

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);

        localStorage.setItem("weather-app-theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((currentTheme) =>
            currentTheme === "light" ? "dark" : "light"
        );
    };

    return {
        theme,
        setTheme,
        toggleTheme,
        isDark: theme === "dark",
    };
}

export default useTheme;
