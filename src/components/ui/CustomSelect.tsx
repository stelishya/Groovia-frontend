import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface CustomSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: string[];
    placeholder?: string;
    className?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ value, onChange, options, placeholder = "Select...", className }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSelect = (option: string) => {
        onChange(option);
        setIsOpen(false);
    };

    return (
        <div className={`relative inline-block text-left ${className}`} ref={containerRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full rounded-md border border-purple-300 bg-purple-700 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
                <span className="truncate pr-2">{value || placeholder}</span>
                <ChevronDown className="-mr-1 ml-2 h-4 w-4" aria-hidden="true" />
            </button>

            {isOpen && (
                <div className="absolute right-0 z-10 mt-2 w-full origin-top-right rounded-md bg-purple-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none max-h-60 overflow-y-auto no-scrollbar border border-purple-600">
                    <div className="py-1">
                        <button
                            onClick={() => handleSelect('')}
                            className={`block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-purple-700 hover:text-white ${value === '' ? 'bg-purple-700' : ''}`}
                        >
                            {placeholder}
                        </button>
                        {options.map((option) => (
                            <button
                                key={option}
                                onClick={() => handleSelect(option)}
                                className={`flex w-full items-center justify-between px-4 py-2 text-sm text-gray-200 hover:bg-purple-700 hover:text-white ${value === option ? 'bg-purple-700 text-white' : ''}`}
                            >
                                <span className="truncate">{option}</span>
                                {value === option && <Check className="h-4 w-4" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomSelect;
