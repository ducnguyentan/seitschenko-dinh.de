/**
 * Google Apps Script - Appointment Data Receiver
 *
 * SETUP INSTRUCTIONS:
 * 1. Create a new Google Sheet
 * 2. Open Extensions > Apps Script
 * 3. Copy this entire code into Code.gs
 * 4. Deploy > New deployment > Web app:
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Copy the Web App URL and paste it in appointment.html (GOOGLE_SHEET_URL constant)
 *
 * SHEET STRUCTURE (New_Appointments):
 * Column A: Zeitstempel (Timestamp)
 * Column B: Symptom
 * Column C: Arzt (Doctor Name)
 * Column D: Arzt E-Mail (Doctor Email)
 * Column E: Arzt Telefon (Doctor Phone)
 * Column F: Datum (Date)
 * Column G: Zeit (Time)
 * Column H: Beschreibung (Description)
 * Column I: Sprache (Language)
 * Column J: Patient Name
 * Column K: Patient Geburtsjahr (Birth Year)
 * Column L: Patient Telefon (Phone)
 * Column M: Patient E-Mail (Email)
 */

function doPost(e) {
  try {
    // Get the active spreadsheet
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('New_Appointments');

    // Create sheet if it doesn't exist
    if (!sheet) {
      Logger.log('📋 Creating New_Appointments sheet...');
      sheet = ss.insertSheet('New_Appointments');
    }

    // Parse incoming JSON data
    var data = JSON.parse(e.postData.contents);

    // Create header row if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Zeitstempel',
        'Symptom',
        'Arzt',
        'Arzt E-Mail',
        'Arzt Telefon',
        'Datum',
        'Zeit',
        'Beschreibung',
        'Sprache',
        'Patient Name',
        'Patient Geburtsjahr',
        'Patient Telefon',
        'Patient E-Mail'
      ]);

      // Format header row (now 13 columns)
      var headerRange = sheet.getRange(1, 1, 1, 13);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#14b8a6');
      headerRange.setFontColor('#ffffff');

      // Add borders around header
      headerRange.setBorder(true, true, true, true, true, true, '#000000', SpreadsheetApp.BorderStyle.SOLID_MEDIUM);

      // Center align header text
      headerRange.setHorizontalAlignment('center');
      headerRange.setVerticalAlignment('middle');

      // Set text wrapping for header
      headerRange.setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP);

      // Set row height for header
      sheet.setRowHeight(1, 50);
    }

    // Prepare data row
    var timestamp = new Date();
    var symptom = data.symptom || '-';
    var doctor = data.doctor || '-';
    var doctorEmail = data.doctorEmail || '-'; // Will be populated later by user
    var doctorPhone = data.doctorPhone || '-'; // Will be populated later by user
    var date = data.date || '-';
    var time = data.time || '-';
    var description = data.description || '-';
    var language = data.language || 'de';
    var patientName = data.patientName || '-';
    var patientBirthYear = data.patientBirthYear || '-';
    var patientPhone = data.patientPhone || '-';
    var patientEmail = data.patientEmail || '-';

    // Append data to sheet (now 13 columns)
    var newRowNumber = sheet.getLastRow() + 1;
    sheet.appendRow([
      timestamp,
      symptom,
      doctor,
      doctorEmail,
      doctorPhone,
      date,
      time,
      description,
      language,
      patientName,
      patientBirthYear,
      patientPhone,
      patientEmail
    ]);

    // Set proper column widths (no auto-resize to prevent too narrow columns)
    if (newRowNumber === 2) {
      // First data row - set column widths once
      sheet.setColumnWidth(1, 150);  // Zeitstempel
      sheet.setColumnWidth(2, 200);  // Symptom
      sheet.setColumnWidth(3, 150);  // Arzt
      sheet.setColumnWidth(4, 200);  // Arzt E-Mail
      sheet.setColumnWidth(5, 120);  // Arzt Telefon
      sheet.setColumnWidth(6, 100);  // Datum
      sheet.setColumnWidth(7, 80);   // Zeit
      sheet.setColumnWidth(8, 250);  // Beschreibung
      sheet.setColumnWidth(9, 80);   // Sprache
      sheet.setColumnWidth(10, 180); // Patient Name
      sheet.setColumnWidth(11, 120); // Patient Geburtsjahr
      sheet.setColumnWidth(12, 150); // Patient Telefon
      sheet.setColumnWidth(13, 200); // Patient E-Mail
    }

    // Add borders around the new row (now 13 columns)
    var newRowRange = sheet.getRange(newRowNumber, 1, 1, 13);
    newRowRange.setBorder(true, true, true, true, true, true, '#000000', SpreadsheetApp.BorderStyle.SOLID);

    // Set text wrapping (CLIP to prevent multi-line display)
    newRowRange.setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);

    // Center align for better readability
    newRowRange.setVerticalAlignment('middle');

    // Alternate row colors for better visibility
    if (newRowNumber % 2 === 0) {
      newRowRange.setBackground('#f9fafb'); // Light gray for even rows
    } else {
      newRowRange.setBackground('#ffffff'); // White for odd rows
    }

    // 🔄 SYNC: Update Calendar status with doctor name
    if (date && date !== '-' && time && time !== '-' && doctor && doctor !== '-') {
      // Normalize date format to DD.MM (remove year if present, remove leading zeros)
      var normalizedDate = date;
      var dateParts = date.split('.');

      if (dateParts.length === 3) {
        // DD.MM.YYYY → DD.MM
        normalizedDate = dateParts[0] + '.' + dateParts[1];
      }

      // Remove leading zeros to match Calendar format: "05.11" → "5.11"
      if (dateParts.length >= 2) {
        var day = parseInt(dateParts[0], 10);
        var month = parseInt(dateParts[1], 10);
        normalizedDate = day + '.' + month;
      }

      Logger.log('🔄 Auto-sync triggered: ' + normalizedDate + ' ' + time + ' → ' + doctor);
      var syncSuccess = updateCalendarStatus(normalizedDate, time, doctor);

      if (syncSuccess) {
        Logger.log('✅ Calendar auto-synced successfully');
      } else {
        Logger.log('⚠️ Calendar auto-sync failed (date/time/doctor not found)');
      }
    }

    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({
        'status': 'success',
        'message': 'Appointment data saved successfully',
        'timestamp': timestamp.toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({
        'status': 'error',
        'message': error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle GET requests - Retrieve appointments by doctor and date
 * URL Parameters:
 *   - doctor: Doctor name (required)
 *   - date: Specific date (optional, format: DD.MM.YYYY)
 *   - fromDate: Start date range (optional)
 *   - toDate: End date range (optional)
 */
function doGet(e) {
  try {
    var params = e.parameter;

    // Handle calendar time slots request
    if (params && params.action === 'getTimeSlots' && params.date) {
      var slotsData = getAvailableTimeSlots(params.date);
      return ContentService
        .createTextOutput(JSON.stringify(slotsData))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // If no parameters, return status
    if (!params || !params.doctor) {
      return ContentService
        .createTextOutput(JSON.stringify({
          'status': 'online',
          'message': 'Appointment receiver is active. Use ?doctor=NAME to query appointments or ?action=getTimeSlots&date=DD.MM.YYYY for calendar.'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Get appointments for specified doctor
    var appointments = getAppointmentsByDoctor(params.doctor, params.date, params.fromDate, params.toDate);

    return ContentService
      .createTextOutput(JSON.stringify({
        'status': 'success',
        'doctor': params.doctor,
        'appointments': appointments,
        'count': appointments.length
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        'status': 'error',
        'message': error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Get appointments by doctor name and optional date filters
 */
function getAppointmentsByDoctor(doctorName, specificDate, fromDate, toDate) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  // Use getDisplayValues() to get strings as displayed in Sheet (not Date objects!)
  var data = sheet.getDataRange().getDisplayValues();

  // Skip header row
  if (data.length <= 1) {
    return [];
  }

  var appointments = [];

  // Column indices (0-based) - UPDATED for new structure with 13 columns
  var COL_TIMESTAMP = 0;
  var COL_SYMPTOM = 1;
  var COL_DOCTOR = 2;
  var COL_DOCTOR_EMAIL = 3;
  var COL_DOCTOR_PHONE = 4;
  var COL_DATE = 5;  // MOVED from 3 to 5
  var COL_TIME = 6;  // MOVED from 4 to 6
  var COL_DESCRIPTION = 7;  // MOVED from 5 to 7
  var COL_LANGUAGE = 8;  // MOVED from 6 to 8

  // Loop through data rows (skip header)
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var doctor = row[COL_DOCTOR] ? row[COL_DOCTOR].toString().trim() : '';

    // Get date and time as strings (already formatted from getDisplayValues)
    var appointmentDate = row[COL_DATE] ? row[COL_DATE].trim() : '-';
    var appointmentTime = row[COL_TIME] ? row[COL_TIME].trim() : '-';

    // Check if doctor matches (case-insensitive)
    var doctorLower = doctor.toLowerCase();
    var searchLower = doctorName.toLowerCase();

    // Skip if doctor doesn't match
    var matchIndex = doctorLower.indexOf(searchLower);
    if (matchIndex === -1) {
      continue;
    }

    // Filter by specific date if provided
    if (specificDate && appointmentDate !== specificDate) {
      continue;
    }

    // Filter by date range if provided
    if (fromDate || toDate) {
      var dateObj = parseGermanDate(appointmentDate);
      if (dateObj) {
        if (fromDate) {
          var fromDateObj = parseGermanDate(fromDate);
          if (fromDateObj && dateObj < fromDateObj) continue;
        }
        if (toDate) {
          var toDateObj = parseGermanDate(toDate);
          if (toDateObj && dateObj > toDateObj) continue;
        }
      }
    }

    // Add to results - all values already strings from getDisplayValues()
    appointments.push({
      timestamp: row[COL_TIMESTAMP] || '',
      symptom: row[COL_SYMPTOM] || '',
      doctor: doctor,
      date: appointmentDate,
      time: appointmentTime,
      description: row[COL_DESCRIPTION] || '',
      language: row[COL_LANGUAGE] || ''
    });
  }

  return appointments;
}

/**
 * Parse German date format (DD.MM.YYYY) to Date object
 */
function parseGermanDate(dateStr) {
  if (!dateStr || dateStr === '-') return null;

  var parts = dateStr.split('.');
  if (parts.length !== 3) return null;

  var day = parseInt(parts[0], 10);
  var month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
  var year = parseInt(parts[2], 10);

  return new Date(year, month, day);
}

/**
 * Format date cell to DD.MM or DD.MM.YYYY string
 */
function formatDateCell(cell) {
  if (!cell || cell === '-') return '-';

  // If already a string, return as-is
  if (typeof cell === 'string') {
    return cell.trim();
  }

  // If Date object, format to DD.MM
  if (cell instanceof Date) {
    var day = cell.getDate();
    var month = cell.getMonth() + 1;
    var dayStr = (day < 10 ? '0' : '') + day;
    var monthStr = (month < 10 ? '0' : '') + month;
    return dayStr + '.' + monthStr; // Return DD.MM format
  }

  // Fallback: convert to string
  return cell.toString().trim();
}

/**
 * TEST FUNCTION - Debug date/time formatting
 */
function testFormatting() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();

  if (data.length > 1) {
    var row = data[1]; // First data row
    var dateCell = row[3]; // COL_DATE
    var timeCell = row[4]; // COL_TIME

    Logger.log('=== DEBUG TEST ===');
    Logger.log('Date cell type: ' + typeof dateCell);
    Logger.log('Date cell value: ' + dateCell);
    Logger.log('Date cell instanceof Date: ' + (dateCell instanceof Date));

    Logger.log('Time cell type: ' + typeof timeCell);
    Logger.log('Time cell value: ' + timeCell);
    Logger.log('Time cell instanceof Date: ' + (timeCell instanceof Date));

    // Test formatting
    var formattedDate = formatDateCell(dateCell);
    var formattedTime = formatTimeCell(timeCell);

    Logger.log('Formatted date: ' + formattedDate);
    Logger.log('Formatted time: ' + formattedTime);

    return {
      dateRaw: dateCell,
      timeRaw: timeCell,
      dateFormatted: formattedDate,
      timeFormatted: formattedTime
    };
  }
}

/**
 * Format time cell to HH:MM string
 */
function formatTimeCell(cell) {
  if (!cell || cell === '-') return '-';

  // If already a string in HH:MM format, return as-is
  if (typeof cell === 'string') {
    var trimmed = cell.trim();
    if (/^\d{1,2}:\d{2}$/.test(trimmed)) {
      return trimmed;
    }
  }

  // If Date object, extract time as HH:MM
  if (cell instanceof Date) {
    var hours = cell.getHours();
    var minutes = cell.getMinutes();
    var hoursStr = (hours < 10 ? '0' : '') + hours;
    var minutesStr = (minutes < 10 ? '0' : '') + minutes;
    return hoursStr + ':' + minutesStr;
  }

  // Fallback: convert to string
  return cell.toString().trim();
}

/**
 * ========================================
 * CALENDAR SHEET MANAGEMENT
 * ========================================
 */

/**
 * Initialize Calendar sheet with SEPARATE time slots per dentist
 * Run this function once to create the Calendar sheet
 *
 * NEW STRUCTURE V2: Each dentist has their own 10 time slots
 * Header Row 1: Dentist names (merged across 10 time slots each)
 * Header Row 2: Time slots (08:00-17:00, repeated for each dentist)
 * Data Rows: 1 row per day (52 columns = 2 date + 50 time slots)
 *
 * | Datum | Wochentag | Seitschenko-Dinh (10 slots) | Kukadiya (10 slots) | ... (5 dentists)
 * |       |           | 08:00|09:00|...|17:00       | 08:00|09:00|...|17:00 |
 * | 29.11 | Montag    | avail|booked|...|blocked   | avail|avail|...|hidden |
 */
function initializeCalendarSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // Check if Calendar sheet exists, if not create it
  var calendarSheet = ss.getSheetByName('Calendar');
  if (!calendarSheet) {
    calendarSheet = ss.insertSheet('Calendar');
  } else {
    // Clear existing content
    calendarSheet.clear();
  }

  // Configuration
  var timeSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
  var dentists = ['Seitschenko-Dinh', 'Kukadiya', 'Ikikardes', 'Taifour', 'Nikolaou'];
  var dentistColors = ['#FFE5E5', '#FFE9D9', '#FFF4D9', '#E5FFE5', '#D9F4FF']; // One color per dentist

  // Header Row 1: Dentist names (each merged across 10 time slots)
  var headerRow1 = ['Datum', 'Wochentag'];
  for (var d = 0; d < dentists.length; d++) {
    for (var t = 0; t < timeSlots.length; t++) {
      headerRow1.push(dentists[d]); // Repeat dentist name 10 times (will merge later)
    }
  }

  // Header Row 2: Time slots (repeated for each dentist)
  var headerRow2 = ['', '']; // Empty for Date/Day columns
  for (var d = 0; d < dentists.length; d++) {
    for (var t = 0; t < timeSlots.length; t++) {
      headerRow2.push(timeSlots[t]);
    }
  }

  // Write both header rows
  calendarSheet.getRange(1, 1, 1, 52).setValues([headerRow1]);
  calendarSheet.getRange(2, 1, 1, 52).setValues([headerRow2]);

  // Format header row 1 (Dentist names)
  var headerRange1 = calendarSheet.getRange(1, 1, 1, 52);
  headerRange1.setFontWeight('bold');
  headerRange1.setBackground('#14b8a6');
  headerRange1.setFontColor('#ffffff');
  headerRange1.setBorder(true, true, true, true, true, true, '#000000', SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  headerRange1.setHorizontalAlignment('center');
  headerRange1.setVerticalAlignment('middle');
  headerRange1.setFontSize(10);
  calendarSheet.setRowHeight(1, 30);

  // Merge Date and Day cells vertically across both header rows
  calendarSheet.getRange(1, 1, 2, 1).mergeVertically(); // Datum
  calendarSheet.getRange(1, 2, 2, 1).mergeVertically(); // Wochentag

  // Merge dentist names horizontally across 10 time slots
  for (var d = 0; d < dentists.length; d++) {
    var startCol = 3 + (d * 10); // Each dentist gets 10 columns
    calendarSheet.getRange(1, startCol, 1, 10).merge();

    // Apply dentist-specific color to their 10 columns (both header rows)
    calendarSheet.getRange(1, startCol, 2, 10).setBackground(dentistColors[d]);
  }

  // Format header row 2 (Time slots)
  var headerRange2 = calendarSheet.getRange(2, 1, 1, 52);
  headerRange2.setFontWeight('bold');
  headerRange2.setFontColor('#000000'); // Black text for times
  headerRange2.setBorder(true, true, true, true, true, true, '#000000', SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  headerRange2.setHorizontalAlignment('center');
  headerRange2.setVerticalAlignment('middle');
  headerRange2.setFontSize(8);
  calendarSheet.setRowHeight(2, 20);

  // Set column widths
  calendarSheet.setColumnWidth(1, 100); // Datum
  calendarSheet.setColumnWidth(2, 110); // Wochentag
  // Set width for all 50 time slot columns
  for (var k = 3; k <= 52; k++) {
    calendarSheet.setColumnWidth(k, 80); // Narrower since only status values
  }

  // Generate first week (7 days) starting from today
  var today = new Date();
  addWeekToCalendar(calendarSheet, today, 1);

  // Freeze first 2 header rows
  calendarSheet.setFrozenRows(2);

  Logger.log('✅ Calendar sheet initialized with separate time slots per dentist (2 header rows, 1 row per day)');
  return 'Calendar sheet created successfully!';
}

/**
 * Add a week of dates to Calendar sheet
 * NEW STRUCTURE V2: Each day has 1 row (50 status columns for 5 dentists × 10 slots)
 *
 * @param {Sheet} sheet - The Calendar sheet
 * @param {Date} startDate - Start date of the week
 * @param {number} weekNumber - Week number for this month
 */
function addWeekToCalendar(sheet, startDate, weekNumber) {
  // Validate startDate parameter
  if (!startDate) {
    throw new Error('startDate darf nicht leer sein');
  }

  if (!(startDate instanceof Date)) {
    throw new Error('startDate muss ein Date-Objekt sein. Erhalten: ' + typeof startDate);
  }

  if (isNaN(startDate.getTime())) {
    throw new Error('startDate ist ungültig: ' + startDate);
  }

  var dayNames = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];

  // Configuration
  var dentists = ['Seitschenko-Dinh', 'Kukadiya', 'Ikikardes', 'Taifour', 'Nikolaou'];
  var timeSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

  // Colors per dentist (same as header)
  var dentistColors = ['#FFE5E5', '#FFE9D9', '#FFF4D9', '#E5FFE5', '#D9F4FF'];

  // Calculate which week of the month this is
  var firstDayOfMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  var daysSinceStart = Math.floor((startDate - firstDayOfMonth) / (1000 * 60 * 60 * 24));
  var weekOfMonth = Math.floor(daysSinceStart / 7) + 1;

  // Get month and year for separator
  var month = startDate.getMonth() + 1;
  var year = startDate.getFullYear();

  // Find the last row with data
  var lastRow = Math.max(2, sheet.getLastRow()); // At least row 2 (after headers)

  // Add separator row before EVERY week
  var separatorRow = lastRow + 1;
  var separatorLabel = '━━━ Woche ' + weekOfMonth + ' - ' + (month < 10 ? '0' : '') + month + '/' + year + ' ━━━';

  // Set separator label and format
  sheet.getRange(separatorRow, 1).setValue(separatorLabel);
  var separatorRange = sheet.getRange(separatorRow, 1, 1, 52);
  separatorRange.setBackground('#14b8a6');
  separatorRange.setFontColor('#ffffff');
  separatorRange.setFontWeight('bold');
  separatorRange.setHorizontalAlignment('center');
  separatorRange.setVerticalAlignment('middle');
  separatorRange.setFontSize(11);
  sheet.setRowHeight(separatorRow, 30);
  separatorRange.merge();

  lastRow++; // Move past separator

  // Generate 7 days, each with 1 row (50 status columns)
  for (var i = 0; i < 7; i++) {
    var date = new Date(startDate);
    date.setDate(startDate.getDate() + i);

    var day = date.getDate();
    var currentMonth = date.getMonth() + 1;
    // Use D.M format (no leading zeros, no year)
    var dateStr = day + '.' + currentMonth;
    var dayName = dayNames[date.getDay()];

    // Build row: Date | Day | 50 status columns (5 dentists × 10 slots)
    var dataRow = [dateStr, dayName];

    // For each dentist, add 10 'available' statuses (their time slots)
    for (var d = 0; d < dentists.length; d++) {
      for (var t = 0; t < timeSlots.length; t++) {
        dataRow.push('available');
      }
    }

    // Write the row
    var rowIndex = lastRow + 1;
    sheet.getRange(rowIndex, 1, 1, 52).setValues([dataRow]);

    // Format the row
    var rowRange = sheet.getRange(rowIndex, 1, 1, 52);
    rowRange.setBorder(true, true, true, true, true, true, '#000000', SpreadsheetApp.BorderStyle.SOLID);
    rowRange.setVerticalAlignment('middle');
    rowRange.setHorizontalAlignment('center');
    rowRange.setFontSize(9);
    sheet.setRowHeight(rowIndex, 30);

    // Format Date and Day columns (bold, centered)
    var dateDayRange = sheet.getRange(rowIndex, 1, 1, 2);
    dateDayRange.setFontWeight('bold');
    dateDayRange.setBackground('#f0f0f0'); // Light gray for date/day

    // Apply dentist-specific colors to their 10 columns
    for (var d = 0; d < dentists.length; d++) {
      var startCol = 3 + (d * 10); // Each dentist has 10 columns
      sheet.getRange(rowIndex, startCol, 1, 10).setBackground(dentistColors[d]);
    }

    // Add dropdown validation for all 50 status columns
    var statusDropdownRange = sheet.getRange(rowIndex, 3, 1, 50);
    var rule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['available', 'blocked', 'hidden', 'booked'], true)
      .setAllowInvalid(false)
      .build();
    statusDropdownRange.setDataValidation(rule);

    lastRow++; // Move to next day
  }

  // Apply conditional formatting
  applyCalendarConditionalFormatting(sheet, lastRow);

  Logger.log('✅ Added 7 days (7 rows) to calendar with separate time slots per dentist (week ' + weekOfMonth + ')');
}

/**
 * Apply conditional formatting to Calendar sheet
 * NEW V2: Apply to all data rows (1 row per day, 50 status columns)
 * Green = available, Red = blocked, Yellow = booked, Gray = hidden
 */
function applyCalendarConditionalFormatting(sheet, numRows) {
  // Apply to all status columns (C to AZ = columns 3 to 52)
  // 5 dentists * 10 time slots = 50 columns
  // From row 3 to numRows (skip 2 header rows + separator rows)
  var timeSlotRange = sheet.getRange(3, 3, numRows, 50);

  // Clear existing rules
  var rules = sheet.getConditionalFormatRules();
  sheet.setConditionalFormatRules([]);

  // Rule 1: Green for "available"
  var rule1 = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('available')
    .setBackground('#d1fae5') // Light green
    .setFontColor('#065f46') // Dark green
    .setRanges([timeSlotRange])
    .build();

  // Rule 2: Red for "blocked"
  var rule2 = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('blocked')
    .setBackground('#fee2e2') // Light red
    .setFontColor('#991b1b') // Dark red
    .setRanges([timeSlotRange])
    .build();

  // Rule 3: Yellow for "booked"
  var rule3 = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('booked')
    .setBackground('#fef3c7') // Light yellow
    .setFontColor('#92400e') // Dark brown
    .setRanges([timeSlotRange])
    .build();

  // Rule 4: Gray for "hidden"
  var rule4 = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('hidden')
    .setBackground('#e5e7eb') // Light gray
    .setFontColor('#6b7280') // Dark gray
    .setRanges([timeSlotRange])
    .build();

  sheet.setConditionalFormatRules([rule1, rule2, rule3, rule4]);
}

/**
 * Get available time slots for a specific date
 * Called by appointment.html via doGet()
 *
 * NEW: Read from 3-row structure (Zeit row + Status row + Arzt row)
 */
function getAvailableTimeSlots(dateStr) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var calendarSheet = ss.getSheetByName('Calendar');

  if (!calendarSheet) {
    return {
      status: 'error',
      message: 'Kalender-Blatt nicht gefunden. Bitte führen Sie zuerst initializeCalendarSheet() aus.'
    };
  }

  var data = calendarSheet.getDataRange().getDisplayValues();

  // Find the Time row for the requested date
  // NEW: Each day has 3 rows: Time row (with date) + Arzt row (dentist names) + Status row (statuses)
  // Start from row 2 (skip 2 header rows: row 0 = time slots, row 1 = dentist abbreviations)
  for (var i = 2; i < data.length; i++) {
    var rowDate = data[i][0]; // Column A: Date

    // Skip separator rows (merged cells with "━━━")
    if (rowDate.indexOf('━━━') !== -1) {
      continue;
    }

    // Skip empty date cells (Arzt/Status rows)
    if (!rowDate || rowDate.trim() === '') {
      continue;
    }

    // Normalize both dates to DD.MM format for comparison
    // Calendar stores DD.MM (e.g., "26.11"), but website may call with DD.MM.YYYY (e.g., "26.11.2025")
    var normalizedSearchDate = dateStr;
    if (dateStr.split('.').length === 3) {
      var parts = dateStr.split('.');
      normalizedSearchDate = parts[0] + '.' + parts[1]; // "26.11.2025" → "26.11"
    }

    // Found the Time row for this date
    if (rowDate === normalizedSearchDate) {
      var timeRow = data[i];      // Current row (Time values)
      var arztRow = data[i + 1];  // Next row (Dentist names)
      var statusRow = data[i + 2]; // Next row (Status values)
      var dayName = timeRow[1];    // Column B: Day name

      // 🔍 CROSS-CHECK: Get booked appointments from New_Appointments for accuracy
      var bookedAppointments = getBookedAppointmentsForDate(dateStr);
      Logger.log('📋 Booked appointments for ' + dateStr + ': ' + JSON.stringify(bookedAppointments));

      var slots = {};

      // NEW: Loop through 52 columns (10 time slots * 5 dentists = 50 columns + 2 date columns)
      // Group by time slots
      var currentTime = null;
      var dentistSlots = [];

      for (var j = 2; j < 52; j++) {
        var timeLabel = timeRow[j];     // Time from Time row (e.g., "08:00")
        var dentistName = arztRow[j];   // Dentist name from Arzt row
        var status = statusRow[j];       // Status from Status row (e.g., "available", "blocked", "hidden", "booked")

        // Skip empty time slots
        if (!timeLabel || timeLabel.trim() === '' || !dentistName || dentistName.trim() === '') {
          continue;
        }

        var cleanTime = timeLabel.trim();
        var cleanDentist = dentistName.trim();

        // Skip "hidden" slots - don't include in response
        if (status === 'hidden') {
          continue;
        }

        // Determine if this dentist is booked at this time
        var isBooked = (status === 'booked');

        // 🔍 CROSS-CHECK: Override with New_Appointments data if available
        if (bookedAppointments[cleanTime] === cleanDentist) {
          isBooked = true;
          Logger.log('✅ Cross-check override: ' + cleanTime + ' → ' + cleanDentist);
        }

        // Group dentists by time slot
        if (currentTime !== cleanTime) {
          // Save previous time slot if exists
          if (currentTime && dentistSlots.length > 0) {
            slots[currentTime] = {
              time: currentTime,
              dentists: dentistSlots.slice() // Copy array
            };
          }

          // Start new time slot
          currentTime = cleanTime;
          dentistSlots = [];
        }

        // Add this dentist to current time slot
        dentistSlots.push({
          name: cleanDentist,
          status: isBooked ? 'booked' : status,
          available: status === 'available' && !isBooked
        });
      }

      // Save last time slot
      if (currentTime && dentistSlots.length > 0) {
        slots[currentTime] = {
          time: currentTime,
          dentists: dentistSlots
        };
      }

      return {
        status: 'success',
        date: dateStr,
        dayName: dayName,
        slots: slots
      };
    }
  }

  return {
    status: 'not_found',
    message: 'Date not found in calendar: ' + dateStr
  };
}

/**
 * Add next week to Calendar sheet
 * Called when user clicks the "Thêm tuần mới" button
 */
function addNextWeek() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var calendarSheet = ss.getSheetByName('Calendar');

    if (!calendarSheet) {
      throw new Error('Kalender-Blatt nicht gefunden. Bitte führen Sie zuerst initializeCalendarSheet() aus.');
    }

    // Find the last date in the calendar (2-row structure: Zeit row has date, Status row is empty)
    var lastRow = calendarSheet.getLastRow();
    Logger.log('📊 Last row in Calendar: ' + lastRow);

    if (lastRow < 2) {
      throw new Error('Keine Daten im Kalender. Bitte führen Sie zuerst initializeCalendarSheet() aus.');
    }

    // Search backwards from last row to find the last Zeit row (has date value)
    var lastDateValue = null;
    var lastDateRow = lastRow;

    for (var row = lastRow; row >= 2; row--) {
      var cellValue = calendarSheet.getRange(row, 1).getValue();
      var cellStr = cellValue ? cellValue.toString() : '';

      // Skip separator rows
      if (cellStr.indexOf('━━━') !== -1) {
        Logger.log('⏭️ Skipping separator at row: ' + row);
        continue;
      }

      // Skip empty cells (Status rows)
      if (!cellValue || cellStr.trim() === '') {
        Logger.log('⏭️ Skipping empty cell (Status row) at row: ' + row);
        continue;
      }

      // Found a row with date value (Zeit row)
      lastDateValue = cellValue;
      lastDateRow = row;
      Logger.log('✅ Found last Zeit row at: ' + row);
      break;
    }

    Logger.log('📅 Last date value from cell: ' + lastDateValue + ' (type: ' + typeof lastDateValue + ')');

    // Validate that we have a value
    if (!lastDateValue) {
      throw new Error('Letztes Datum im Kalender nicht gefunden. Bitte überprüfen Sie die Daten.');
    }

    var lastDate;

    // If getValue() returned a Date object directly, use it
    if (lastDateValue instanceof Date && !isNaN(lastDateValue.getTime())) {
      lastDate = lastDateValue;
      Logger.log('✅ Using Date object directly: ' + lastDate);
    } else {
      // Convert to string and parse
      var lastDateStr = lastDateValue.toString();
      Logger.log('📝 Converting to string: ' + lastDateStr);

      // If it's already a Date object formatted as string by toString()
      if (lastDateStr.includes('GMT') || lastDateStr.includes('UTC')) {
        lastDate = new Date(lastDateValue);
      } else {
        // Parse the date (format: DD.MM.YYYY)
        var parts = lastDateStr.split('.');

        // Validate date format
        if (parts.length !== 3) {
          throw new Error('Ungültiges Datumsformat: ' + lastDateStr + '. Erforderlich: DD.MM.YYYY');
        }

        lastDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      }
    }

    // Validate the Date object is valid
    if (!lastDate || isNaN(lastDate.getTime())) {
      throw new Error('Datum kann nicht analysiert werden: ' + lastDateValue);
    }

    Logger.log('✅ Final parsed date: ' + lastDate.toISOString());

    // Add 1 day to get the start of next week
    var nextWeekStart = new Date(lastDate);
    nextWeekStart.setDate(lastDate.getDate() + 1);

    Logger.log('📅 Next week start date: ' + nextWeekStart.toISOString());
    Logger.log('📅 Next week start date type: ' + typeof nextWeekStart);
    Logger.log('📅 Is valid date: ' + !isNaN(nextWeekStart.getTime()));

    // Validate nextWeekStart before passing
    if (!nextWeekStart || !(nextWeekStart instanceof Date) || isNaN(nextWeekStart.getTime())) {
      throw new Error('Startdatum der neuen Woche konnte nicht erstellt werden. Letztes Datum: ' + lastDate);
    }

    // Add the next week
    addWeekToCalendar(calendarSheet, nextWeekStart, null);

    // Show alert if running from UI, otherwise just log
    try {
      SpreadsheetApp.getUi().alert('✅ Neue Woche wurde erfolgreich hinzugefügt!');
    } catch (e) {
      Logger.log('✅ Neue Woche wurde erfolgreich hinzugefügt! (Running from script editor)');
    }
    return 'Next week added successfully!';

  } catch (error) {
    Logger.log('❌ Fehler in addNextWeek: ' + error.toString());
    Logger.log('❌ Error stack: ' + error.stack);

    // Show alert if running from UI
    try {
      SpreadsheetApp.getUi().alert('❌ Fehler beim Hinzufügen der neuen Woche:\n\n' + error.toString() + '\n\nBitte überprüfen Sie die Apps Script Logs.');
    } catch (e) {
      // Running from script editor, error already logged
    }
    throw error;
  }
}

/**
 * Set up button trigger for "Add Next Week"
 * Run this once to create a clickable button
 * (DEPRECATED - Use menu instead: Kalender > Neue Woche hinzufügen)
 */
function setupCalendarButton() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var calendarSheet = ss.getSheetByName('Calendar');

  if (!calendarSheet) {
    throw new Error('Kalender-Blatt nicht gefunden. Bitte führen Sie zuerst initializeCalendarSheet() aus.');
  }

  SpreadsheetApp.getUi().alert(
    'Kalender Nutzung:\n\n' +
    '1. Um eine neue Woche hinzuzufügen, verwenden Sie das Menü:\n' +
    '   📅 Kalender > ➕ Neue Woche hinzufügen\n\n' +
    '2. Oder führen Sie die Funktion "addNextWeek" in Apps Script aus\n\n' +
    '3. Das Menü erscheint automatisch beim Öffnen der Tabelle'
  );
}

/**
 * Create custom menu for Calendar management
 * Add this to show menu in Google Sheets
 */
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('📅 Kalender')
    .addItem('🔧 Kalender initialisieren', 'initializeCalendarSheet')
    .addItem('➕ Neue Woche hinzufügen', 'addNextWeek')
    .addSeparator()
    .addItem('📋 New_Appointments erstellen', 'initializeNewAppointmentsSheet')
    .addSeparator()
    .addItem('🔄 Vollständige Synchronisierung', 'syncCalendarWithAppointments')
    .addSeparator()
    .addItem('ℹ️ Hilfe', 'showCalendarHelp')
    .addToUi();
}

/**
 * Show Calendar help dialog
 */
function showCalendarHelp() {
  var html = '<h2>Kalender Anleitung</h2>' +
    '<p><b>Zeitfenster Status:</b></p>' +
    '<ul>' +
    '<li>🟢 <b>available</b> - Verfügbar für Buchungen</li>' +
    '<li>🔴 <b>blocked</b> - Gesperrt, nicht buchbar</li>' +
    '<li>🟡 <b>booked</b> - Bereits gebucht</li>' +
    '<li>⚪ <b>hidden</b> - Ausgeblendet (nicht sichtbar für Patienten)</li>' +
    '</ul>' +
    '<p><b>Verwendung:</b></p>' +
    '<ol>' +
    '<li>Klicken Sie auf das Zeitfenster, das Sie ändern möchten</li>' +
    '<li>Wählen Sie den Status aus dem Dropdown-Menü</li>' +
    '<li>Die Farbe ändert sich automatisch</li>' +
    '</ol>';

  var htmlOutput = HtmlService.createHtmlOutput(html)
    .setWidth(450)
    .setHeight(350);

  SpreadsheetApp.getUi().showModalDialog(htmlOutput, '📅 Kalender - Hilfe');
}

/**
 * ========================================
 * SYNCHRONIZATION FUNCTIONS
 * ========================================
 */

/**
 * Update Calendar status when a new appointment is booked
 * Called automatically by doPost() after saving to New_Appointments
 *
 * @param {string} dateStr - Date in DD.MM.YYYY format (e.g., "24.11.2025")
 * @param {string} timeStr - Time in HH:MM format (e.g., "14:00")
 * @param {string} newStatus - New status: "booked", "blocked", "available"
 */
function updateCalendarStatus(dateStr, timeStr, doctorName) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var calendarSheet = ss.getSheetByName('Calendar');

    if (!calendarSheet) {
      Logger.log('⚠️ Calendar sheet not found, skipping sync');
      return false;
    }

    var data = calendarSheet.getDataRange().getDisplayValues();

    // List of dentists (must match addWeekToCalendar)
    var dentists = ['Seitschenko-Dinh', 'Kukadiya', 'IKIKARDES', 'TAIFOUR', 'NIKOLAOU'];

    // Clean doctor name for comparison (handle variations)
    var cleanDoctorName = doctorName.trim();

    // Find the time row for the date
    // Start from row 2 (skip 2 header rows)
    for (var i = 2; i < data.length; i++) {
      var rowDate = data[i][0]; // Column A: Date

      // Skip separator rows
      if (rowDate.indexOf('━━━') !== -1) {
        continue;
      }

      // Skip empty date cells (Arzt and Status rows)
      if (!rowDate || rowDate.trim() === '') {
        continue;
      }

      // Found the time row for this date
      if (rowDate === dateStr) {
        var timeRow = data[i];       // Time slot values (merged across 5 dentists each)
        var arztRow = data[i + 1];   // Arzt row (dentist names)
        var statusRowIndex = i + 3;  // Status row is 3rd row (i+2 in data array, but i+3 in sheet - 1-indexed)

        // Normalize time string (remove seconds, clean special characters)
        var cleanTimeStr = timeStr.replace(/[^0-9:]/g, ''); // Remove non-numeric, non-colon
        var timeParts = cleanTimeStr.split(':');
        if (timeParts.length >= 2) {
          cleanTimeStr = timeParts[0] + ':' + timeParts[1]; // Keep only HH:MM
        }

        Logger.log('🔍 Auto-sync: Looking for date=' + dateStr + ', time=' + cleanTimeStr + ', doctor=' + cleanDoctorName);

        // Scan through columns to find matching time AND dentist
        // NEW structure: Columns 3-52 (10 time slots * 5 dentists = 50 columns)
        for (var j = 2; j < 52; j++) {
          var cellTime = timeRow[j];
          var cellDentist = arztRow[j] ? arztRow[j].trim() : '';

          // IMPORTANT: Time headers are merged across 5 columns
          // If cellTime is empty, find the previous non-empty time
          var cleanCellTime = '';
          if (cellTime && cellTime.trim() !== '') {
            // First column of merged cell has value
            cleanCellTime = cellTime.replace(/[^0-9:]/g, '');
            var cellTimeParts = cleanCellTime.split(':');
            if (cellTimeParts.length >= 2) {
              cleanCellTime = cellTimeParts[0] + ':' + cellTimeParts[1];
            }
          } else if (j > 2) {
            // Empty cell (merged continuation) - find previous time
            for (var k = j - 1; k >= 2; k--) {
              if (timeRow[k] && timeRow[k].trim() !== '') {
                var prevTime = timeRow[k].replace(/[^0-9:]/g, '');
                var prevTimeParts = prevTime.split(':');
                if (prevTimeParts.length >= 2) {
                  cleanCellTime = prevTimeParts[0] + ':' + prevTimeParts[1];
                }
                break;
              }
            }
          }

          // Skip if no dentist name
          if (!cellDentist) {
            continue;
          }

          // Match both time AND dentist (case-insensitive for dentist name)
          var timeMatch = (cleanCellTime === cleanTimeStr);
          var dentistMatch = (cellDentist.toLowerCase() === cleanDoctorName.toLowerCase());

          if (timeMatch && dentistMatch) {
            // Found the matching time slot for this dentist!

            // Update Status row to "booked"
            var statusCell = calendarSheet.getRange(statusRowIndex, j + 1);
            statusCell.setValue('booked');

            // Color the dentist name in Arzt row (make it bold and change color)
            var arztCell = calendarSheet.getRange(i + 2, j + 1); // Arzt row (i+1 in data, i+2 in sheet)
            arztCell.setFontColor('#0369a1'); // Blue color for booked
            arztCell.setFontWeight('bold');

            Logger.log('✅ Auto-sync SUCCESS: ' + dateStr + ' ' + cleanTimeStr + ' → ' + cleanDoctorName + ' → booked');
            return true;
          }
        }

        Logger.log('⚠️ Auto-sync FAILED: Time slot or dentist not found in Calendar: ' + timeStr + ' for ' + cleanDoctorName);
        return false;
      }
    }

    Logger.log('⚠️ Date not found in Calendar: ' + dateStr);
    return false;

  } catch (error) {
    Logger.log('❌ Error updating Calendar status: ' + error.toString());
    return false;
  }
}

/**
 * Get all booked appointments for a specific date with doctor names
 * Used by getAvailableTimeSlots() to cross-check with Calendar
 *
 * @param {string} dateStr - Date in DD.MM.YYYY format
 * @return {Object} Object mapping time to doctor name (e.g., {"08:00": "Dr. Schmidt", "14:00": "Dr. Nguyen"})
 */
function getBookedAppointmentsForDate(dateStr) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var appointmentsSheet = ss.getSheetByName('New_Appointments');

    if (!appointmentsSheet) {
      return {};
    }

    var data = appointmentsSheet.getDataRange().getDisplayValues();
    var bookedAppointments = {};

    // Column indices (0-based)
    var COL_DOCTOR = 2;   // Column C: Arzt
    var COL_DATE = 5;     // Column F: Datum
    var COL_TIME = 6;     // Column G: Zeit

    // Extract DD.MM from the search date (dateStr might be DD.MM.YYYY)
    var searchDateParts = dateStr.split('.');
    var searchDayMonth = searchDateParts[0] + '.' + searchDateParts[1]; // DD.MM

    // Loop through data rows (skip header)
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var appointmentDoctor = row[COL_DOCTOR] ? row[COL_DOCTOR].trim() : '';
      var appointmentDate = row[COL_DATE] ? row[COL_DATE].trim() : '';
      var appointmentTime = row[COL_TIME] ? row[COL_TIME].trim() : '';

      if (!appointmentDate || !appointmentTime) {
        continue;
      }

      // Match both full format (DD.MM.YYYY) and short format (DD.MM)
      var appointmentDayMonth = appointmentDate.split('.')[0] + '.' + appointmentDate.split('.')[1];

      if (appointmentDate === dateStr || appointmentDayMonth === searchDayMonth) {
        bookedAppointments[appointmentTime] = appointmentDoctor || 'booked';
        Logger.log('📋 Found booked: ' + appointmentDate + ' ' + appointmentTime + ' → ' + appointmentDoctor);
      }
    }

    return bookedAppointments;

  } catch (error) {
    Logger.log('❌ Error getting booked appointments: ' + error.toString());
    return {};
  }
}

/**
 * DEPRECATED: Use getBookedAppointmentsForDate() instead
 * Get all booked times for a specific date (no doctor info)
 */
function getBookedTimesForDate(dateStr) {
  var bookedAppointments = getBookedAppointmentsForDate(dateStr);
  return Object.keys(bookedAppointments);
}

/**
 * Manual full sync: Update all Calendar slots based on New_Appointments
 * Run this manually if Calendar and New_Appointments are out of sync
 * Access via: Kalender menu > Vollständige Synchronisierung
 */
function syncCalendarWithAppointments() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var calendarSheet = ss.getSheetByName('Calendar');
    var appointmentsSheet = ss.getSheetByName('New_Appointments');

    if (!calendarSheet) {
      throw new Error('Calendar sheet nicht gefunden');
    }

    if (!appointmentsSheet) {
      throw new Error('New_Appointments sheet nicht gefunden');
    }

    Logger.log('🔄 Starting full Calendar sync...');

    var calendarData = calendarSheet.getDataRange().getDisplayValues();
    var appointmentsData = appointmentsSheet.getDataRange().getDisplayValues();

    // Build a map of all booked slots with doctor names: { "24.11.2025": {"08:00": "Dr. Schmidt", ...}, ... }
    var bookedMap = {};
    var COL_DOCTOR = 2;  // Column C: Arzt
    var COL_DATE = 5;    // Column F: Datum
    var COL_TIME = 6;    // Column G: Zeit

    for (var i = 1; i < appointmentsData.length; i++) {
      var row = appointmentsData[i];
      var doctorStr = row[COL_DOCTOR] ? row[COL_DOCTOR].trim() : 'booked';
      var dateStr = row[COL_DATE] ? row[COL_DATE].trim() : '';
      var timeStr = row[COL_TIME] ? row[COL_TIME].trim() : '';

      if (dateStr && timeStr) {
        // AGGRESSIVE clean time string - remove ALL non-numeric and non-colon characters
        var cleanTimeStr = timeStr.replace(/[^0-9:]/g, ''); // Keep only digits and colon

        // Normalize time to HH:MM format (remove seconds if present)
        // "10:00:00" → "10:00", "10:00" → "10:00"
        var timeParts = cleanTimeStr.split(':');
        if (timeParts.length >= 2) {
          cleanTimeStr = timeParts[0] + ':' + timeParts[1]; // Keep only HH:MM
        }

        // Normalize date to D.M or DD.MM format (remove leading zeros, handle both DD.MM and DD.MM.YYYY)
        var normalizedDateStr = dateStr;
        if (dateStr.split('.').length === 3) {
          // If DD.MM.YYYY, extract DD.MM
          var parts = dateStr.split('.');
          normalizedDateStr = parts[0] + '.' + parts[1]; // "26.11.2025" → "26.11"
        }

        // Remove leading zeros from day and month for consistency
        // "05.11" → "5.11", "26.11" → "26.11"
        var dateParts = normalizedDateStr.split('.');
        if (dateParts.length === 2) {
          var day = parseInt(dateParts[0], 10); // Remove leading zero
          var month = parseInt(dateParts[1], 10); // Remove leading zero
          normalizedDateStr = day + '.' + month; // "5.11" or "26.11"
        }

        if (!bookedMap[normalizedDateStr]) {
          bookedMap[normalizedDateStr] = {};
        }
        bookedMap[normalizedDateStr][cleanTimeStr] = doctorStr.toLowerCase(); // Lowercase doctor name
      }
    }

    Logger.log('📋 Booked appointments map: ' + JSON.stringify(bookedMap));

    var updatedCount = 0;

    // Loop through Calendar and update statuses
    // Start from row 2 (skip 2 header rows)
    for (var i = 2; i < calendarData.length; i++) {
      var rowDate = calendarData[i][0];

      // Skip separator rows
      if (rowDate.indexOf('━━━') !== -1) {
        continue;
      }

      // Skip empty date cells (Arzt and Status rows)
      if (!rowDate || rowDate.trim() === '') {
        continue;
      }

      // This is a Time row
      var timeRow = calendarData[i];     // Time slot headers (array index i)
      var arztRow = calendarData[i + 1]; // Arzt row (dentist names) (array index i+1)
      var statusRow = calendarData[i + 2]; // Status row (array index i+2)

      // Sheet row indices (1-based)
      var timeRowIndex = i + 1;          // Time row in sheet (convert from 0-based array to 1-based sheet)
      var arztRowIndex = i + 2;          // Arzt row in sheet
      var statusRowIndex = i + 3;        // Status row in sheet

      var dateStr = rowDate;

      // Normalize Calendar date format (remove leading zeros for consistency)
      // "05.11" → "5.11", "26.11" → "26.11"
      var normalizedCalendarDate = dateStr;
      var calendarDateParts = dateStr.split('.');
      if (calendarDateParts.length >= 2) {
        var day = parseInt(calendarDateParts[0], 10); // Remove leading zero
        var month = parseInt(calendarDateParts[1], 10); // Remove leading zero
        normalizedCalendarDate = day + '.' + month; // "5.11" or "26.11"
      }

      // Get booked appointments for this date
      var bookedAppointments = bookedMap[normalizedCalendarDate] || {};

      // Update Status row for this date
      // NEW: Loop through 52 columns (10 time slots * 5 dentists = 50 columns + 2 date columns)
      for (var j = 2; j < 52; j++) {
        var timeLabel = timeRow[j];
        var dentistName = arztRow[j];

        // IMPORTANT: Time headers are merged across 5 columns, so timeLabel might be empty for cols 2-4 of each time slot
        // If timeLabel is empty, use the previous non-empty time label (from the merged cell)
        var cleanTimeLabel = '';
        if (timeLabel && timeLabel.trim() !== '') {
          // This is the first column of a time slot (merged cell has value here)
          cleanTimeLabel = timeLabel.replace(/[^0-9:]/g, ''); // Keep only digits and colon

          // Normalize time to HH:MM format (remove seconds if present)
          var timeParts = cleanTimeLabel.split(':');
          if (timeParts.length >= 2) {
            cleanTimeLabel = timeParts[0] + ':' + timeParts[1]; // Keep only HH:MM
          }
        } else if (j > 2) {
          // Empty time label (merged cell continuation) - find the previous non-empty time
          for (var k = j - 1; k >= 2; k--) {
            if (timeRow[k] && timeRow[k].trim() !== '') {
              var prevTime = timeRow[k].replace(/[^0-9:]/g, '');
              var prevTimeParts = prevTime.split(':');
              if (prevTimeParts.length >= 2) {
                cleanTimeLabel = prevTimeParts[0] + ':' + prevTimeParts[1];
              }
              break;
            }
          }
        }

        // Skip if no dentist name (merged cells or empty)
        if (!dentistName || dentistName.trim() === '') {
          continue;
        }

        var cleanDentistName = dentistName.trim();

        var statusCell = calendarSheet.getRange(statusRowIndex, j + 1);
        var arztCell = calendarSheet.getRange(arztRowIndex, j + 1);
        var currentStatus = statusCell.getValue();

        // Determine correct status
        var correctStatus;
        var bookedDentist = bookedAppointments[cleanTimeLabel];

        // Case-insensitive comparison for dentist names
        var isMatch = false;
        if (bookedDentist) {
          var bookedDentistLower = bookedDentist.toLowerCase().trim();
          var cleanDentistLower = cleanDentistName.toLowerCase().trim();
          isMatch = (bookedDentistLower === cleanDentistLower);

        }

        if (isMatch) {
          // This specific dentist is booked at this time
          correctStatus = 'booked';

          // Color the dentist name cell
          arztCell.setFontColor('#0369a1'); // Blue color for booked
          arztCell.setFontWeight('bold');
        } else if (currentStatus === 'blocked' || currentStatus === 'hidden') {
          // Keep manually set statuses
          correctStatus = currentStatus;
        } else {
          // Not booked, not blocked → available
          correctStatus = 'available';

          // Reset dentist name formatting
          arztCell.setFontColor('#000000'); // Black color for available
          arztCell.setFontWeight('bold'); // Keep bold
        }

        // Update Status if different
        if (currentStatus !== correctStatus) {
          statusCell.setValue(correctStatus);
          updatedCount++;
        }
      }
    }

    Logger.log('✅ Sync complete! Updated ' + updatedCount + ' slots');

    // Show alert
    try {
      SpreadsheetApp.getUi().alert(
        '✅ Synchronisierung abgeschlossen!\n\n' +
        updatedCount + ' Zeitfenster wurden aktualisiert.'
      );
    } catch (e) {
      Logger.log('Running from script editor');
    }

    return 'Sync complete: ' + updatedCount + ' slots updated';

  } catch (error) {
    Logger.log('❌ Error during full sync: ' + error.toString());

    try {
      SpreadsheetApp.getUi().alert('❌ Fehler bei Synchronisierung:\n\n' + error.toString());
    } catch (e) {
      // Running from script editor
    }

    throw error;
  }
}

/**
 * Initialize New_Appointments sheet manually
 * Run this if you want to create the sheet with proper formatting
 */
function initializeNewAppointmentsSheet() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('New_Appointments');

    if (sheet) {
      SpreadsheetApp.getUi().alert(
        '⚠️ New_Appointments sheet existiert bereits!\n\n' +
        'Wenn Sie es neu erstellen möchten, löschen Sie bitte zuerst das bestehende Sheet.'
      );
      return 'Sheet already exists';
    }

    // Create sheet
    Logger.log('📋 Creating New_Appointments sheet...');
    sheet = ss.insertSheet('New_Appointments');

    // Create header row
    sheet.appendRow([
      'Zeitstempel',
      'Symptom',
      'Arzt',
      'Arzt E-Mail',
      'Arzt Telefon',
      'Datum',
      'Zeit',
      'Beschreibung',
      'Sprache',
      'Patient Name',
      'Patient Geburtsjahr',
      'Patient Telefon',
      'Patient E-Mail'
    ]);

    // Format header row (13 columns)
    var headerRange = sheet.getRange(1, 1, 1, 13);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#14b8a6');
    headerRange.setFontColor('#ffffff');
    headerRange.setBorder(true, true, true, true, true, true, '#000000', SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
    headerRange.setHorizontalAlignment('center');
    headerRange.setVerticalAlignment('middle');
    headerRange.setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP);
    sheet.setRowHeight(1, 50);

    // Set column widths for better readability
    sheet.setColumnWidth(1, 150);  // Zeitstempel
    sheet.setColumnWidth(2, 200);  // Symptom
    sheet.setColumnWidth(3, 150);  // Arzt
    sheet.setColumnWidth(4, 200);  // Arzt E-Mail
    sheet.setColumnWidth(5, 120);  // Arzt Telefon
    sheet.setColumnWidth(6, 100);  // Datum
    sheet.setColumnWidth(7, 80);   // Zeit
    sheet.setColumnWidth(8, 250);  // Beschreibung
    sheet.setColumnWidth(9, 80);   // Sprache
    sheet.setColumnWidth(10, 180); // Patient Name
    sheet.setColumnWidth(11, 120); // Patient Geburtsjahr
    sheet.setColumnWidth(12, 150); // Patient Telefon
    sheet.setColumnWidth(13, 200); // Patient E-Mail

    // Freeze header row
    sheet.setFrozenRows(1);

    Logger.log('✅ New_Appointments sheet created successfully');

    SpreadsheetApp.getUi().alert(
      '✅ New_Appointments sheet wurde erfolgreich erstellt!\n\n' +
      'Das Sheet ist jetzt bereit, Termine zu empfangen.'
    );

    return 'New_Appointments sheet created successfully';

  } catch (error) {
    Logger.log('❌ Error creating New_Appointments sheet: ' + error.toString());

    try {
      SpreadsheetApp.getUi().alert('❌ Fehler beim Erstellen:\n\n' + error.toString());
    } catch (e) {
      // Running from script editor
    }

    throw error;
  }
}

