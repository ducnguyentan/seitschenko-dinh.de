/**
 * Google Apps Script - Appointment Data Receiver
 * NEW STRUCTURE V2: Separate time slots per dentist (1 row per day)
 *
 * Calendar Structure:
 * - Header Row 1: Dentist names (merged across 10 time slots)
 * - Header Row 2: Time slots (08:00-17:00, repeated for each dentist)
 * - Data Rows: 1 row per day with 50 status columns
 */

// ============================================
// CONFIGURATION
// ============================================

var DENTISTS = ['Seitschenko-Dinh', 'Kukadiya', 'Ikikardes', 'Taifour', 'Nikolaou'];
var DENTISTS_LOWER = ['seitschenko-dinh', 'kukadiya', 'ikikardes', 'taifour', 'nikolaou'];
var TIME_SLOTS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
var DENTIST_COLORS = ['#FFE5E5', '#FFE9D9', '#FFF4D9', '#E5FFE5', '#D9F4FF'];

// Helper: Get dentist index by name (case-insensitive)
function getDentistIndex(doctorName) {
  var lower = doctorName.toLowerCase().trim();
  for (var i = 0; i < DENTISTS_LOWER.length; i++) {
    if (DENTISTS_LOWER[i] === lower) {
      return i;
    }
  }
  return -1;
}

// Helper: Get time slot index
function getTimeSlotIndex(timeStr) {
  // Normalize time
  var cleaned = timeStr.replace(/[^0-9:]/g, '');
  var parts = cleaned.split(':');
  if (parts.length >= 2) {
    cleaned = parts[0] + ':' + parts[1];
  }

  for (var i = 0; i < TIME_SLOTS.length; i++) {
    if (TIME_SLOTS[i] === cleaned) {
      return i;
    }
  }
  return -1;
}

// Helper: Calculate column index for dentist + time slot
// Column layout: [Date, Day, Dentist1-Slot1...Dentist1-Slot10, Dentist2-Slot1...Dentist2-Slot10, ...]
// Total: 2 + (5 dentists * 10 slots) = 52 columns
function getColumnIndex(dentistIndex, timeSlotIndex) {
  return 3 + (dentistIndex * 10) + timeSlotIndex; // 1-based, columns A-AZ
}

// ============================================
// doPost - Receive appointment bookings
// ============================================

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('New_Appointments');

    if (!sheet) {
      Logger.log('📋 Creating New_Appointments sheet...');
      sheet = ss.insertSheet('New_Appointments');
    }

    var data = JSON.parse(e.postData.contents);

    // Create header if needed
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Zeitstempel', 'Symptom', 'Arzt', 'Arzt E-Mail', 'Arzt Telefon',
        'Datum', 'Zeit', 'Beschreibung', 'Sprache',
        'Patient Name', 'Patient Geburtsjahr', 'Patient Telefon', 'Patient E-Mail'
      ]);

      var headerRange = sheet.getRange(1, 1, 1, 13);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#14b8a6');
      headerRange.setFontColor('#ffffff');
      headerRange.setBorder(true, true, true, true, true, true, '#000000', SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
      headerRange.setHorizontalAlignment('center');
      headerRange.setVerticalAlignment('middle');
      headerRange.setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP);
      sheet.setRowHeight(1, 50);
    }

    // Append data
    var timestamp = new Date();
    var newRowNumber = sheet.getLastRow() + 1;
    sheet.appendRow([
      timestamp,
      data.symptom || '-',
      data.doctor || '-',
      data.doctorEmail || '-',
      data.doctorPhone || '-',
      data.date || '-',
      data.time || '-',
      data.description || '-',
      data.language || 'de',
      data.patientName || '-',
      data.patientBirthYear || '-',
      data.patientPhone || '-',
      data.patientEmail || '-'
    ]);

    // Set column widths (first time only)
    if (newRowNumber === 2) {
      sheet.setColumnWidth(1, 150); sheet.setColumnWidth(2, 200); sheet.setColumnWidth(3, 150);
      sheet.setColumnWidth(4, 200); sheet.setColumnWidth(5, 120); sheet.setColumnWidth(6, 100);
      sheet.setColumnWidth(7, 80); sheet.setColumnWidth(8, 250); sheet.setColumnWidth(9, 80);
      sheet.setColumnWidth(10, 180); sheet.setColumnWidth(11, 120); sheet.setColumnWidth(12, 150);
      sheet.setColumnWidth(13, 200);
    }

    // Format new row
    var newRowRange = sheet.getRange(newRowNumber, 1, 1, 13);
    newRowRange.setBorder(true, true, true, true, true, true, '#000000', SpreadsheetApp.BorderStyle.SOLID);
    newRowRange.setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);
    newRowRange.setVerticalAlignment('middle');
    newRowRange.setBackground(newRowNumber % 2 === 0 ? '#f9fafb' : '#ffffff');

    // 🔄 AUTO-SYNC with Calendar
    var date = data.date || '-';
    var time = data.time || '-';
    var doctor = data.doctor || '-';

    if (date !== '-' && time !== '-' && doctor !== '-') {
      // Normalize date: DD.MM.YYYY → D.M (no leading zeros)
      var normalizedDate = date;
      var dateParts = date.split('.');

      if (dateParts.length >= 2) {
        var day = parseInt(dateParts[0], 10);
        var month = parseInt(dateParts[1], 10);
        normalizedDate = day + '.' + month;
      }

      Logger.log('🔄 Auto-sync: ' + normalizedDate + ' ' + time + ' → ' + doctor);
      var syncSuccess = updateCalendarStatus(normalizedDate, time, doctor);
      Logger.log(syncSuccess ? '✅ Auto-sync SUCCESS' : '⚠️ Auto-sync FAILED');
    }

    return ContentService.createTextOutput(JSON.stringify({
      'status': 'success',
      'message': 'Appointment saved',
      'timestamp': timestamp.toISOString()
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      'status': 'error',
      'message': error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================
// doGet - API endpoints
// ============================================

function doGet(e) {
  try {
    var params = e.parameter;

    // Get available time slots for calendar
    if (params && params.action === 'getTimeSlots' && params.date) {
      var slotsData = getAvailableTimeSlots(params.date);
      return ContentService.createTextOutput(JSON.stringify(slotsData))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Get appointments for doctor (for appointment.html calendar view)
    if (params && params.doctor && params.fromDate && params.toDate) {
      var appointments = getAppointmentsForDoctor(params.doctor, params.fromDate, params.toDate);
      return ContentService.createTextOutput(JSON.stringify(appointments))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Status check
    return ContentService.createTextOutput(JSON.stringify({
      'status': 'online',
      'message': 'API active. Use ?action=getTimeSlots&date=DD.MM.YYYY or ?doctor=NAME&fromDate=DD.MM.YYYY&toDate=DD.MM.YYYY'
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      'status': 'error',
      'message': error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================
// Get appointments for a doctor (date range)
// ============================================

function getAppointmentsForDoctor(doctorName, fromDateStr, toDateStr) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var appointmentsSheet = ss.getSheetByName('New_Appointments');

    if (!appointmentsSheet) {
      return {
        status: 'error',
        message: 'New_Appointments sheet not found'
      };
    }

    var data = appointmentsSheet.getDataRange().getDisplayValues();
    var appointments = [];

    // Normalize doctor name
    var searchDoctor = doctorName.toLowerCase().trim();

    // Parse date range
    var fromParts = fromDateStr.split('.');
    var toParts = toDateStr.split('.');

    if (fromParts.length < 2 || toParts.length < 2) {
      return {
        status: 'error',
        message: 'Invalid date format'
      };
    }

    var fromDay = parseInt(fromParts[0], 10);
    var fromMonth = parseInt(fromParts[1], 10);
    var fromYear = fromParts.length >= 3 ? parseInt(fromParts[2], 10) : new Date().getFullYear();

    var toDay = parseInt(toParts[0], 10);
    var toMonth = parseInt(toParts[1], 10);
    var toYear = toParts.length >= 3 ? parseInt(toParts[2], 10) : new Date().getFullYear();

    var fromDate = new Date(fromYear, fromMonth - 1, fromDay);
    var toDate = new Date(toYear, toMonth - 1, toDay);

    // Skip header row (row 0)
    for (var i = 1; i < data.length; i++) {
      var row = data[i];

      // Columns: [Zeitstempel, Symptom, Arzt, Arzt E-Mail, Arzt Telefon, Datum, Zeit, Beschreibung, Sprache, Patient Name, Patient Geburtsjahr, Patient Telefon, Patient E-Mail]
      var rowDoctor = row[2] ? row[2].toLowerCase().trim() : '';
      var rowDate = row[5] ? row[5].trim() : '';
      var rowTime = row[6] ? row[6].trim() : '';

      // Match doctor
      if (rowDoctor !== searchDoctor) {
        continue;
      }

      // Parse appointment date
      if (!rowDate) continue;

      var dateParts = rowDate.split('.');
      if (dateParts.length < 2) continue;

      var day = parseInt(dateParts[0], 10);
      var month = parseInt(dateParts[1], 10);
      var year = dateParts.length >= 3 ? parseInt(dateParts[2], 10) : new Date().getFullYear();

      var appointmentDate = new Date(year, month - 1, day);

      // Check date range
      if (appointmentDate >= fromDate && appointmentDate <= toDate) {
        appointments.push({
          date: rowDate,
          time: rowTime,
          symptom: row[1] || '',
          description: row[7] || '',
          patientName: row[9] || '',
          patientPhone: row[11] || '',
          patientEmail: row[12] || ''
        });
      }
    }

    return {
      status: 'success',
      doctor: doctorName,
      fromDate: fromDateStr,
      toDate: toDateStr,
      count: appointments.length,
      appointments: appointments
    };

  } catch (error) {
    return {
      status: 'error',
      message: error.toString()
    };
  }
}

// ============================================
// Get available time slots for a date
// ============================================

function getAvailableTimeSlots(dateStr) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var calendarSheet = ss.getSheetByName('Calendar');

  if (!calendarSheet) {
    return { status: 'error', message: 'Calendar not found' };
  }

  var data = calendarSheet.getDataRange().getDisplayValues();

  // Normalize search date: DD.MM.YYYY → D.M
  var normalizedSearchDate = dateStr;
  var parts = dateStr.split('.');
  if (parts.length >= 2) {
    var day = parseInt(parts[0], 10);
    var month = parseInt(parts[1], 10);
    normalizedSearchDate = day + '.' + month;
  }

  // Find the data row for this date (skip 2 header rows + separator rows)
  for (var i = 2; i < data.length; i++) {
    var rowDate = data[i][0];

    // Skip separators and empty cells
    if (!rowDate || rowDate.trim() === '' || rowDate.indexOf('━━━') !== -1) {
      continue;
    }

    // Normalize row date
    var normalizedRowDate = rowDate;
    var rowParts = rowDate.split('.');
    if (rowParts.length >= 2) {
      var rowDay = parseInt(rowParts[0], 10);
      var rowMonth = parseInt(rowParts[1], 10);
      normalizedRowDate = rowDay + '.' + rowMonth;
    }

    if (normalizedRowDate === normalizedSearchDate) {
      // Found the row!
      var dayName = data[i][1];
      var slots = {};

      // Read all 50 status columns (5 dentists × 10 slots)
      for (var d = 0; d < DENTISTS.length; d++) {
        var dentistName = DENTISTS[d];
        var dentistSlots = [];

        for (var t = 0; t < TIME_SLOTS.length; t++) {
          var colIndex = getColumnIndex(d, t);
          var status = data[i][colIndex - 1]; // -1 because data array is 0-based

          if (status !== 'hidden') {
            dentistSlots.push({
              time: TIME_SLOTS[t],
              status: status,
              available: (status === 'available')
            });
          }
        }

        slots[dentistName] = dentistSlots;
      }

      return {
        status: 'success',
        date: dateStr,
        dayName: dayName,
        slots: slots
      };
    }
  }

  return { status: 'not_found', message: 'Date not found: ' + dateStr };
}

// ============================================
// Update Calendar status (auto-sync)
// ============================================

function updateCalendarStatus(dateStr, timeStr, doctorName) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var calendarSheet = ss.getSheetByName('Calendar');

    if (!calendarSheet) {
      Logger.log('⚠️ Calendar not found');
      return false;
    }

    // Get dentist and time slot indices
    var dentistIndex = getDentistIndex(doctorName);
    var timeSlotIndex = getTimeSlotIndex(timeStr);

    if (dentistIndex === -1 || timeSlotIndex === -1) {
      Logger.log('⚠️ Invalid dentist or time: ' + doctorName + ', ' + timeStr);
      return false;
    }

    var colIndex = getColumnIndex(dentistIndex, timeSlotIndex);
    var data = calendarSheet.getDataRange().getDisplayValues();

    // Normalize search date
    var normalizedSearchDate = dateStr;
    var parts = dateStr.split('.');
    if (parts.length >= 2) {
      var day = parseInt(parts[0], 10);
      var month = parseInt(parts[1], 10);
      normalizedSearchDate = day + '.' + month;
    }

    // Find the date row
    for (var i = 2; i < data.length; i++) {
      var rowDate = data[i][0];

      if (!rowDate || rowDate.trim() === '' || rowDate.indexOf('━━━') !== -1) {
        continue;
      }

      // Normalize row date
      var normalizedRowDate = rowDate;
      var rowParts = rowDate.split('.');
      if (rowParts.length >= 2) {
        var rowDay = parseInt(rowParts[0], 10);
        var rowMonth = parseInt(rowParts[1], 10);
        normalizedRowDate = rowDay + '.' + rowMonth;
      }

      if (normalizedRowDate === normalizedSearchDate) {
        // Found it! Update the status cell
        var sheetRowIndex = i + 1; // Convert to 1-based
        calendarSheet.getRange(sheetRowIndex, colIndex).setValue('booked');

        Logger.log('✅ Updated: Row ' + sheetRowIndex + ', Col ' + colIndex + ' → booked');
        return true;
      }
    }

    Logger.log('⚠️ Date not found: ' + dateStr);
    return false;

  } catch (error) {
    Logger.log('❌ Error: ' + error.toString());
    return false;
  }
}

// ============================================
// Initialize Calendar sheet
// ============================================

function initializeCalendarSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var calendarSheet = ss.getSheetByName('Calendar');

  if (!calendarSheet) {
    calendarSheet = ss.insertSheet('Calendar');
  } else {
    calendarSheet.clear();
  }

  // Header Row 1: Dentist names (merged across 10 slots)
  var headerRow1 = ['Datum', 'Wochentag'];
  for (var d = 0; d < DENTISTS.length; d++) {
    for (var t = 0; t < TIME_SLOTS.length; t++) {
      headerRow1.push(DENTISTS[d]);
    }
  }

  // Header Row 2: Time slots (repeated for each dentist)
  var headerRow2 = ['', ''];
  for (var d = 0; d < DENTISTS.length; d++) {
    for (var t = 0; t < TIME_SLOTS.length; t++) {
      headerRow2.push(TIME_SLOTS[t]);
    }
  }

  // Write headers
  calendarSheet.getRange(1, 1, 1, 52).setValues([headerRow1]);
  calendarSheet.getRange(2, 1, 1, 52).setValues([headerRow2]);

  // Format header row 1
  var headerRange1 = calendarSheet.getRange(1, 1, 1, 52);
  headerRange1.setFontWeight('bold');
  headerRange1.setBackground('#14b8a6');
  headerRange1.setFontColor('#000000'); // Changed from white to black for better visibility
  headerRange1.setBorder(true, true, true, true, true, true, '#000000', SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  headerRange1.setHorizontalAlignment('center');
  headerRange1.setVerticalAlignment('middle');
  headerRange1.setFontSize(10);
  calendarSheet.setRowHeight(1, 30);

  // Merge Date and Day cells vertically
  calendarSheet.getRange(1, 1, 2, 1).mergeVertically();
  calendarSheet.getRange(1, 2, 2, 1).mergeVertically();

  // Merge dentist names horizontally (10 slots each)
  for (var d = 0; d < DENTISTS.length; d++) {
    var startCol = 3 + (d * 10);
    calendarSheet.getRange(1, startCol, 1, 10).merge();
    calendarSheet.getRange(1, startCol, 2, 10).setBackground(DENTIST_COLORS[d]);
  }

  // Format header row 2
  var headerRange2 = calendarSheet.getRange(2, 1, 1, 52);
  headerRange2.setFontWeight('bold');
  headerRange2.setFontColor('#000000');
  headerRange2.setBorder(true, true, true, true, true, true, '#000000', SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  headerRange2.setHorizontalAlignment('center');
  headerRange2.setVerticalAlignment('middle');
  headerRange2.setFontSize(8);
  calendarSheet.setRowHeight(2, 20);

  // Set column widths
  calendarSheet.setColumnWidth(1, 100);
  calendarSheet.setColumnWidth(2, 110);
  for (var k = 3; k <= 52; k++) {
    calendarSheet.setColumnWidth(k, 80);
  }

  // Add 8 weeks (2 months) starting from today
  var today = new Date();

  // Validate today's date
  if (isNaN(today.getTime())) {
    throw new Error('Failed to create today\'s date');
  }

  Logger.log('📅 Starting calendar from: ' + today.toDateString());

  for (var w = 0; w < 8; w++) {
    try {
      var weekStart = new Date(today.getTime()); // Use getTime() for safer copy
      weekStart.setDate(today.getDate() + (w * 7));

      // Validate the created date
      if (isNaN(weekStart.getTime())) {
        Logger.log('⚠️ Skipping invalid week ' + (w + 1));
        continue;
      }

      Logger.log('➕ Adding week ' + (w + 1) + ': ' + weekStart.toDateString());
      addWeekToCalendar(calendarSheet, weekStart, w + 1);

    } catch (error) {
      Logger.log('❌ Error adding week ' + (w + 1) + ': ' + error.message);
      throw error; // Re-throw to stop execution
    }
  }

  // Freeze first 2 rows (headers) and first 2 columns (Datum, Wochentag)
  calendarSheet.setFrozenRows(2);
  calendarSheet.setFrozenColumns(2);

  Logger.log('✅ Calendar initialized (new structure) with 8 weeks');
  return 'Calendar created with 8 weeks!';
}

// ============================================
// Add multiple weeks to calendar (helper function)
// ============================================

function addMultipleWeeks(numWeeks) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var calendarSheet = ss.getSheetByName('Calendar');

  if (!calendarSheet) {
    return 'Calendar sheet not found. Please run initializeCalendarSheet() first.';
  }

  // Find the last date in the calendar
  var data = calendarSheet.getDataRange().getDisplayValues();
  var lastDate = null;

  for (var i = data.length - 1; i >= 2; i--) {
    var dateStr = data[i][0];
    if (dateStr && dateStr.trim() !== '' && dateStr.indexOf('━━━') === -1) {
      // Parse D.M format
      var parts = dateStr.split('.');
      if (parts.length >= 2) {
        var day = parseInt(parts[0], 10);
        var month = parseInt(parts[1], 10);

        // Validate parsed values
        if (isNaN(day) || isNaN(month) || day < 1 || day > 31 || month < 1 || month > 12) {
          continue; // Skip invalid date
        }

        // Assume current year if only D.M
        var year = new Date().getFullYear();

        // Create date and validate it
        lastDate = new Date(year, month - 1, day);

        // Check if date is valid (handles cases like Feb 31)
        if (isNaN(lastDate.getTime())) {
          lastDate = null;
          continue;
        }

        Logger.log('📅 Found last date: ' + lastDate.toDateString());
        break;
      }
    }
  }

  if (!lastDate) {
    return 'Could not find last date in calendar';
  }

  // Add weeks starting from day after last date
  var nextDate = new Date(lastDate);
  nextDate.setDate(nextDate.getDate() + 1);

  for (var w = 0; w < numWeeks; w++) {
    var weekStart = new Date(nextDate);
    weekStart.setDate(nextDate.getDate() + (w * 7));
    addWeekToCalendar(calendarSheet, weekStart, 0); // weekNumber 0 = append
  }

  Logger.log('✅ Added ' + numWeeks + ' weeks to calendar');

  try {
    SpreadsheetApp.getUi().alert('✅ Added ' + numWeeks + ' weeks to calendar!');
  } catch (e) {
    Logger.log('Running from script');
  }

  return 'Added ' + numWeeks + ' weeks!';
}

// ============================================
// Add week to calendar
// ============================================

function addWeekToCalendar(sheet, startDate, weekNumber) {
  // Validate startDate parameter
  if (!startDate) {
    throw new Error('startDate is required');
  }

  if (!(startDate instanceof Date)) {
    throw new Error('startDate must be a Date object, got: ' + typeof startDate);
  }

  if (isNaN(startDate.getTime())) {
    throw new Error('startDate is invalid (NaN timestamp)');
  }

  var dayNames = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];

  // Calculate week of month
  var firstDayOfMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  var daysSinceStart = Math.floor((startDate - firstDayOfMonth) / (1000 * 60 * 60 * 24));
  var weekOfMonth = Math.floor(daysSinceStart / 7) + 1;

  var month = startDate.getMonth() + 1;
  var year = startDate.getFullYear();
  var lastRow = Math.max(2, sheet.getLastRow());

  // Add separator row
  var separatorRow = lastRow + 1;
  var separatorLabel = 'Woche ' + weekOfMonth + ' - ' + (month < 10 ? '0' : '') + month + '/' + year;

  // Set separator text in first 2 columns (Datum + Wochentag)
  sheet.getRange(separatorRow, 1).setValue(separatorLabel);

  // Merge first 2 columns for separator
  sheet.getRange(separatorRow, 1, 1, 2).merge();

  // Format entire separator row
  var separatorRange = sheet.getRange(separatorRow, 1, 1, 52);
  separatorRange.setBackground('#14b8a6');
  separatorRange.setFontColor('#ffffff');
  separatorRange.setFontWeight('bold');
  separatorRange.setVerticalAlignment('middle');
  separatorRange.setFontSize(11);
  sheet.setRowHeight(separatorRow, 30);

  // Set alignment: left for merged cell (Datum+Wochentag), center for rest
  sheet.getRange(separatorRow, 1, 1, 2).setHorizontalAlignment('right');
  sheet.getRange(separatorRow, 3, 1, 50).setHorizontalAlignment('center');

  lastRow++;

  // Generate 7 days
  for (var i = 0; i < 7; i++) {
    // Create date using getTime() for safer copying
    var date = new Date(startDate.getTime());
    date.setDate(startDate.getDate() + i);

    // Validate the created date
    if (isNaN(date.getTime())) {
      Logger.log('⚠️ Skipping invalid date at day ' + i);
      continue;
    }

    var day = date.getDate();
    var currentMonth = date.getMonth() + 1;
    var dateStr = day + '.' + currentMonth; // D.M format
    var dayName = dayNames[date.getDay()];

    // Build row: [Date, Day, 50x 'available']
    var dataRow = [dateStr, dayName];
    for (var d = 0; d < DENTISTS.length; d++) {
      for (var t = 0; t < TIME_SLOTS.length; t++) {
        dataRow.push('available');
      }
    }

    var rowIndex = lastRow + 1;
    sheet.getRange(rowIndex, 1, 1, 52).setValues([dataRow]);

    // Format row
    var rowRange = sheet.getRange(rowIndex, 1, 1, 52);
    rowRange.setBorder(true, true, true, true, true, true, '#000000', SpreadsheetApp.BorderStyle.SOLID);
    rowRange.setVerticalAlignment('middle');
    rowRange.setHorizontalAlignment('center');
    rowRange.setFontSize(9);
    sheet.setRowHeight(rowIndex, 30);

    // Format Date/Day columns
    var dateDayRange = sheet.getRange(rowIndex, 1, 1, 2);
    dateDayRange.setFontWeight('bold');
    dateDayRange.setBackground('#f0f0f0');

    // Apply dentist colors
    for (var d = 0; d < DENTISTS.length; d++) {
      var startCol = 3 + (d * 10);
      sheet.getRange(rowIndex, startCol, 1, 10).setBackground(DENTIST_COLORS[d]);
    }

    // Add dropdown validation
    var statusDropdownRange = sheet.getRange(rowIndex, 3, 1, 50);
    var rule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['available', 'blocked', 'hidden', 'booked'], true)
      .setAllowInvalid(false)
      .build();
    statusDropdownRange.setDataValidation(rule);

    lastRow++;
  }

  // Apply conditional formatting
  applyCalendarConditionalFormatting(sheet, lastRow);

  Logger.log('✅ Added 7 days (week ' + weekOfMonth + ')');
}

// ============================================
// Conditional formatting
// ============================================

function applyCalendarConditionalFormatting(sheet, numRows) {
  var timeSlotRange = sheet.getRange(3, 3, numRows, 50);

  sheet.setConditionalFormatRules([]);

  var rule1 = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('available')
    .setBackground('#d1fae5')
    .setFontColor('#065f46')
    .setRanges([timeSlotRange])
    .build();

  var rule2 = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('blocked')
    .setBackground('#fee2e2')
    .setFontColor('#991b1b')
    .setRanges([timeSlotRange])
    .build();

  var rule3 = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('booked')
    .setBackground('#fef3c7')
    .setFontColor('#92400e')
    .setRanges([timeSlotRange])
    .build();

  var rule4 = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('hidden')
    .setBackground('#e5e7eb')
    .setFontColor('#6b7280')
    .setRanges([timeSlotRange])
    .build();

  sheet.setConditionalFormatRules([rule1, rule2, rule3, rule4]);
}

// ============================================
// Add next week
// ============================================

function addNextWeek() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var calendarSheet = ss.getSheetByName('Calendar');

    if (!calendarSheet) {
      throw new Error('Calendar not found');
    }

    var lastRow = calendarSheet.getLastRow();
    if (lastRow < 2) {
      throw new Error('No data in calendar');
    }

    // Find last date row
    var lastDateStr = null;
    for (var row = lastRow; row >= 2; row--) {
      // Use getDisplayValue() to get formatted string instead of Date object
      var cellValue = calendarSheet.getRange(row, 1).getDisplayValue();

      if (!cellValue || cellValue.trim() === '' || cellValue.indexOf('━━━') !== -1) {
        continue;
      }

      lastDateStr = cellValue.trim();
      break;
    }

    if (!lastDateStr) {
      throw new Error('Last date not found in calendar');
    }

    Logger.log('📅 Last date found: ' + lastDateStr);

    // Parse date (D.M format)
    var parts = lastDateStr.split('.');

    if (parts.length < 2) {
      throw new Error('Invalid date format: ' + lastDateStr);
    }

    var day = parseInt(parts[0], 10);
    var month = parseInt(parts[1], 10);

    // Validate parsed values
    if (isNaN(day) || isNaN(month) || day < 1 || day > 31 || month < 1 || month > 12) {
      throw new Error('Invalid day/month values: ' + day + '.' + month);
    }

    var year = new Date().getFullYear();

    // Create and validate date
    var lastDate = new Date(year, month - 1, day);

    if (isNaN(lastDate.getTime())) {
      throw new Error('Could not create valid date from: ' + lastDateStr);
    }

    Logger.log('📅 Parsed last date: ' + lastDate.toDateString());

    // Calculate next week start
    var nextWeekStart = new Date(lastDate.getTime());
    nextWeekStart.setDate(lastDate.getDate() + 1);

    // Validate next week start
    if (isNaN(nextWeekStart.getTime())) {
      throw new Error('Could not calculate next week start date');
    }

    Logger.log('➕ Adding week starting from: ' + nextWeekStart.toDateString());

    addWeekToCalendar(calendarSheet, nextWeekStart, null);

    try {
      SpreadsheetApp.getUi().alert('✅ New week added!');
    } catch (e) {
      Logger.log('✅ New week added (from script)');
    }

    return 'Success';

  } catch (error) {
    Logger.log('❌ Error: ' + error.toString());
    try {
      SpreadsheetApp.getUi().alert('❌ Error: ' + error.toString());
    } catch (e) {}
    throw error;
  }
}

// ============================================
// Menu
// ============================================

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('📅 Kalender')
    .addItem('🔧 Initialize Calendar', 'initializeCalendarSheet')
    .addItem('➕ Add Next Week', 'addNextWeek')
    .addSeparator()
    .addItem('📋 Create New_Appointments', 'initializeNewAppointmentsSheet')
    .addSeparator()
    .addItem('🔄 Full Sync', 'syncCalendarWithAppointments')
    .addToUi();
}

// ============================================
// Initialize New_Appointments sheet
// ============================================

function initializeNewAppointmentsSheet() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('New_Appointments');

    if (sheet) {
      SpreadsheetApp.getUi().alert('⚠️ Sheet already exists!');
      return 'Already exists';
    }

    sheet = ss.insertSheet('New_Appointments');
    sheet.appendRow([
      'Zeitstempel', 'Symptom', 'Arzt', 'Arzt E-Mail', 'Arzt Telefon',
      'Datum', 'Zeit', 'Beschreibung', 'Sprache',
      'Patient Name', 'Patient Geburtsjahr', 'Patient Telefon', 'Patient E-Mail'
    ]);

    var headerRange = sheet.getRange(1, 1, 1, 13);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#14b8a6');
    headerRange.setFontColor('#ffffff');
    headerRange.setBorder(true, true, true, true, true, true, '#000000', SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
    headerRange.setHorizontalAlignment('center');
    headerRange.setVerticalAlignment('middle');
    headerRange.setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP);
    sheet.setRowHeight(1, 50);

    sheet.setColumnWidth(1, 150); sheet.setColumnWidth(2, 200); sheet.setColumnWidth(3, 150);
    sheet.setColumnWidth(4, 200); sheet.setColumnWidth(5, 120); sheet.setColumnWidth(6, 100);
    sheet.setColumnWidth(7, 80); sheet.setColumnWidth(8, 250); sheet.setColumnWidth(9, 80);
    sheet.setColumnWidth(10, 180); sheet.setColumnWidth(11, 120); sheet.setColumnWidth(12, 150);
    sheet.setColumnWidth(13, 200);

    sheet.setFrozenRows(1);

    Logger.log('✅ New_Appointments created');
    SpreadsheetApp.getUi().alert('✅ New_Appointments sheet created!');

    return 'Success';

  } catch (error) {
    Logger.log('❌ Error: ' + error.toString());
    try {
      SpreadsheetApp.getUi().alert('❌ Error: ' + error.toString());
    } catch (e) {}
    throw error;
  }
}

// ============================================
// Full sync (manual)
// ============================================

function syncCalendarWithAppointments() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var calendarSheet = ss.getSheetByName('Calendar');
    var appointmentsSheet = ss.getSheetByName('New_Appointments');

    if (!calendarSheet || !appointmentsSheet) {
      throw new Error('Sheets not found');
    }

    Logger.log('🔄 Starting sync...');

    var appointmentsData = appointmentsSheet.getDataRange().getDisplayValues();
    var bookedMap = {};

    // Build map of booked appointments
    for (var i = 1; i < appointmentsData.length; i++) {
      var row = appointmentsData[i];
      var doctor = row[2] ? row[2].trim() : '';
      var date = row[5] ? row[5].trim() : '';
      var time = row[6] ? row[6].trim() : '';

      if (!date || !time || !doctor) continue;

      // Normalize time
      var cleanTime = time.replace(/[^0-9:]/g, '');
      var timeParts = cleanTime.split(':');
      if (timeParts.length >= 2) {
        cleanTime = timeParts[0] + ':' + timeParts[1];
      }

      // Normalize date
      var normalizedDate = date;
      var dateParts = date.split('.');
      if (dateParts.length >= 2) {
        var day = parseInt(dateParts[0], 10);
        var month = parseInt(dateParts[1], 10);
        normalizedDate = day + '.' + month;
      }

      if (!bookedMap[normalizedDate]) {
        bookedMap[normalizedDate] = {};
      }
      bookedMap[normalizedDate][cleanTime] = doctor.toLowerCase();
    }

    Logger.log('📋 Booked map: ' + JSON.stringify(bookedMap));

    var updatedCount = 0;
    var calendarData = calendarSheet.getDataRange().getDisplayValues();

    // Loop through calendar rows
    for (var i = 2; i < calendarData.length; i++) {
      var rowDate = calendarData[i][0];

      if (!rowDate || rowDate.trim() === '' || rowDate.indexOf('━━━') !== -1) {
        continue;
      }

      // Normalize row date
      var normalizedRowDate = rowDate;
      var rowParts = rowDate.split('.');
      if (rowParts.length >= 2) {
        var rowDay = parseInt(rowParts[0], 10);
        var rowMonth = parseInt(rowParts[1], 10);
        normalizedRowDate = rowDay + '.' + rowMonth;
      }

      var bookedAppointments = bookedMap[normalizedRowDate] || {};
      if (Object.keys(bookedAppointments).length === 0) continue;

      var sheetRowIndex = i + 1; // 1-based

      // Update all 50 status columns
      for (var d = 0; d < DENTISTS.length; d++) {
        for (var t = 0; t < TIME_SLOTS.length; t++) {
          var colIndex = getColumnIndex(d, t);
          var currentStatus = calendarSheet.getRange(sheetRowIndex, colIndex).getValue();

          var bookedDoctor = bookedAppointments[TIME_SLOTS[t]];
          var isMatch = false;

          if (bookedDoctor) {
            var dentistLower = DENTISTS_LOWER[d];
            isMatch = (bookedDoctor === dentistLower);
          }

          var correctStatus;
          if (isMatch) {
            correctStatus = 'booked';
          } else if (currentStatus === 'blocked' || currentStatus === 'hidden') {
            correctStatus = currentStatus;
          } else {
            correctStatus = 'available';
          }

          if (currentStatus !== correctStatus) {
            calendarSheet.getRange(sheetRowIndex, colIndex).setValue(correctStatus);
            updatedCount++;
          }
        }
      }
    }

    Logger.log('✅ Sync complete! Updated ' + updatedCount + ' slots');

    try {
      SpreadsheetApp.getUi().alert('✅ Sync complete!\n\n' + updatedCount + ' slots updated.');
    } catch (e) {
      Logger.log('Running from script');
    }

    return 'Sync complete: ' + updatedCount + ' slots';

  } catch (error) {
    Logger.log('❌ Error: ' + error.toString());
    try {
      SpreadsheetApp.getUi().alert('❌ Error: ' + error.toString());
    } catch (e) {}
    throw error;
  }
}
