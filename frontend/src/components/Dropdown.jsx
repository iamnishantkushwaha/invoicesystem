import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const Dropdown = ({ options, value, onChange, placeholder, className = "" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const selectedOption = options.find(opt => opt._id === value);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={`dropdown-container ${className}`} ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`input-field dropdown-trigger flex items-center justify-between transition-all duration-300 ${isOpen ? 'border-theme-teal ring-1 ring-theme-teal/20 shadow-lg shadow-teal-500/10' : 'hover:border-theme-teal/50'}`}
            >
                <span className={selectedOption ? "text-theme-primary" : "text-theme-muted"}>
                    {selectedOption ? selectedOption.name : placeholder}
                </span>
                <ChevronDown className={`w-4 h-4 text-theme-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="dropdown-menu">
                    <div
                        className={`dropdown-option ${value === "" ? "selected" : ""}`}
                        onClick={() => {
                            onChange("");
                            setIsOpen(false);
                        }}
                    >
                        {placeholder}
                    </div>
                    {options.map((opt) => (
                        <div
                            key={opt._id}
                            className={`dropdown-option ${value === opt._id ? "selected" : ""}`}
                            onClick={() => {
                                onChange(opt._id);
                                setIsOpen(false);
                            }}
                        >
                            {opt.name}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dropdown;
