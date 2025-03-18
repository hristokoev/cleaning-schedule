import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Calendar } from "lucide-react";

interface CalendarDay {
  day: number | null;
  person: string | null;
  date?: Date;
}

const CleaningScheduleApp: React.FC = () => {
  // State for list of people/rooms
  const [people, setPeople] = useState<string[]>([
    "Marco",
    "Hristo",
    "Kaloyan",
    "Grigorij",
    "Sandy",
  ]);

  // State for new person input
  const [newPerson, setNewPerson] = useState<string>("");

  // State for current date
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  // State for calendar days
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);

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

  // Get person on rotation for a specific date
  const getPersonOnDuty = (date: Date): string | null => {
    if (people.length === 0) return null;

    // Start from the first Monday of 2025
    const startDate = new Date(2025, 2, 12); // January 6, 2025 is a Monday

    // Find the Monday of the current week
    const currentDate = new Date(date);
    const currentDay = currentDate.getDay(); // 0 is Sunday, 1 is Monday, etc.
    const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1; // Adjust for our Monday-based week

    // Go back to the most recent Monday
    const currentMonday = new Date(currentDate);
    currentMonday.setDate(currentMonday.getDate() - daysFromMonday);
    currentMonday.setHours(0, 0, 0, 0); // Reset time part

    // Calculate how many days have passed from our start date to this Monday
    const daysSinceStart = Math.floor(
      (currentMonday.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)
    );

    // Calculate which two-week period this Monday falls into (0-based)
    const twoWeekPeriodNumber = Math.floor(daysSinceStart / 14);

    // Determine which person is on duty for this period
    const personIndex = twoWeekPeriodNumber % people.length;

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

  // Update calendar when people or current date changes
  useEffect(() => {
    generateCalendarDays();
  }, [people, currentDate]);

  // Format month and year for display
  const formatMonthYear = (date: Date): string => {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  // Get today's date
  const today = new Date();
  const isToday = (date?: Date): boolean => {
    if (!date) return false;
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Handle keypress for adding a person
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") {
      handleAddPerson();
    }
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
            <CardTitle>People/Rooms in Rotation</CardTitle>
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
                  placeholder="Add person or room"
                  className="flex-1 border rounded-l-md px-3 py-2"
                  aria-label="Add person or room name"
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
                  `}
                >
                  {data.day && (
                    <>
                      <div className="text-right text-sm">{data.day}</div>
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
