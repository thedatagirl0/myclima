
import React from "react";
import { Sun, Moon } from "lucide-react";

function ThemeToggle({ theme, toggleTheme }) {
    const isDark = theme === "dark";

    return (
        <div className={`toggle ${isDark ? "dark" : "light"}`}>
            <input
                type="checkbox"
                checked={isDark}
                onChange={toggleTheme}
                aria-label="Toggle dark mode"
            />

            <label>
                <Sun
                    className="toggle-sun"
                    size={17}
                    color={isDark ? "#fbbf24" : "#fbbf24"}
                    fill={isDark ? "#fbbf24" : "#fbbf24"}
                />
                <Moon
                    className="toggle-moon"
                    size={17}
                    color={isDark ? "#93c5fd" : "#7dd3fc"}
                    fill={isDark ? "#93c5fd" : "#7dd3fc"}
                />
            </label>
        </div>
    );
}

export default ThemeToggle;
