import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Calendar } from "lucide-react";

interface CalendarDay {
  day: number | null;
  person: string | null;
  date?: Date;
}

const CleaningScheduleApp: React.FC = () => {
  // State for list of people
  const [people, setPeople] = useState<string[]>([
    "Marco",
    "Grigorij",
    "Sandy",
    "Kaloyan",
    "Hristo",
    "Nick",
  ]);

  // State for new person input
  const [newPerson, setNewPerson] = useState<string>("");

  // State for current date
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  const [startDate, setStartDate] = useState<Date>(getFixedStartDate());

  // State for date picker visibility
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);

  // State for temporary date selection in date picker
  const [tempSelectedDate, setTempSelectedDate] = useState<Date>(
    new Date(startDate)
  );

  // State for date picker's current month view
  const [datePickerMonth, setDatePickerMonth] = useState<Date>(
    new Date(startDate)
  );

  // Get a fixed start date (Jan 1, 2024 - adjust to the nearest Monday)
  function getFixedStartDate(): Date {
    const fixedDate = new Date(2025, 2, 17); // 17 March, 2024
    const day = fixedDate.getDay(); // 0 is Sunday, 1 is Monday, etc.
    const diff = fixedDate.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    const monday = new Date(fixedDate.setDate(diff));
    monday.setHours(0, 0, 0, 0); // Reset time part
    return monday;
  }

  // Get this Monday's date
  function getThisMonday(): Date {
    const today = new Date();
    const day = today.getDay(); // 0 is Sunday, 1 is Monday, etc.
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    const monday = new Date(today.setDate(diff));
    monday.setHours(0, 0, 0, 0); // Reset time part
    return monday;
  }

  // Get the nearest Monday to a date (either the date itself if it's Monday, or the next Monday)
  function getNearestMonday(date: Date): Date {
    const newDate = new Date(date);
    const day = newDate.getDay(); // 0 is Sunday, 1 is Monday, etc.

    // If it's already Monday, return the date
    if (day === 1) return newDate;

    // Otherwise, find the next Monday
    const daysUntilMonday = day === 0 ? 1 : 8 - day;
    newDate.setDate(newDate.getDate() + daysUntilMonday);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
  }

  // State for calendar days
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);

  // State for date picker days
  const [datePickerDays, setDatePickerDays] = useState<CalendarDay[]>([]);

  // Get the first day of the month (adjusted for Monday start)
  const getFirstDayOfMonth = (date: Date): number => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    // Convert from 0-6 (Sun-Sat) to 0-6 (Mon-Sun)
    return (firstDay.getDay() + 6) % 7; // 0 for Monday, 1 for Tuesday, ..., 6 for Sunday
  };

  // Get the number of days in the month
  const getDaysInMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  // Modified getPersonOnDuty function to fix rotation bugs
  // This ensures each person gets exactly 2 weeks, always starting on Monday
  const getPersonOnDuty = (date: Date): string | null => {
    if (people.length === 0) return null;

    // Create copies of the dates and set to noon to avoid DST issues
    const targetDate = new Date(date);
    targetDate.setHours(12, 0, 0, 0);

    const rotationStart = new Date(startDate);
    rotationStart.setHours(12, 0, 0, 0);

    // If the date is before our start date, return null
    if (targetDate < rotationStart) return null;

    // Find the Monday of the current week for this date
    const dayOfWeek = targetDate.getDay(); // 0 is Sunday, 1 is Monday, etc.
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Adjust for Monday-based week

    // Find the Monday of the current week
    const thisMonday = new Date(targetDate);
    thisMonday.setDate(targetDate.getDate() - daysFromMonday);
    thisMonday.setHours(12, 0, 0, 0);

    // Calculate how many days from the start Monday to this Monday
    const daysSinceStart = Math.floor(
      (thisMonday.getTime() - rotationStart.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Calculate how many Mondays have passed since the start date
    // Using Math.round for more accurate calculation with potential floating point issues
    const mondayCount = Math.round(daysSinceStart / 7);

    // Each person gets exactly 2 weeks (2 Mondays)
    const periodNumber = Math.floor(mondayCount / 2);

    // Determine which person is on duty for this period
    const personIndex = periodNumber % people.length;

    return people[personIndex];
  };

  // Function to generate calendar days
  const generateCalendarDays = (): void => {
    const firstDayOfMonth = getFirstDayOfMonth(currentDate);
    const daysInMonth = getDaysInMonth(currentDate);

    const days: CalendarDay[] = [];

    // Add empty cells for days before the start of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ day: null, person: null });
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      );
      const person = getPersonOnDuty(date);
      days.push({ day, person, date });
    }

    setCalendarDays(days);
  };

  // Function to generate date picker days
  const generateDatePickerDays = (): void => {
    const firstDayOfMonth = getFirstDayOfMonth(datePickerMonth);
    const daysInMonth = getDaysInMonth(datePickerMonth);

    const days: CalendarDay[] = [];

    // Add empty cells for days before the start of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ day: null, person: null });
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(
        datePickerMonth.getFullYear(),
        datePickerMonth.getMonth(),
        day
      );
      days.push({ day, person: null, date });
    }

    setDatePickerDays(days);
  };

  // Add a new person to the rotation
  const handleAddPerson = (): void => {
    if (newPerson.trim() === "") return;
    setPeople([...people, newPerson.trim()]);
    setNewPerson("");
  };

  // Remove a person from the rotation
  const handleRemovePerson = (index: number): void => {
    const updatedPeople = [...people];
    updatedPeople.splice(index, 1);
    setPeople(updatedPeople);
  };

  // Navigate to previous month
  const goToPreviousMonth = (): void => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  // Navigate to next month
  const goToNextMonth = (): void => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  // Navigate to previous month in date picker
  const goToPreviousPickerMonth = (): void => {
    setDatePickerMonth(
      new Date(datePickerMonth.getFullYear(), datePickerMonth.getMonth() - 1, 1)
    );
  };

  // Navigate to next month in date picker
  const goToNextPickerMonth = (): void => {
    setDatePickerMonth(
      new Date(datePickerMonth.getFullYear(), datePickerMonth.getMonth() + 1, 1)
    );
  };

  // Update calendar when people or current date changes
  useEffect(() => {
    generateCalendarDays();
  }, [people, currentDate, startDate]);

  // Update date picker calendar when date picker month changes
  useEffect(() => {
    generateDatePickerDays();
  }, [datePickerMonth]);

  // Format month and year for display
  const formatMonthYear = (date: Date): string => {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  // Get today's date
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isToday = (date?: Date): boolean => {
    if (!date) return false;
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Check if a date is a Monday
  const isMonday = (date?: Date): boolean => {
    if (!date) return false;
    return date.getDay() === 1; // 1 is Monday
  };

  // Check if a date matches the selected date in the picker
  const isSelectedDate = (date?: Date): boolean => {
    if (!date || !tempSelectedDate) return false;
    return (
      date.getDate() === tempSelectedDate.getDate() &&
      date.getMonth() === tempSelectedDate.getMonth() &&
      date.getFullYear() === tempSelectedDate.getFullYear()
    );
  };

  // Check if a date matches the start date
  const isStartDate = (date?: Date): boolean => {
    if (!date) return false;
    return (
      date.getDate() === startDate.getDate() &&
      date.getMonth() === startDate.getMonth() &&
      date.getFullYear() === startDate.getFullYear()
    );
  };

  // Format the start date for display
  const formatStartDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Set rotation to start from the current week's Monday
  const handleStartFromCurrentWeek = (): void => {
    setStartDate(getThisMonday());
    setTempSelectedDate(getThisMonday());
    setDatePickerMonth(getThisMonday());
  };

  // Reset to the fixed start date (Jan 1, 2024 or closest Monday)
  const handleResetToOriginal = (): void => {
    const fixedDate = getFixedStartDate();
    setStartDate(fixedDate);
    setTempSelectedDate(fixedDate);
    setDatePickerMonth(fixedDate);
  };

  // Handle keypress for adding a person
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") {
      handleAddPerson();
    }
  };

  // Handle date selection in date picker
  const handleDateSelection = (date?: Date): void => {
    if (!date) return;
    setTempSelectedDate(date);
  };

  // Apply selected date as start date
  const applySelectedDate = (): void => {
    // Ensure the selected date is a Monday
    const mondayDate = getNearestMonday(tempSelectedDate);
    setStartDate(mondayDate);
    setTempSelectedDate(mondayDate);
    setShowDatePicker(false);
  };

  // Close date picker without applying changes
  const cancelDateSelection = (): void => {
    setTempSelectedDate(startDate);
    setDatePickerMonth(new Date(startDate));
    setShowDatePicker(false);
  };

  // Toggle date picker visibility
  const toggleDatePicker = (): void => {
    if (!showDatePicker) {
      // When opening, reset the temp date to current start date
      setTempSelectedDate(new Date(startDate));
      setDatePickerMonth(new Date(startDate));
    }
    setShowDatePicker(!showDatePicker);
  };

  // Get current person on duty
  const getCurrentPerson = (): string | null => {
    if (people.length === 0) return null;
    return getPersonOnDuty(new Date()) || null;
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center">
            <Calendar className="mr-2" />
            Cleaning Schedule Rotation
          </h1>
        </div>

        {/* People Management */}
        <Card>
          <CardHeader>
            <CardTitle>People in Rotation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              <div className="flex flex-wrap gap-2">
                {people.map((person, index) => (
                  <div
                    key={index}
                    className="flex items-center bg-gray-100 rounded-full px-3 py-1"
                  >
                    <span>{person}</span>
                    <button
                      onClick={() => handleRemovePerson(index)}
                      className="ml-2 text-red-500 font-bold"
                      aria-label={`Remove ${person}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex">
                <input
                  type="text"
                  value={newPerson}
                  onChange={(e) => setNewPerson(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Add person"
                  className="flex-1 border rounded-l-md px-3 py-2"
                  aria-label="Add person"
                />
                <button
                  onClick={handleAddPerson}
                  className="bg-blue-500 text-white rounded-r-md px-4 py-2 hover:bg-blue-600 transition-colors"
                  aria-label="Add to rotation"
                >
                  Add
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Duty Card */}
        <Card>
          <div className="bg-blue-50 p-3 rounded-md">
            <p className="text-center mt-1">
              <strong>Current duty:</strong> {getCurrentPerson()}
            </p>
          </div>
        </Card>

        {/* Calendar */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <button
                onClick={goToPreviousMonth}
                className="bg-gray-200 rounded-md px-3 py-1 hover:bg-gray-300 transition-colors"
                aria-label="Previous month"
              >
                &lt; Prev
              </button>
              <CardTitle>{formatMonthYear(currentDate)}</CardTitle>
              <button
                onClick={goToNextMonth}
                className="bg-gray-200 rounded-md px-3 py-1 hover:bg-gray-300 transition-colors"
                aria-label="Next month"
              >
                Next &gt;
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1">
              {/* Day labels - starting with Monday */}
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                (day, index) => (
                  <div key={index} className="text-center font-semibold py-2">
                    {day}
                  </div>
                )
              )}

              {/* Calendar cells */}
              {calendarDays.map((data, index) => (
                <div
                  key={index}
                  className={`
                    min-h-16 border border-slate-300 rounded p-1 transition-colors
                    ${data.day ? "bg-white" : "bg-gray-50"}
                    ${isToday(data.date) ? "ring-2 ring-blue-400" : ""}
                    ${isStartDate(data.date) ? "ring-2 ring-green-500" : ""}
                  `}
                >
                  {data.day && (
                    <>
                      <div className="text-right text-sm">
                        {data.day}
                        {isStartDate(data.date) && (
                          <span
                            className="ml-1 inline-block h-2 w-2 bg-green-500 rounded-full"
                            title="Rotation Start Date"
                          ></span>
                        )}
                      </div>
                      {data.person && (
                        <div
                          className="mt-1 text-xs rounded-md p-1 text-center overflow-hidden"
                          style={{
                            backgroundColor: stringToColor(data.person, 0.2),
                            color: stringToColor(data.person, 1),
                          }}
                        >
                          {data.person}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Schedule Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Schedule Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">
                      Rotation Start Date (Monday):
                    </p>
                    <p className="font-medium">{formatStartDate(startDate)}</p>
                  </div>
                  <button
                    onClick={toggleDatePicker}
                    className="bg-blue-100 text-blue-800 rounded-md px-3 py-2 hover:bg-blue-200 transition-colors text-sm"
                    aria-label="Change start date"
                  >
                    {showDatePicker ? "Hide Calendar" : "Change Date"}
                  </button>
                </div>

                {/* Date Picker */}
                {showDatePicker && (
                  <div className="mt-3 border rounded-md shadow-lg p-3 bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <button
                        onClick={goToPreviousPickerMonth}
                        className="bg-gray-200 rounded-md px-3 py-1 hover:bg-gray-300 transition-colors"
                        aria-label="Previous month"
                      >
                        &lt;
                      </button>
                      <h3 className="font-medium">
                        {formatMonthYear(datePickerMonth)}
                      </h3>
                      <button
                        onClick={goToNextPickerMonth}
                        className="bg-gray-200 rounded-md px-3 py-1 hover:bg-gray-300 transition-colors"
                        aria-label="Next month"
                      >
                        &gt;
                      </button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 mb-3">
                      {/* Day labels */}
                      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                        (day, index) => (
                          <div
                            key={index}
                            className="text-center text-xs font-semibold py-1"
                          >
                            {day}
                          </div>
                        )
                      )}

                      {/* Date picker cells */}
                      {datePickerDays.map((data, index) => (
                        <div
                          key={index}
                          className={`
                            h-8 w-8 flex items-center justify-center text-sm rounded-full mx-auto cursor-pointer transition-colors
                            ${!data.day ? "invisible" : ""}
                            ${
                              isSelectedDate(data.date)
                                ? "bg-blue-500 text-white"
                                : ""
                            }
                            ${
                              isToday(data.date) && !isSelectedDate(data.date)
                                ? "border border-blue-300"
                                : ""
                            }
                            ${
                              isStartDate(data.date) &&
                              !isSelectedDate(data.date)
                                ? "ring-2 ring-blue-400"
                                : ""
                            }
                            ${
                              isMonday(data.date) && !isSelectedDate(data.date)
                                ? "font-bold"
                                : ""
                            }
                            ${
                              data.day &&
                              !isSelectedDate(data.date) &&
                              !isToday(data.date)
                                ? "hover:bg-gray-100"
                                : ""
                            }
                          `}
                          onClick={() =>
                            data.date && handleDateSelection(data.date)
                          }
                        >
                          {data.day}
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between gap-2">
                      <p className="text-xs italic flex items-center">
                        <span className="h-2 w-2 rounded-full bg-blue-500 mr-1"></span>
                        Selected date{" "}
                        {isMonday(tempSelectedDate)
                          ? "(Monday)"
                          : "(Will adjust to next Monday)"}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={cancelDateSelection}
                          className="bg-gray-200 text-gray-800 rounded-md px-3 py-1 text-sm hover:bg-gray-300 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={applySelectedDate}
                          className="bg-blue-500 text-white rounded-md px-3 py-1 text-sm hover:bg-blue-600 transition-colors"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex space-x-2 mt-2">
                  <button
                    onClick={handleStartFromCurrentWeek}
                    className="bg-blue-500 text-white rounded-md px-3 py-2 hover:bg-blue-600 transition-colors text-sm"
                    aria-label="Start from current week"
                  >
                    Start from Current Week
                  </button>
                  <button
                    onClick={handleResetToOriginal}
                    className="bg-gray-500 text-white rounded-md px-3 py-2 hover:bg-gray-600 transition-colors text-sm"
                    aria-label="Reset to original date"
                  >
                    Reset to Original
                  </button>
                </div>
              </div>
              <div className="bg-blue-50 p-3 rounded-md">
                <p className="text-sm mt-1">
                  <strong>Current duty:</strong> {getCurrentPerson()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Legend */}
        <Card>
          <CardHeader>
            <CardTitle>Current Rotation (Every 2 Weeks)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
              {people.map((person, index) => (
                <div
                  key={index}
                  className="flex items-center p-2 rounded-md"
                  style={{
                    backgroundColor: stringToColor(person, 0.2),
                    color: stringToColor(person, 1),
                  }}
                >
                  <div
                    className="w-4 h-4 rounded-full mr-2"
                    style={{ backgroundColor: stringToColor(person, 1) }}
                    aria-hidden="true"
                  ></div>
                  {person}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Helper function to convert string to consistent color
function stringToColor(str: string, opacity: number = 1): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const h = hash % 360;
  return `hsla(${h}, 70%, 40%, ${opacity})`;
}

export default CleaningScheduleApp;
