import React from "react";

/**
 * PageBackground - Displays ambient gradient background effects
 * @param {string} color - Theme color ('red' or 'orange')
 */
export default function PageBackground({ color = "red" }) {
    // Color theme mapping for gradient backgrounds
    const colorMap = {
        red: {
            top: "bg-red-500/5",
            bottom: "bg-red-600/5",
        },
        orange: {
            top: "bg-orange-500/5",
            bottom: "bg-orange-600/5",
        },
    };

    const theme = colorMap[color] || colorMap.red;

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className={`absolute top-0 -left-4 w-[500px] h-[500px] ${theme.top} rounded-full blur-3xl`} />
            <div className={`absolute bottom-0 -right-4 w-[600px] h-[600px] ${theme.bottom} rounded-full blur-3xl`} />
        </div>
    );
}
