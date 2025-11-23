/**
 * Calendar Integration Module
 * Fetches available time slots from Google Sheets Calendar
 */

// Calendar API endpoint (same as appointment API)
const CALENDAR_API_URL = window.GOOGLE_SHEET_URL || '';

/**
 * Fetch available time slots for a specific date from Calendar sheet
 * @param {string} dateStr - Date in DD.MM.YYYY format
 * @returns {Promise<Object>} - Time slots data
 */
async function fetchCalendarTimeSlots(dateStr) {
  if (!CALENDAR_API_URL) {
    console.error('❌ GOOGLE_SHEET_URL not configured');
    return {
      status: 'error',
      message: 'Calendar API URL not configured'
    };
  }

  try {
    const url = `${CALENDAR_API_URL}?action=getTimeSlots&date=${encodeURIComponent(dateStr)}`;
    console.log(`📅 Fetching calendar slots for ${dateStr}:`, url);

    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors'
    });

    // Note: For Google Apps Script with cors mode, we can read the response
    const data = await response.text();
    const jsonData = JSON.parse(data);

    console.log('✅ Calendar data received:', jsonData);
    return jsonData;

  } catch (error) {
    console.error('❌ Error fetching calendar slots:', error);
    return {
      status: 'error',
      message: error.toString()
    };
  }
}

/**
 * Generate time slots for a specific date using Calendar data
 * Replaces the hardcoded time slots in appointment.html
 * @param {string} dateStr - Date in DD.MM format or DD.MM.YYYY
 * @returns {Promise<Array>} - Array of time slot objects
 */
async function generateTimeSlotsFromCalendar(dateStr) {
  // Convert DD.MM to DD.MM.YYYY if needed
  let fullDateStr = dateStr;
  if (dateStr.split('.').length === 2) {
    const parts = dateStr.split('.');
    const currentYear = new Date().getFullYear();
    fullDateStr = `${parts[0]}.${parts[1]}.${currentYear}`;
  }

  // Fetch from Calendar
  const calendarData = await fetchCalendarTimeSlots(fullDateStr);

  if (calendarData.status !== 'success') {
    console.warn('⚠️ Calendar not available, using default slots');
    return generateDefaultTimeSlots();
  }

  // Convert Calendar slots to time slot array
  const timeSlots = [];
  const slots = calendarData.slots || {};

  for (const timeKey in slots) {
    const slot = slots[timeKey];

    // Only include available slots
    if (slot.available && slot.status === 'available') {
      timeSlots.push({
        time: slot.time,
        available: true,
        status: 'available'
      });
    }
  }

  console.log(`📋 Generated ${timeSlots.length} available slots from Calendar for ${fullDateStr}`);
  return timeSlots;
}

/**
 * Generate default time slots (fallback if Calendar not available)
 * @returns {Array} - Default time slots
 */
function generateDefaultTimeSlots() {
  const defaultSlots = [
    '08:00', '08:30',
    '09:00', '09:30',
    '10:00', '10:30',
    '11:00', '11:30',
    '12:00', '12:30',
    '13:00', '13:30',
    '14:00', '14:30',
    '15:00', '15:30',
    '16:00', '16:30',
    '17:00', '17:30'
  ];

  return defaultSlots.map(time => ({
    time: time,
    available: true,
    status: 'default'
  }));
}

/**
 * Check if a specific time slot is blocked in Calendar
 * @param {string} dateStr - Date in DD.MM.YYYY format
 * @param {string} timeStr - Time in HH:MM format
 * @returns {Promise<boolean>} - True if blocked, false if available
 */
async function isTimeSlotBlocked(dateStr, timeStr) {
  const calendarData = await fetchCalendarTimeSlots(dateStr);

  if (calendarData.status !== 'success') {
    return false; // If Calendar unavailable, assume not blocked
  }

  const slots = calendarData.slots || {};
  const slot = slots[timeStr];

  if (!slot) {
    return false; // Slot not found, assume available
  }

  return slot.status === 'blocked';
}

/**
 * Mark a time slot as booked in Calendar
 * Note: This requires additional Apps Script function to update Calendar
 * @param {string} dateStr - Date in DD.MM.YYYY format
 * @param {string} timeStr - Time in HH:MM format
 * @returns {Promise<Object>} - Result object
 */
async function markTimeSlotAsBooked(dateStr, timeStr) {
  // TODO: Implement Apps Script function to update Calendar sheet
  // For now, this is a placeholder
  console.log(`📝 Marking ${dateStr} ${timeStr} as booked`);

  return {
    status: 'pending',
    message: 'Manual update required in Calendar sheet'
  };
}

// Export functions for use in appointment.html
if (typeof window !== 'undefined') {
  window.CalendarAPI = {
    fetchTimeSlots: fetchCalendarTimeSlots,
    generateTimeSlots: generateTimeSlotsFromCalendar,
    isBlocked: isTimeSlotBlocked,
    markAsBooked: markTimeSlotAsBooked
  };
}
