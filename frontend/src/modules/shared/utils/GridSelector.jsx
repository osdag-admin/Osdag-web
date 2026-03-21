// GridSelector.jsx - Simple 3x3 grid with your SVGs
import React, { useState } from 'react';
import topleftsquare from "../../../assets/topleftsquare.svg";
import toprightsquare from "../../../assets/toprightsquare.svg";
import simplesquare from "../../../assets/simplesquare.svg";
import bottomleftsquare from "../../../assets/bottomleftsquare.svg";
import bottomrightsquare from "../../../assets/bottomrightsquare.svg";

const GridSelector = ({ onViewChange }) => {
  const [activeButton, setActiveButton] = useState(null);

  // Define which SVG to use for each position
  const getSquareIcon = (position) => {
    switch (position) {
      case 'top-left':
        return topleftsquare;
      case 'top-right':
        return toprightsquare;
      case 'bottom-left':
        return bottomleftsquare;
      case 'bottom-right':
        return bottomrightsquare;
      default:
        return simplesquare;
    }
  };

  // Grid layout with position identifiers
  const gridLayout = [
    ['top-left', 'simple', 'top-right'],
    ['simple', 'simple', 'simple'],
    ['bottom-left', 'simple', 'bottom-right']
  ];

  const handleButtonClick = (rowIndex, colIndex) => {
    const buttonId = `${rowIndex}-${colIndex}`;
    setActiveButton(buttonId);

    // Handle orthographic view changes for first three buttons
    if (rowIndex === 0) {
      if (colIndex === 0) {
        // First button - XY axis view (Z = 0)
        onViewChange && onViewChange('XY');
      } else if (colIndex === 1) {
        // Second button - YZ axis view (X = 0)
        onViewChange && onViewChange('YZ');
      } else if (colIndex === 2) {
        // Third button - ZX axis view (Y = 0)
        onViewChange && onViewChange('ZX');
      }
    }
    else if (rowIndex === 1) {
      if (colIndex === 0) {
        onViewChange && onViewChange('ANGLE1');  // Middle-left: Diagonal top-right
      } else if (colIndex === 1) {
        onViewChange && onViewChange('ANGLE2');  // Middle-center: Diagonal top-left
      } else if (colIndex === 2) {
        onViewChange && onViewChange('ANGLE3');  // Middle-right: Bottom-right angled
      }
    }
    else if (rowIndex === 2) {
      if (colIndex === 0) {
        onViewChange && onViewChange('ANGLE4');
      } else if (colIndex === 1) {
        onViewChange && onViewChange('ANGLE5');
      } else if (colIndex === 2) {
        onViewChange && onViewChange('ANGLE6');
      }
    } 
  };

  const getButtonTitle = (rowIndex, colIndex) => {
    if (rowIndex === 0) {
      return ['XY Axis View', 'YZ Axis View', 'ZX Axis View'][colIndex];
    } else if (rowIndex === 1) {
      return ['Diagonal Top-Right', 'Diagonal Top-Left', 'Bottom-Right Angled'][colIndex];
    } else {
      return ['Bottom-Left Elevated', 'High Angle Behind', 'Side Angle Behind'][colIndex];
    }
  };

  return (
    <div className="canvas-control-bar-overlay-right">
      <div className="grid-3x3">
        {gridLayout.map((row, rowIndex) =>
          row.map((position, colIndex) => {
            const buttonId = `${rowIndex}-${colIndex}`;
            const isActive = activeButton === buttonId;
            
            return (
              <button
                key={buttonId}
                className={`grid-button ${isActive ? 'active' : ''}`}
                onClick={() => handleButtonClick(rowIndex, colIndex)}
                title={getButtonTitle(rowIndex, colIndex)}
              >
                <img
                  src={getSquareIcon(position)}
                  alt={`Grid ${position}`}
                  className="grid-icon"
                />
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default GridSelector;