import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X } from "lucide-react";

const DatePicker = ({ value, onChange, placeholder = "Select Date", className = "" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(value ? new Date(value) : new Date());
    const containerRef = useRef(null);

    // Helper to format local date to YYYY-MM-DD
    const formatToLocalISO = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const startDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const handlePrevMonth = (e) => {
        e.stopPropagation();
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    };

    const handleNextMonth = (e) => {
        e.stopPropagation();
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    };

    const handleDateSelect = (day) => {
        const selectedDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        onChange(formatToLocalISO(selectedDate));
        setIsOpen(false);
    };

    const handleToday = (e) => {
        e.stopPropagation();
        onChange(formatToLocalISO(new Date()));
        setIsOpen(false);
    };

    const handleClear = (e) => {
        e.stopPropagation();
        onChange("");
        setIsOpen(false);
    };

    const renderCalendar = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const totalDays = daysInMonth(year, month);
        const startDay = startDayOfMonth(year, month);
        const today = formatToLocalISO(new Date());

        const days = [];
        // Fill empty slots for start of month
        for (let i = 0; i < startDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-8 w-8" />);
        }

        for (let d = 1; d <= totalDays; d++) {
            const currentFormatted = formatToLocalISO(new Date(year, month, d));
            const isSelected = value === currentFormatted;
            const isToday = today === currentFormatted;

            days.push(
                <button
                    key={d}
                    onClick={() => handleDateSelect(d)}
                    className={`h-9 w-9 flex items-center justify-center rounded-xl text-xs font-bold transition-all duration-200
                        ${isSelected ? 'bg-theme-teal text-white shadow-lg shadow-teal-500/20 scale-110' :
                            isToday ? 'bg-theme-teal/10 text-theme-teal border border-theme-teal/30' :
                                'text-theme-secondary hover:bg-white/5 hover:text-theme-primary hover:scale-105'}`}
                >
                    {d}
                </button>
            );
        }
        return days;
    };

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    // Format display value
    const displayValue = value ? new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "";

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="input-field flex items-center justify-between cursor-pointer group hover:border-theme-teal/50 transition-all duration-300"
            >
                <div className="flex items-center gap-2 overflow-hidden">
                    <CalendarIcon className={`w-4 h-4 ${value ? 'text-theme-teal' : 'text-theme-muted'} group-hover:text-theme-teal transition-colors`} />
                    <span className={`text-xs truncate ${!value ? 'text-theme-muted' : 'text-theme-primary font-medium'}`}>
                        {displayValue || placeholder}
                    </span>
                </div>
                {value && (
                    <button
                        onClick={handleClear}
                        className="p-1 rounded-full hover:bg-red-500/10 text-theme-muted hover:text-red-500 transition-all"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>

            {isOpen && (
                <div className="absolute top-[calc(100%+0.5rem)] left-0 right-0 sm:right-auto sm:w-72 bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-[100] p-4 animate-dropdown-in overflow-hidden">
                    {/* Background Glow */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-theme-teal/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-theme-teal/5 rounded-full blur-3xl pointer-events-none" />

                    {/* Header */}
                    <div className="flex items-center justify-between mb-4 relative z-10">
                        <button onClick={handlePrevMonth} className="p-1.5 rounded-lg hover:bg-white/5 text-theme-muted hover:text-theme-primary transition-all">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <div className="text-sm font-bold text-theme-primary tracking-tight">
                            {monthNames[viewDate.getMonth()]} <span className="text-theme-teal">{viewDate.getFullYear()}</span>
                        </div>
                        <button onClick={handleNextMonth} className="p-1.5 rounded-lg hover:bg-white/5 text-theme-muted hover:text-theme-primary transition-all">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Weekdays */}
                    <div className="grid grid-cols-7 gap-1 mb-2 relative z-10">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                            <div key={day} className="h-8 flex items-center justify-center text-[10px] font-bold text-theme-muted uppercase tracking-widest">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Days */}
                    <div className="grid grid-cols-7 gap-1 relative z-10">
                        {renderCalendar()}
                    </div>

                    {/* Footer */}
                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between relative z-10">
                        <button
                            onClick={handleToday}
                            className="text-[10px] font-bold text-theme-teal uppercase tracking-widest hover:bg-theme-teal/10 px-3 py-1.5 rounded-lg transition-all"
                        >
                            Today
                        </button>
                        <button
                            onClick={handleClear}
                            className="text-[10px] font-bold text-red-500/80 uppercase tracking-widest hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-all"
                        >
                            Clear
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DatePicker;
