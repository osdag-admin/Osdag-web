import React, { useState, useEffect } from 'react';

// Add onSelect prop and update the submit button
function CustomizedPopup({ onClose, initialData, onSelect }) {
  const [availableItems, setAvailableItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
const [property, setProperty] = useState('class'); // Default property

  // Data for different properties
  const data = {
    thickness: ['8', '10', '12', '14', '16', '18', '20', '22','24', '27', '30', '33', '36', '39', '42', '45', '48', '52', '56', '60', '64'],
    diameter: ['8', '10', '12', '14', '16', '18', '20','22' ,'24', '27', '30', '33', '36', '39', '42', '45', '48', '52', '56', '60', '64'], // Corrected
    propertyClass: ['3.6', '4.6', '4.8', '5.6', '5.8', '6.8', '8.8', '9.8', '10.9', '12.9'] // Corrected
  };

  // Update available items when property changes
  const handlePropertyChange = (newProperty) => {
    setProperty(newProperty);
    setAvailableItems(data[newProperty]);
    setSelectedItems([]); // Reset selected items
  };

  // Populate availableItems with initialData when the component mounts or initialData changes
  useEffect(() => {
    if (initialData && initialData.length > 0) {
      setAvailableItems(initialData);
    }
  }, [initialData]);

  const moveItems = (source, setSource, target, setTarget, itemsToMove) => {
    setSource(source.filter((item) => !itemsToMove.includes(item)));
    setTarget([...target, ...itemsToMove]);
  };

  const handleMoveRight = () => {
    const selected = Array.from(document.querySelector('#available-list').selectedOptions).map((opt) => opt.value);
    moveItems(availableItems, setAvailableItems, selectedItems, setSelectedItems, selected);
  };

  const handleMoveLeft = () => {
    const selected = Array.from(document.querySelector('#selected-list').selectedOptions).map((opt) => opt.value);
    moveItems(selectedItems, setSelectedItems, availableItems, setAvailableItems, selected);
  };

  const handleSubmit = () => {
    onSelect(selectedItems);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-md w-[600px] relative">{/* Cross Button */}

{/* Cross Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          ✖
        </button>

        <h2 className="text-lg font-bold mb-4">Customized</h2>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="font-medium mb-2 block">Available:</label>
            <select
              id="available-list"
              multiple
              className="border rounded-md p-2 h-60 w-full overflow-y-auto"
            >
              {availableItems.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

{/* Buttons */}
          <div className="flex flex-col justify-center gap-2">
            <button
              onClick={handleMoveRight}
              className="bg-[#996B6B] text-white px-2 py-1 rounded hover:bg-[#875e5e]"
            >
              {'>>'}
            </button>
<button
              onClick={handleMoveRight}
              className="bg-[#996B6B] text-white px-2 py-1 rounded hover:bg-[#875e5e]"
            >
              {'>'}
            </button>
            <button
              onClick={handleMoveLeft}
              className="bg-[#996B6B] text-white px-2 py-1 rounded hover:bg-[#875e5e]"
            >
              {'<'}
            </button>
            <button
              onClick={handleMoveLeft}
              className="bg-[#996B6B] text-white px-2 py-1 rounded hover:bg-[#875e5e]"
            >
              {'<<'}
            </button>
          </div>

          <div className="flex-1">
            <label className="font-medium mb-2 block">Selected:</label>
            <select
              id="selected-list"
              multiple
              className="border rounded-md p-2 h-60 w-full overflow-y-auto"
            >
              {selectedItems.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={handleSubmit}
            className="bg-[#996B6B] text-white px-4 py-2 rounded hover:bg-[#875e5e] transition-colors"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

export default CustomizedPopup;