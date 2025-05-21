import React from "react";

export const MediaTypeSwitcher = ({ selectedMediaType, onSelectMediaType }) => {
  return (
    <div style={{marginBottom: "20px", display: "flex", gap: "10px", borderBottom: "1px solid #ccc",paddingBottom: "10px",}}>
      {["movie", "tv", "all"].map((type) => (
        <button
          key={type}
          onClick={() => onSelectMediaType(type)}
          style={{padding: "8px 15px", cursor: "pointer",
            backgroundColor: selectedMediaType === type ? "#007bff" : "#f0f0f0",
            color: selectedMediaType === type ? "white" : "black",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        >
          {type === "movie" ? "Filmy" : type === "tv" ? "Seriale" : "Wszystko"}
        </button>
      ))}
    </div>
  );
};
