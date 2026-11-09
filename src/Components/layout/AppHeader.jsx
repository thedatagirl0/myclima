
import React from "react";
import CitySearch from "../search/CitySearch";
import ThemeToggle from "./ThemeToggle";

function AppHeader({ theme, toggleTheme, onCitySelect }) {
    return (
        <header className="app-header">
            

            <div className="app-header-actions">
                <CitySearch onCitySelect={onCitySelect} />

                <ThemeToggle
                    theme={theme}
                    toggleTheme={toggleTheme}
                />
            </div>
        </header>
    );
}

export default AppHeader;
