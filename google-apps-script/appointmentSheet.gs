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
 * SHEET STRUCTURE:
 * Column A: Timestamp
 * Column B: Symptom (Reason)
 * Column C: Doctor Name
 * Column D: Doctor Email
 * Column E: Doctor Phone
 * Column F: Date
 * Column G: Time
 * Column H: Custom Description
 * Column I: Language
 * Column J: Patient Name
 * Column K: Patient Birth Year
 * Column L: Patient Phone
 * Column M: Patient Email
 */

function doPost(e) {
  try {
    // Get the active spreadsheet
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('New_Appointments');
    // Parse incoming JSON data
    var data = JSON.parse(e.postData.contents);

    // Create header row if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Zeitstempel / Timestamp',
        'Symptom / Grund',
        'Nha sĩ / Doctor Name',
        'Email Nha sĩ / Doctor Email',
        'SĐT Nha sĩ / Doctor Phone',
        'Datum / Date',
        'Zeit / Time',
        'Beschreibung / Description',
        'Sprache / Language',
        'Tên Bệnh nhân / Patient Name',
        'Năm sinh Bệnh nhân / Patient Birth Year',
        'SĐT Bệnh nhân / Patient Phone',
        'Email Bệnh nhân / Patient Email'
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

    // Auto-resize columns for better readability (now 13 columns)
    sheet.autoResizeColumns(1, 13);

    // Add borders around the new row (now 13 columns)
    var newRowRange = sheet.getRange(newRowNumber, 1, 1, 13);
    newRowRange.setBorder(true, true, true, true, true, true, '#000000', SpreadsheetApp.BorderStyle.SOLID);

    // Set text wrapping to prevent text overflow
    newRowRange.setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP);

    // Center align for better readability
    newRowRange.setVerticalAlignment('middle');

    // Alternate row colors for better visibility
    if (newRowNumber % 2 === 0) {
      newRowRange.setBackground('#f9fafb'); // Light gray for even rows
    } else {
      newRowRange.setBackground('#ffffff'); // White for odd rows
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

    // If no parameters, return status
    if (!params || !params.doctor) {
      return ContentService
        .createTextOutput(JSON.stringify({
          'status': 'online',
          'message': 'Appointment receiver is active. Use ?doctor=NAME to query appointments.'
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
