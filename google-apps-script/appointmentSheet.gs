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
    if (date && date !== '-' && time && time !== '-') {
      // Convert date to full format if needed (DD.MM → DD.MM.YYYY)
      var fullDate = date;
      if (date.split('.').length === 2) {
        // Date is DD.MM, add current year
        var currentYear = new Date().getFullYear();
        fullDate = date + '.' + currentYear;
        Logger.log('📅 Converted date format: ' + date + ' → ' + fullDate);
      }

      // Use doctor name as status (instead of generic "booked")
      var doctorStatus = doctor || 'booked';

      Logger.log('🔄 Syncing Calendar: ' + fullDate + ' ' + time + ' → ' + doctorStatus);
      var syncSuccess = updateCalendarStatus(fullDate, time, doctorStatus);
      if (syncSuccess) {
        Logger.log('✅ Calendar synchronized successfully with doctor: ' + doctorStatus);
      } else {
        Logger.log('⚠️ Calendar sync failed (date/time not found in Calendar)');
        Logger.log('⚠️ Looking for: Date=' + fullDate + ', Time=' + time);
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
 * Initialize Calendar sheet with flexible time slots
 * Run this function once to create the Calendar sheet
 *
 * NEW STRUCTURE: Each day has 3 rows
 * Row 1 (Zeit): User can edit time values (e.g., 08:00, 09:00, ...)
 * Row 2 (Status): Dropdown status (available, blocked, hidden only)
 * Row 3 (Arzt): Doctor names for booked slots (e.g., kukadiya, ikikardes)
 *
 * | Datum | Wochentag | Slot1 | Slot2 | Slot3 | ... | Slot12 |
 * | Date  | Day       | 08:00 | 09:00 | 10:00 | ... | 18:00  | (Zeit)
 * |       |           | avail | block | avail | ... | avail  | (Status)
 * |       |           |       | kukadiya |     | ... |        | (Arzt)
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

  // Set up header row (row 1) - 14 columns: Datum, Wochentag, + 12 time slots
  var headers = ['Datum', 'Wochentag', 'Slot 1', 'Slot 2', 'Slot 3', 'Slot 4', 'Slot 5', 'Slot 6', 'Slot 7', 'Slot 8', 'Slot 9', 'Slot 10', 'Slot 11', 'Slot 12'];
  calendarSheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  // Format header row
  var headerRange = calendarSheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#14b8a6');
  headerRange.setFontColor('#ffffff');
  headerRange.setBorder(true, true, true, true, true, true, '#000000', SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  headerRange.setHorizontalAlignment('center');
  headerRange.setVerticalAlignment('middle');
  headerRange.setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP);

  // Set column widths
  calendarSheet.setColumnWidth(1, 120); // Datum
  calendarSheet.setColumnWidth(2, 120); // Wochentag
  for (var k = 3; k <= 14; k++) {
    calendarSheet.setColumnWidth(k, 80); // 12 time slots
  }

  // Generate first week (7 days) starting from today
  var today = new Date();
  addWeekToCalendar(calendarSheet, today, 1);

  // Freeze first row AFTER adding data
  calendarSheet.setFrozenRows(1);

  Logger.log('Calendar sheet initialized with first week (3 rows per day structure)');
  return 'Calendar sheet created successfully!';
}

/**
 * Add a week of dates to Calendar sheet
 * NEW: Each day has 3 rows (Zeit row + Status row + Arzt row)
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

  // Calculate which week of the month this is
  var firstDayOfMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  var daysSinceStart = Math.floor((startDate - firstDayOfMonth) / (1000 * 60 * 60 * 24));
  var weekOfMonth = Math.floor(daysSinceStart / 7) + 1;

  // Get month and year for separator (from first day of week)
  var month = startDate.getMonth() + 1;
  var year = startDate.getFullYear();

  // Find the last row with data
  var lastRow = Math.max(1, sheet.getLastRow()); // At least row 1 (header)

  // Add separator row before EVERY week (including first week)
  var separatorRow = lastRow + 1;
  var separatorLabel = '━━━ Woche ' + weekOfMonth + ' - ' + (month < 10 ? '0' : '') + month + '/' + year + ' ━━━';

  // Set separator label in first cell
  sheet.getRange(separatorRow, 1).setValue(separatorLabel);

  // NO MERGE for separator - just format the entire row
  var separatorRange = sheet.getRange(separatorRow, 1, 1, 14);
  separatorRange.setBackground('#14b8a6');
  separatorRange.setFontColor('#ffffff');
  separatorRange.setFontWeight('bold');
  separatorRange.setHorizontalAlignment('center');
  separatorRange.setVerticalAlignment('middle');
  separatorRange.setFontSize(11);
  sheet.setRowHeight(separatorRow, 30);

  lastRow++; // Increment lastRow to account for separator

  // Generate 7 days, each with 3 rows (Zeit + Status + Arzt)
  for (var i = 0; i < 7; i++) {
    var date = new Date(startDate);
    date.setDate(startDate.getDate() + i);

    var day = date.getDate();
    var currentMonth = date.getMonth() + 1;
    var currentYear = date.getFullYear();
    var dateStr = (day < 10 ? '0' : '') + day + '.' + (currentMonth < 10 ? '0' : '') + currentMonth + '.' + currentYear;
    var dayName = dayNames[date.getDay()];

    // Row 1: Zeit row (time values - editable by user)
    var zeitRow = [dateStr, dayName];
    // Default times: 08:00, 09:00, 10:00, 11:00, 12:00, 13:00, 14:00, 15:00, 16:00, 17:00, 18:00, 19:00
    for (var h = 8; h < 20; h++) {
      var timeStr = (h < 10 ? '0' : '') + h + ':00';
      zeitRow.push(timeStr);
    }

    // Row 2: Status row (dropdown - available by default)
    // Empty date and day (will be merged with Zeit row)
    var statusRow = ['', ''];
    for (var j = 0; j < 12; j++) {
      statusRow.push('available');
    }

    // Row 3: Arzt row (doctor names - empty by default)
    // Empty date and day (will be merged with Zeit row)
    var arztRow = ['', ''];
    for (var j = 0; j < 12; j++) {
      arztRow.push(''); // Empty by default
    }

    // Write all 3 rows FIRST (before merging)
    sheet.getRange(lastRow + 1, 1, 1, 14).setValues([zeitRow]);
    sheet.getRange(lastRow + 2, 1, 1, 14).setValues([statusRow]);
    sheet.getRange(lastRow + 3, 1, 1, 14).setValues([arztRow]);

    // Format Zeit row (editable, light background)
    var zeitRange = sheet.getRange(lastRow + 1, 1, 1, 14);
    zeitRange.setBorder(true, true, true, true, true, true, '#000000', SpreadsheetApp.BorderStyle.SOLID);
    zeitRange.setVerticalAlignment('middle');
    zeitRange.setHorizontalAlignment('center');
    zeitRange.setBackground('#f0f9ff'); // Light blue for Zeit row
    zeitRange.setFontWeight('bold');
    sheet.setRowHeight(lastRow + 1, 30);

    // NOW merge Date and Day cells AFTER all rows are created
    sheet.getRange(lastRow + 1, 1, 3, 1).mergeVertically(); // Merge Datum vertically
    sheet.getRange(lastRow + 1, 2, 3, 1).mergeVertically(); // Merge Wochentag vertically

    // Format Status row (dropdown - NOW WITH VALIDATION)
    var statusRange = sheet.getRange(lastRow + 2, 1, 1, 14);
    statusRange.setBorder(true, true, true, true, true, true, '#000000', SpreadsheetApp.BorderStyle.SOLID);
    statusRange.setVerticalAlignment('middle');
    statusRange.setHorizontalAlignment('center');
    sheet.setRowHeight(lastRow + 2, 30);

    // Add dropdown validation for Status row (available, blocked, hidden ONLY)
    var statusDropdownRange = sheet.getRange(lastRow + 2, 3, 1, 12);
    var rule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['available', 'blocked', 'hidden'], true)
      .setAllowInvalid(false)
      .build();
    statusDropdownRange.setDataValidation(rule);

    // Format Arzt row (doctor names - no validation needed)
    var arztRange = sheet.getRange(lastRow + 3, 1, 1, 14);
    arztRange.setBorder(true, true, true, true, true, true, '#000000', SpreadsheetApp.BorderStyle.SOLID);
    arztRange.setVerticalAlignment('middle');
    arztRange.setHorizontalAlignment('center');
    arztRange.setBackground('#fffbeb'); // Light yellow for Arzt row
    sheet.setRowHeight(lastRow + 3, 30);

    lastRow += 3; // Move to next day (skip 3 rows)
  }

  // Apply conditional formatting
  applyCalendarConditionalFormatting(sheet, lastRow);

  Logger.log('Added 7 days (21 rows) to calendar (week ' + weekOfMonth + ')');
}

/**
 * Apply conditional formatting to Calendar sheet
 * NEW: Only apply to Status rows (even rows after header)
 * Green = available, Red = blocked, Yellow = booked, Gray = hidden
 */
function applyCalendarConditionalFormatting(sheet, numRows) {
  // Apply to entire status columns (C to N = columns 3 to 14)
  // From row 2 to numRows, covering all status rows
  var timeSlotRange = sheet.getRange(2, 3, numRows - 1, 12);

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

  // Find the Zeit row for the requested date
  // Each day has 3 rows: Zeit row (with date) + Status row (empty date) + Arzt row (empty date)
  for (var i = 1; i < data.length; i++) {
    var rowDate = data[i][0]; // Column A: Date

    // Skip separator rows (merged cells with "━━━")
    if (rowDate.indexOf('━━━') !== -1) {
      continue;
    }

    // Skip empty date cells (Status/Arzt rows)
    if (!rowDate || rowDate.trim() === '') {
      continue;
    }

    // Found the Zeit row for this date
    if (rowDate === dateStr) {
      var zeitRow = data[i];     // Current row (Zeit values)
      var statusRow = data[i + 1]; // Next row (Status values)
      var arztRow = data[i + 2];   // Next row (Arzt names)
      var dayName = zeitRow[1];    // Column B: Day name

      // 🔍 CROSS-CHECK: Get booked appointments from New_Appointments for accuracy
      var bookedAppointments = getBookedAppointmentsForDate(dateStr);
      Logger.log('📋 Booked appointments for ' + dateStr + ': ' + JSON.stringify(bookedAppointments));

      var slots = {};

      // Loop through 12 time slot columns (columns C to N = index 2 to 13)
      for (var j = 2; j < 14; j++) {
        var timeLabel = zeitRow[j];   // Time from Zeit row (e.g., "08:00")
        var status = statusRow[j];     // Status from Status row (e.g., "available", "blocked", "hidden")
        var arztName = arztRow[j];     // Doctor name from Arzt row (e.g., "kukadiya")

        // Skip empty time slots
        if (!timeLabel || timeLabel.trim() === '') {
          continue;
        }

        // Skip "hidden" slots - don't include in response
        if (status === 'hidden') {
          continue;
        }

        // Determine if slot is booked (Arzt row has a name)
        var isBooked = (arztName && arztName.trim() !== '');
        var doctorName = isBooked ? arztName : null;

        // 🔍 CROSS-CHECK: Override with New_Appointments data if available
        if (bookedAppointments[timeLabel]) {
          doctorName = bookedAppointments[timeLabel];
          isBooked = true;
          Logger.log('✅ Cross-check override: ' + timeLabel + ' → ' + doctorName);
        }

        slots[timeLabel] = {
          time: timeLabel,
          status: isBooked ? 'booked' : status,
          available: status === 'available' && !isBooked,
          doctor: doctorName  // null if available, doctor name if booked
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
function updateCalendarStatus(dateStr, timeStr, newStatus) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var calendarSheet = ss.getSheetByName('Calendar');

    if (!calendarSheet) {
      Logger.log('⚠️ Calendar sheet not found, skipping sync');
      return false;
    }

    var data = calendarSheet.getDataRange().getDisplayValues();

    // Find the Zeit row for the date
    for (var i = 1; i < data.length; i++) {
      var rowDate = data[i][0]; // Column A: Date

      // Skip separator rows
      if (rowDate.indexOf('━━━') !== -1) {
        continue;
      }

      // Skip empty date cells (Status rows)
      if (!rowDate || rowDate.trim() === '') {
        continue;
      }

      // Found the Zeit row for this date
      if (rowDate === dateStr) {
        var zeitRow = data[i];     // Zeit values
        var statusRowIndex = i + 2; // Status row is 2nd row (i+1 in data array, but i+2 in sheet because 1-indexed)
        var arztRowIndex = i + 3; // Arzt row is 3rd row (i+2 in data array, but i+3 in sheet because 1-indexed)

        // Find the column with matching time
        for (var j = 2; j < 14; j++) {
          var cellTime = zeitRow[j];

          // Clean both times for comparison (remove " -" suffix if present)
          var cleanCellTime = cellTime ? cellTime.trim().split(' ')[0] : '';
          var cleanTimeStr = timeStr ? timeStr.trim().split(' ')[0] : '';

          if (cleanCellTime === cleanTimeStr) {
            // Found the matching time slot!

            // 1. Update Status row to "booked"
            var statusCell = calendarSheet.getRange(statusRowIndex, j + 1);
            statusCell.setValue('booked');

            // 2. Update Arzt row with doctor name
            var arztCell = calendarSheet.getRange(arztRowIndex, j + 1);
            arztCell.setValue(newStatus);

            Logger.log('✅ Calendar synced: ' + dateStr + ' ' + cleanTimeStr + ' → Status: booked, Arzt: ' + newStatus);
            return true;
          }
        }

        Logger.log('⚠️ Time slot not found in Calendar: ' + timeStr);
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
        // Convert DD.MM to DD.MM.YYYY if needed
        var fullDateStr = dateStr;
        if (dateStr.split('.').length === 2) {
          var currentYear = new Date().getFullYear();
          fullDateStr = dateStr + '.' + currentYear; // 26.11 → 26.11.2025
        }

        if (!bookedMap[fullDateStr]) {
          bookedMap[fullDateStr] = {};
        }
        bookedMap[fullDateStr][timeStr] = doctorStr;

        Logger.log('📌 Added to bookedMap: ' + fullDateStr + ' ' + timeStr + ' → ' + doctorStr);
      }
    }

    Logger.log('📋 Booked appointments map: ' + JSON.stringify(bookedMap));

    var updatedCount = 0;

    // Loop through Calendar and update statuses
    for (var i = 1; i < calendarData.length; i++) {
      var rowDate = calendarData[i][0];

      // Skip separator rows
      if (rowDate.indexOf('━━━') !== -1) {
        continue;
      }

      // Skip empty date cells (Status rows)
      if (!rowDate || rowDate.trim() === '') {
        continue;
      }

      // This is a Zeit row
      var zeitRow = calendarData[i];
      var statusRowIndex = i + 2; // Status row index (2nd row, 1-based)
      var arztRowIndex = i + 3; // Arzt row index (3rd row, 1-based)
      var dateStr = rowDate;

      // Get booked appointments for this date
      var bookedAppointments = bookedMap[dateStr] || {};

      // Update Status row and Arzt row for this date
      for (var j = 2; j < 14; j++) {
        var timeLabel = zeitRow[j];

        if (!timeLabel || timeLabel.trim() === '') {
          continue;
        }

        // Clean time label (remove trailing characters like " -")
        var cleanTimeLabel = timeLabel.trim().split(' ')[0]; // "10:00 -" → "10:00"

        var statusCell = calendarSheet.getRange(statusRowIndex, j + 1);
        var arztCell = calendarSheet.getRange(arztRowIndex, j + 1);
        var currentStatus = statusCell.getValue();
        var currentArzt = arztCell.getValue();

        // Determine correct values
        var correctStatus;
        var correctArzt;
        if (bookedAppointments[cleanTimeLabel]) {
          // Slot is booked
          correctStatus = 'booked';
          correctArzt = bookedAppointments[cleanTimeLabel];
          Logger.log('🔍 Match found! ' + dateStr + ' ' + cleanTimeLabel + ' → Status: booked, Arzt: ' + correctArzt);
        } else if (currentStatus === 'blocked' || currentStatus === 'hidden') {
          // Keep manually set statuses
          correctStatus = currentStatus;
          correctArzt = '';
        } else {
          // Not booked, not blocked → available
          correctStatus = 'available';
          correctArzt = '';
        }

        // Update Status if different
        if (currentStatus !== correctStatus) {
          statusCell.setValue(correctStatus);
          updatedCount++;
          Logger.log('✅ Updated Status: ' + dateStr + ' ' + cleanTimeLabel + ': "' + currentStatus + '" → "' + correctStatus + '"');
        }

        // Update Arzt if different
        if (currentArzt !== correctArzt) {
          arztCell.setValue(correctArzt);
          updatedCount++;
          Logger.log('✅ Updated Arzt: ' + dateStr + ' ' + cleanTimeLabel + ': "' + currentArzt + '" → "' + correctArzt + '"');
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

