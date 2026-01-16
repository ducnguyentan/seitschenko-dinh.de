/**
 * Google Apps Script - Appointment Data Receiver
 * NEW STRUCTURE V3: Separate time slots per dentist with contact info (1 row per day)
 *
 * Calendar Structure:
 * - Header Row 1: Dentist names (merged across 10 time slots)
 * - Header Row 2: Email (merged across 10 time slots, user input) - Email is also used as Calendar ID
 * - Header Row 3: Telefon (merged across 10 time slots, user input)
 * - Header Row 4: Time slots (08:00-17:00, repeated for each dentist)
 * - Data Rows: 1 row per day with 50 status columns
 *
 * Note: Email address in Row 2 is used as Google Calendar ID for syncing events
 */

// ============================================
// CONFIGURATION
// ============================================

var DENTISTS = ['Seitschenko-Dinh', 'Kukadiya', 'Ikikardes', 'Taifour', 'Nikolaou'];
var DENTISTS_LOWER = ['seitschenko-dinh', 'kukadiya', 'ikikardes', 'taifour', 'nikolaou'];
var TIME_SLOTS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
var DENTIST_COLORS = ['#FFE5E5', '#FFE9D9', '#FFF4D9', '#E5FFE5', '#D9F4FF'];

// Location mapping for dentists
var LOCATIONS = {
  'Am Loh': {
    name: 'Standort Am Loh',
    address: 'Loher Str. 40',
    postalCode: '42283',
    city: 'Wuppertal',
    phone: '0202 451642',
    email: 'loherstr@seitschenko-dinh.de',
    gmapsUrl: 'https://www.google.com/maps/place/Loher+Str.+40,+42283+Wuppertal',
    dentists: ['seitschenko-dinh', 'kukadiya', 'nikolaou']
  },
  'Schwarzbach': {
    name: 'Standort Schwarzbach',
    address: 'Schwarzbach 2',
    postalCode: '42277',
    city: 'Wuppertal',
    phone: '0202 660828',
    email: 'schwarzbach@seitschenko-dinh.de',
    gmapsUrl: 'https://www.google.com/maps/place/Schwarzbach+2,+42277+Wuppertal',
    dentists: ['ikikardes', 'taifour']
  }
};

// Helper: Get location by dentist name
function getLocationByDentist(doctorName) {
  var lower = doctorName.toLowerCase().trim();
  for (var locationKey in LOCATIONS) {
    var location = LOCATIONS[locationKey];
    if (location.dentists.indexOf(lower) !== -1) {
      return location;
    }
  }
  return null;
}

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
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('New_Appointments');

    if (!sheet) {
      Logger.log('📋 Creating New_Appointments sheet...');
      sheet = ss.insertSheet('New_Appointments');
    }

    // Create header if needed
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Zeitstempel', 'Symptom', 'Arzt', 'Arzt E-Mail', 'Arzt Telefon',
        'Datum', 'Zeit', 'Beschreibung', 'Sprache',
        'Patient Vorname', 'Patient Nachname', 'Patient Geburtsjahr',
        'Patient Telefon', 'Patient E-Mail', 'Erinnerung (Stunden)', 'Standort'
      ]);

      var headerRange = sheet.getRange(1, 1, 1, 16);
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
      data.patientFirstname || '-',
      data.patientLastname || '-',
      data.patientBirthYear || '-',
      data.patientPhone || '-',
      data.patientEmail || '-',
      data.reminderTime || '2',
      data.location || '-'
    ]);

    // Set column widths (first time only)
    if (newRowNumber === 2) {
      sheet.setColumnWidth(1, 150); sheet.setColumnWidth(2, 200); sheet.setColumnWidth(3, 150);
      sheet.setColumnWidth(4, 200); sheet.setColumnWidth(5, 120); sheet.setColumnWidth(6, 100);
      sheet.setColumnWidth(7, 80); sheet.setColumnWidth(8, 250); sheet.setColumnWidth(9, 80);
      sheet.setColumnWidth(10, 150); sheet.setColumnWidth(11, 150); sheet.setColumnWidth(12, 120);
      sheet.setColumnWidth(13, 150); sheet.setColumnWidth(14, 200); sheet.setColumnWidth(15, 120);
      sheet.setColumnWidth(16, 200);
    }

    // Format new row
    var newRowRange = sheet.getRange(newRowNumber, 1, 1, 16);
    newRowRange.setBorder(true, true, true, true, true, true, '#000000', SpreadsheetApp.BorderStyle.SOLID);
    newRowRange.setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);
    newRowRange.setVerticalAlignment('middle');
    newRowRange.setBackground(newRowNumber % 2 === 0 ? '#f9fafb' : '#ffffff');

    // 👥 SYNC patient info to Patients sheet
    syncPatientInfo(data);

    // 📧 SEND IMMEDIATE CONFIRMATION EMAIL TO PATIENT
    try {
      var patientEmail = data.patientEmail || '';
      Logger.log('📧 Attempting to send confirmation email to: ' + patientEmail);

      if (patientEmail && patientEmail !== '-' && patientEmail !== '') {
        Logger.log('✅ Valid email, sending confirmation...');
        sendPatientConfirmation(
          data.patientFirstname || '',
          data.patientLastname || '',
          patientEmail,
          data.patientPhone || '',
          data.patientBirthYear || '',
          data.doctor || '',
          data.date || '',
          data.time || '',
          data.symptom || '',
          data.description || '',
          data.reminderTime || '2'
        );
        Logger.log('✅ Confirmation email sent successfully to: ' + patientEmail);
      } else {
        Logger.log('⚠️ No valid patient email, skipping confirmation email');
      }
    } catch (confirmError) {
      Logger.log('❌ Confirmation email error: ' + confirmError.toString());
    }

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

      var syncSuccess = updateCalendarStatus(normalizedDate, time, doctor);

      // Send email and create calendar event (since onEdit trigger won't fire for script updates)
      if (syncSuccess) {
        try {
          // Get day name from date
          var appointmentDate = new Date(new Date().getFullYear(), month - 1, day);
          var dayNames = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
          var dayName = dayNames[appointmentDate.getDay()];

          // Get dentist email from Calendar sheet (Row 2) - SAME AS onEditTrigger
          var calendarSheet = ss.getSheetByName('Calendar');
          var dentistIndex = getDentistIndex(doctor);

          if (dentistIndex !== -1) {
            var emailColStart = 3 + (dentistIndex * 10);
            var dentistEmailFromSheet = calendarSheet.getRange(2, emailColStart).getValue();

            // Check if email is valid (not placeholder)
            if (dentistEmailFromSheet && dentistEmailFromSheet !== 'E-Mail hier eingeben') {
              sendDentistNotification(doctor, dentistEmailFromSheet, normalizedDate, dayName, time);
              createGoogleCalendarEvent(dentistEmailFromSheet, doctor, normalizedDate, dayName, time);
            }
          }
        } catch (notifyError) {
          Logger.log('Notification error: ' + notifyError.toString());
        }
      }
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

  // Find the data row for this date (skip 4 header rows + separator rows)
  for (var i = 4; i < data.length; i++) {
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
      var dentistContacts = {}; // Store email and phone for each dentist

      // Read all 50 status columns (5 dentists × 10 slots)
      for (var d = 0; d < DENTISTS.length; d++) {
        var dentistName = DENTISTS[d];
        var dentistSlots = [];

        // Get email and phone from header rows (row 2 and row 3)
        // Row index: 1 = row 2 (0-based), 2 = row 3
        var emailColIndex = getColumnIndex(d, 0); // First column of this dentist
        var dentistEmail = data[1][emailColIndex - 1]; // Row 2 (0-based index 1)
        var dentistPhone = data[2][emailColIndex - 1]; // Row 3 (0-based index 2)

        // Clean up placeholder text
        if (dentistEmail === 'E-Mail hier eingeben' || !dentistEmail) {
          dentistEmail = '';
        }
        if (dentistPhone === 'Telefon hier eingeben' || !dentistPhone) {
          dentistPhone = '';
        }

        // Store contact info for this dentist
        dentistContacts[dentistName] = {
          email: dentistEmail,
          phone: dentistPhone
        };

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
        slots: slots,
        contacts: dentistContacts  // Add contact information
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

    // Find the date row (skip 4 header rows)
    for (var i = 4; i < data.length; i++) {
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

  // Header Row 2: Email (merged across 10 slots, empty for user input)
  var headerRow2 = ['', ''];
  for (var d = 0; d < DENTISTS.length; d++) {
    for (var t = 0; t < TIME_SLOTS.length; t++) {
      headerRow2.push(''); // Empty for user to fill in email
    }
  }

  // Header Row 3: Telefon (merged across 10 slots, empty for user input)
  var headerRow3 = ['', ''];
  for (var d = 0; d < DENTISTS.length; d++) {
    for (var t = 0; t < TIME_SLOTS.length; t++) {
      headerRow3.push(''); // Empty for user to fill in phone
    }
  }

  // Header Row 4: Time slots (repeated for each dentist)
  var headerRow4 = ['', ''];
  for (var d = 0; d < DENTISTS.length; d++) {
    for (var t = 0; t < TIME_SLOTS.length; t++) {
      headerRow4.push(TIME_SLOTS[t]);
    }
  }

  // Write headers
  calendarSheet.getRange(1, 1, 1, 52).setValues([headerRow1]);
  calendarSheet.getRange(2, 1, 1, 52).setValues([headerRow2]);
  calendarSheet.getRange(3, 1, 1, 52).setValues([headerRow3]);
  calendarSheet.getRange(4, 1, 1, 52).setValues([headerRow4]);

  // Format all 4 header rows
  var allHeadersRange = calendarSheet.getRange(1, 1, 4, 52);
  allHeadersRange.setFontWeight('bold');
  allHeadersRange.setBackground('#14b8a6');
  allHeadersRange.setFontColor('#000000');
  allHeadersRange.setBorder(true, true, true, true, true, true, '#000000', SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  allHeadersRange.setHorizontalAlignment('center');
  allHeadersRange.setVerticalAlignment('middle');

  // Set row heights
  calendarSheet.setRowHeight(1, 30);  // Dentist name
  calendarSheet.setRowHeight(2, 25);  // Email
  calendarSheet.setRowHeight(3, 25);  // Telefon
  calendarSheet.setRowHeight(4, 20);  // Time slots

  // Merge Date and Day cells vertically across all 4 rows
  calendarSheet.getRange(1, 1, 4, 1).mergeVertically(); // Datum
  calendarSheet.getRange(1, 2, 4, 1).mergeVertically(); // Wochentag

  // Merge dentist info (Name, Email, Telefon) and set colors
  for (var d = 0; d < DENTISTS.length; d++) {
    var startCol = 3 + (d * 10);

    // Merge dentist name horizontally (row 1)
    var nameCell = calendarSheet.getRange(1, startCol, 1, 10);
    nameCell.merge();
    nameCell.setHorizontalAlignment('center');
    nameCell.setVerticalAlignment('middle');

    // Merge email horizontally (row 2)
    var emailCell = calendarSheet.getRange(2, startCol, 1, 10);
    emailCell.merge();
    emailCell.setValue('E-Mail hier eingeben'); // Placeholder text
    emailCell.setHorizontalAlignment('center');
    emailCell.setVerticalAlignment('middle');
    emailCell.setFontColor('#9ca3af'); // Gray placeholder color
    emailCell.setFontStyle('italic'); // Italic style for placeholder

    // Merge telefon horizontally (row 3)
    var telefonCell = calendarSheet.getRange(3, startCol, 1, 10);
    telefonCell.merge();
    telefonCell.setValue('Telefon hier eingeben'); // Placeholder text
    telefonCell.setHorizontalAlignment('center');
    telefonCell.setVerticalAlignment('middle');
    telefonCell.setFontColor('#9ca3af'); // Gray placeholder color
    telefonCell.setFontStyle('italic'); // Italic style for placeholder

    // Set dentist color for all 4 rows
    calendarSheet.getRange(1, startCol, 4, 10).setBackground(DENTIST_COLORS[d]);
  }

  // Font sizes
  calendarSheet.getRange(1, 1, 1, 52).setFontSize(10); // Row 1: Dentist names
  calendarSheet.getRange(2, 1, 1, 52).setFontSize(8);  // Row 2: Email
  calendarSheet.getRange(3, 1, 1, 52).setFontSize(8);  // Row 3: Telefon
  calendarSheet.getRange(4, 1, 1, 52).setFontSize(8);  // Row 4: Time slots

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

  // Freeze first 4 rows (headers) and first 2 columns (Datum, Wochentag)
  calendarSheet.setFrozenRows(4);
  calendarSheet.setFrozenColumns(2);

  Logger.log('✅ Calendar initialized (new structure V3 with contact info) with 8 weeks');
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

  for (var i = data.length - 1; i >= 4; i--) {
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

  // Set alignment: right for merged cell (Datum+Wochentag), center for rest
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
    var dayOfWeek = date.getDay(); // 0=Sunday, 6=Saturday

    // Build row: [Date, Day, 50x status]
    // Weekend (Saturday/Sunday) = 'hidden', Weekdays = 'available'
    // Seitschenko-Dinh (dentist index 0) = 'hidden' (fully booked)
    var dataRow = [dateStr, dayName];
    var isWeekend = (dayOfWeek === 0 || dayOfWeek === 6); // Sunday or Saturday

    for (var d = 0; d < DENTISTS.length; d++) {
      for (var t = 0; t < TIME_SLOTS.length; t++) {
        var status;
        if (isWeekend) {
          // Weekend: all dentists hidden
          status = 'hidden';
        } else if (d === 0) {
          // Seitschenko-Dinh (index 0): fully booked, all slots hidden
          status = 'hidden';
        } else {
          // Other dentists on weekdays: available
          status = 'available';
        }
        dataRow.push(status);
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

    // Format Date/Day columns - different color for weekends
    var dateDayRange = sheet.getRange(rowIndex, 1, 1, 2);
    dateDayRange.setFontWeight('bold');
    if (isWeekend) {
      // Weekend: light red/pink background
      dateDayRange.setBackground('#fecaca'); // light red
      dateDayRange.setFontColor('#991b1b'); // dark red text
    } else {
      // Weekday: normal gray background
      dateDayRange.setBackground('#f0f0f0');
    }

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
  // Apply conditional formatting to all time slot columns (rows start from 5, after 4 header rows)
  var timeSlotRange = sheet.getRange(5, 3, numRows, 50);

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
    if (lastRow < 4) {
      throw new Error('No data in calendar');
    }

    // Find last date row
    var lastDateStr = null;
    for (var row = lastRow; row >= 4; row--) {
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
// Show Form URLs (helper function)
// ============================================

function showFormUrls() {
  try {
    var formUrl = PropertiesService.getScriptProperties().getProperty('REVIEW_FORM_URL');
    var formId = PropertiesService.getScriptProperties().getProperty('REVIEW_FORM_ID');
    var editUrl = PropertiesService.getScriptProperties().getProperty('REVIEW_FORM_EDIT_URL');

    if (!formUrl) {
      SpreadsheetApp.getUi().alert(
        '⚠️ Kein Formular gefunden!\n\n' +
        'Bitte erstellen Sie zuerst das Review-Formular:\n' +
        'Kalender → ⭐ Create Dentist Reviews'
      );
      return;
    }

    var message = '📋 REVIEW FORM INFORMATIONEN\n\n' +
                  '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
                  '🔗 PUBLIC FORM URL:\n' +
                  formUrl + '\n\n' +
                  '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
                  '📝 EDIT FORM URL:\n' +
                  editUrl + '\n\n' +
                  '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
                  '🆔 FORM ID:\n' +
                  formId + '\n\n' +
                  '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
                  'Diese URLs werden automatisch in E-Mails verwendet.';

    SpreadsheetApp.getUi().alert(message);

  } catch (error) {
    SpreadsheetApp.getUi().alert('❌ Fehler: ' + error.toString());
  }
}

// ============================================
// Clean and Rebuild Patients Sheet
// ============================================

function cleanAndRebuildPatientsSheet() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var patientsSheet = ss.getSheetByName('Patients');

    // COMPLETELY DELETE the old Patients sheet
    if (patientsSheet) {
      Logger.log('🗑️ Completely deleting old Patients sheet...');
      ss.deleteSheet(patientsSheet);
      Logger.log('✅ Old Patients sheet deleted');
    }

    // CREATE a fresh new Patients sheet
    Logger.log('📋 Creating new Patients sheet from scratch...');
    initializePatientsSheet();
    Logger.log('✅ New Patients sheet created');

    // Now sync all patients from New_Appointments
    Logger.log('🔄 Syncing all patients from New_Appointments...');
    syncAllPatientsFromAppointments();

    // Show success message
    try {
      SpreadsheetApp.getUi().alert(
        '✅ Rebuild erfolgreich!\n\n' +
        'Patients sheet wurde komplett neu erstellt.\n' +
        'Alle Patienten wurden synchronisiert.\n\n' +
        'Bitte überprüfen Sie das Patients-Sheet.'
      );
    } catch (uiError) {
      Logger.log('ℹ️ UI not available (running from trigger/background)');
    }

  } catch (error) {
    Logger.log('❌ Error rebuilding patients sheet: ' + error.toString());
    try {
      SpreadsheetApp.getUi().alert('❌ Fehler: ' + error.toString());
    } catch (uiError) {
      Logger.log('ℹ️ Cannot show error alert (UI not available)');
    }
  }
}

// ============================================
// Sync All Patients from New_Appointments
// ============================================

function syncAllPatientsFromAppointments() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var appointmentsSheet = ss.getSheetByName('New_Appointments');
    var patientsSheet = ss.getSheetByName('Patients');

    if (!appointmentsSheet) {
      SpreadsheetApp.getUi().alert('⚠️ New_Appointments sheet not found!');
      return;
    }

    // Create Patients sheet if it doesn't exist
    if (!patientsSheet) {
      Logger.log('📋 Creating Patients sheet...');
      initializePatientsSheet();
      patientsSheet = ss.getSheetByName('Patients');
    }

    var data = appointmentsSheet.getDataRange().getValues();
    var syncedCount = 0;
    var skippedCount = 0;

    Logger.log('📊 Total rows in New_Appointments: ' + data.length);
    Logger.log('📋 Header row: ' + JSON.stringify(data[0]));

    // Skip header row (row 0)
    for (var i = 1; i < data.length; i++) {
      var row = data[i];

      Logger.log('🔍 Processing row ' + (i + 1) + ': ' + JSON.stringify(row));

      // Columns: [Zeitstempel, Symptom, Arzt, Arzt E-Mail, Arzt Telefon, Datum, Zeit, Beschreibung, Sprache,
      //           Patient Vorname, Patient Nachname, Patient Geburtsjahr, Patient Telefon, Patient E-Mail, Erinnerung (Stunden), Standort]
      var patientFirstname = row[9] ? row[9].toString().trim() : '';
      var patientLastname = row[10] ? row[10].toString().trim() : '';
      var patientBirthYear = row[11] ? row[11].toString().trim() : '';
      var patientPhone = row[12] ? row[12].toString().trim() : '';
      var patientEmail = row[13] ? row[13].toString().trim() : '';
      var reminderTime = row[14] ? row[14].toString().trim() : '2';

      Logger.log('👤 Patient data: ' + patientFirstname + ' ' + patientLastname + ', Phone: ' + patientPhone);

      // Skip if essential info is missing
      if (!patientFirstname || patientFirstname === '-' ||
          !patientLastname || patientLastname === '-' ||
          !patientPhone || patientPhone === '-') {
        skippedCount++;
        Logger.log('⏭️ Row ' + (i + 1) + ' skipped: Missing name or phone');
        continue;
      }

      // Create patient data object
      var patientData = {
        patientFirstname: patientFirstname,
        patientLastname: patientLastname,
        patientEmail: patientEmail === '-' ? '' : patientEmail,
        patientPhone: patientPhone,
        patientBirthYear: patientBirthYear === '-' ? '' : patientBirthYear,
        reminderTime: reminderTime
      };

      // Sync to Patients sheet
      Logger.log('🔄 Calling syncPatientInfo for: ' + patientFirstname + ' ' + patientLastname);
      syncPatientInfo(patientData);
      Logger.log('✅ syncPatientInfo completed for: ' + patientFirstname + ' ' + patientLastname);
      syncedCount++;
    }

    Logger.log('✅ Sync completed: ' + syncedCount + ' patients synced, ' + skippedCount + ' skipped');

    // Try to show UI alert, but don't fail if UI is not available
    try {
      SpreadsheetApp.getUi().alert(
        '✅ Sync Abgeschlossen!\n\n' +
        'Synchronisiert: ' + syncedCount + ' Patienten\n' +
        'Übersprungen: ' + skippedCount + ' Zeilen (fehlende Daten)\n\n' +
        'Bitte überprüfen Sie das Patients-Sheet.'
      );
    } catch (uiError) {
      Logger.log('ℹ️ UI not available (running from trigger/background): ' + uiError.toString());
    }

  } catch (error) {
    Logger.log('❌ Error syncing patients: ' + error.toString());
    try {
      SpreadsheetApp.getUi().alert('❌ Fehler: ' + error.toString());
    } catch (uiError) {
      Logger.log('ℹ️ Cannot show error alert (UI not available)');
    }
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
    .addItem('👥 Create Patients Sheet', 'initializePatientsSheet')
    .addItem('⭐ Create Review Form', 'initializeDentistReviewsSheet')
    .addItem('🗑️ Delete & Recreate Review Form', 'deleteAndRecreateReviewForm')
    .addSeparator()
    .addItem('🔄 Full Sync', 'syncCalendarWithAppointments')
    .addItem('👤 Sync All Patients', 'syncAllPatientsFromAppointments')
    .addItem('📊 View Form URLs', 'showFormUrls')
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
      'Patient Vorname', 'Patient Nachname', 'Patient Geburtsjahr',
      'Patient Telefon', 'Patient E-Mail', 'Erinnerung (Stunden)', 'Standort'
    ]);

    var headerRange = sheet.getRange(1, 1, 1, 16);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#14b8a6');
    headerRange.setFontColor('#ffffff');
    headerRange.setBorder(true, true, true, true, true, true, '#000000', SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
    headerRange.setHorizontalAlignment('center');
    headerRange.setVerticalAlignment('middle');
    headerRange.setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP);
    sheet.setRowHeight(1, 50);

    sheet.setColumnWidth(1, 150);  // Zeitstempel
    sheet.setColumnWidth(2, 200);  // Symptom
    sheet.setColumnWidth(3, 150);  // Arzt
    sheet.setColumnWidth(4, 200);  // Arzt E-Mail
    sheet.setColumnWidth(5, 120);  // Arzt Telefon
    sheet.setColumnWidth(6, 100);  // Datum
    sheet.setColumnWidth(7, 80);   // Zeit
    sheet.setColumnWidth(8, 250);  // Beschreibung
    sheet.setColumnWidth(9, 80);   // Sprache
    sheet.setColumnWidth(10, 150); // Patient Vorname
    sheet.setColumnWidth(11, 150); // Patient Nachname
    sheet.setColumnWidth(12, 120); // Patient Geburtsjahr
    sheet.setColumnWidth(13, 150); // Patient Telefon
    sheet.setColumnWidth(14, 200); // Patient E-Mail
    sheet.setColumnWidth(15, 120); // Erinnerung (Stunden)
    sheet.setColumnWidth(16, 150); // Standort

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

    // Loop through calendar rows (skip 4 header rows)
    for (var i = 4; i < calendarData.length; i++) {
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

// ============================================
// onEdit trigger - Auto-format & sync
// IMPORTANT: This must be installed as an INSTALLABLE TRIGGER, not a simple trigger
// ============================================

function onEditTrigger(e) {
  try {
    var sheet = e.source.getActiveSheet();
    var range = e.range;
    var row = range.getRow();
    var col = range.getColumn();

    // Handle Calendar sheet
    if (sheet.getName() === 'Calendar') {
      // Handle email/phone placeholder formatting (rows 2-3)
      if (row === 2 || row === 3) {
        handlePlaceholderFormatting(range, row, col);
        return;
      }

      // Handle appointment status changes (data rows, row >= 5)
      if (row >= 5 && col >= 3) {
        handleAppointmentStatusChange(sheet, range, row, col);
      }
      return;
    }

    // Handle Patients sheet - Treatment completion checkbox
    if (sheet.getName() === 'Patients') {
      // Column 13 is "Hoàn tất điều trị" (Treatment Completed)
      if (col === 13 && row >= 2) {
        handleTreatmentCompletion(sheet, row);
      }
      return;
    }

  } catch (error) {
    Logger.log('onEdit error: ' + error.toString());
  }
}

// ============================================
// Handle placeholder formatting for Email/Telefon
// ============================================

function handlePlaceholderFormatting(range, row, col) {
  // Check if edit is in dentist columns (col 3 onwards)
  if (col < 3) {
    return;
  }

  var value = range.getValue();

  // If cell is not empty and not placeholder text
  if (value && value !== 'E-Mail hier eingeben' && value !== 'Telefon hier eingeben') {
    // Format as normal text (black, not italic)
    range.setFontColor('#000000');
    range.setFontStyle('normal');
    range.setFontWeight('bold');
  } else if (value === '' || value === 'E-Mail hier eingeben' || value === 'Telefon hier eingeben') {
    // If empty or placeholder, restore placeholder formatting
    if (row === 2) {
      range.setValue('E-Mail hier eingeben');
    } else if (row === 3) {
      range.setValue('Telefon hier eingeben');
    }
    range.setFontColor('#9ca3af');
    range.setFontStyle('italic');
    range.setFontWeight('bold');
  }
}

// ============================================
// Handle appointment status change
// ============================================

function handleAppointmentStatusChange(sheet, range, row, col) {
  var newValue = range.getValue();

  // Only trigger on 'booked' status
  if (newValue !== 'booked') {
    return;
  }

  try {
    // Get date and day from columns A and B
    var dateValue = sheet.getRange(row, 1).getValue();
    var dayName = sheet.getRange(row, 2).getValue();

    // Convert date to string format (D.M)
    var dateStr;
    if (dateValue instanceof Date) {
      // If it's a Date object, format it to "D.M"
      dateStr = dateValue.getDate() + '.' + (dateValue.getMonth() + 1);
    } else {
      // If it's already a string, use it directly
      dateStr = dateValue.toString();
    }

    // Skip separator rows
    if (!dateStr || dateStr.indexOf('Woche') !== -1) {
      return;
    }

    // Determine which dentist column this is
    var dentistIndex = Math.floor((col - 3) / 10);
    var timeSlotIndex = (col - 3) % 10;

    if (dentistIndex < 0 || dentistIndex >= DENTISTS.length) {
      return;
    }

    if (timeSlotIndex < 0 || timeSlotIndex >= TIME_SLOTS.length) {
      return;
    }

    var dentistName = DENTISTS[dentistIndex];
    var timeSlot = TIME_SLOTS[timeSlotIndex];

    // Get dentist email from row 2
    var emailColStart = 3 + (dentistIndex * 10);
    var dentistEmail = sheet.getRange(2, emailColStart).getValue();

    Logger.log('📋 Booking details: ' + dentistName + ' | ' + dentistEmail + ' | ' + dateStr + ' ' + timeSlot);

    // Check if email is valid (not placeholder)
    if (!dentistEmail || dentistEmail === 'E-Mail hier eingeben') {
      Logger.log('⚠️ No valid email for ' + dentistName + ' - Email not configured');
      return;
    }

    Logger.log('📧 Sending email to: ' + dentistEmail);

    // Send email notification
    sendDentistNotification(dentistName, dentistEmail, dateStr, dayName, timeSlot);

    Logger.log('📅 Creating calendar event...');

    // Create Google Calendar event
    createGoogleCalendarEvent(dentistEmail, dentistName, dateStr, dayName, timeSlot);

    Logger.log('✅ Notification sent and calendar synced for ' + dentistName);

  } catch (error) {
    Logger.log('❌ Error handling appointment change: ' + error.toString());
  }
}

// ============================================
// Send email notification to dentist
// ============================================

function sendDentistNotification(dentistName, dentistEmail, dateStr, dayName, timeSlot) {
  try {
    var subject = 'Neue Terminbuchung - ' + dateStr + ' um ' + timeSlot;

    var body = 'Guten Tag ' + dentistName + ',\n\n' +
               'Sie haben einen neuen Termin:\n\n' +
               'Datum: ' + dayName + ', ' + dateStr + '\n' +
               'Uhrzeit: ' + timeSlot + '\n\n' +
               'Dieser Termin wurde automatisch in Ihrem Google Kalender eingetragen.\n\n' +
               'Mit freundlichen Grüßen,\n' +
               'Ihr Praxis-Team';

    MailApp.sendEmail({
      to: dentistEmail,
      subject: subject,
      body: body
    });

    Logger.log('📧 Email sent to: ' + dentistEmail);

  } catch (error) {
    Logger.log('❌ Email error: ' + error.toString());
  }
}

// ============================================
// Create Google Calendar event
// ============================================

function createGoogleCalendarEvent(dentistEmail, dentistName, dateStr, dayName, timeSlot) {
  try {
    // Parse date (format: "D.M")
    var parts = dateStr.toString().split('.');
    if (parts.length < 2) {
      Logger.log('⚠️ Invalid date format: ' + dateStr);
      return;
    }

    var day = parseInt(parts[0], 10);
    var month = parseInt(parts[1], 10);
    var year = new Date().getFullYear();

    // Parse time (format: "HH:00")
    var timeParts = timeSlot.split(':');
    var hour = parseInt(timeParts[0], 10);

    // Create start and end times (1 hour appointment)
    var startTime = new Date(year, month - 1, day, hour, 0, 0);
    var endTime = new Date(year, month - 1, day, hour + 1, 0, 0);

    // Create event title
    var eventTitle = 'Patient Termin - ' + timeSlot;

    // Get the dentist's calendar using their email as Calendar ID
    var calendar;
    try {
      calendar = CalendarApp.getCalendarById(dentistEmail);

      // If calendar not found or not accessible, fall back to default
      if (!calendar) {
        Logger.log('⚠️ Calendar not found for ' + dentistEmail + ', using default calendar');
        calendar = CalendarApp.getDefaultCalendar();
      }
    } catch (calError) {
      Logger.log('⚠️ Cannot access calendar ' + dentistEmail + ': ' + calError.toString());
      Logger.log('Using default calendar as fallback');
      calendar = CalendarApp.getDefaultCalendar();
    }

    // Create the event
    var event = calendar.createEvent(eventTitle, startTime, endTime, {
      description: 'Automatisch erstellt für ' + dentistName + '\nDatum: ' + dayName + ', ' + dateStr,
      location: 'Zahnarztpraxis'
    });

    Logger.log('📅 Calendar event created in ' + (calendar.getId() === CalendarApp.getDefaultCalendar().getId() ? 'default calendar' : dentistEmail) + ': ' + event.getId());

  } catch (error) {
    Logger.log('❌ Calendar error: ' + error.toString());
  }
}

// ============================================
// Initialize Patients sheet
// ============================================

function initializePatientsSheet() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Patients');

    if (sheet) {
      Logger.log('⚠️ Patients sheet already exists');
      return 'Patients sheet already exists';
    }

    sheet = ss.insertSheet('Patients');
    sheet.appendRow([
      'Patient ID', 'Vorname', 'Nachname', 'Geburtsjahr', 'Email', 'Telefon',
      'Adresse', 'Versicherung', 'Erinnerung (Stunden)', 'Notizen', 'Erstellt am',
      'Behandlungsergebnis', 'Behandlung abgeschlossen'
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

    // Auto-resize all columns to fit content
    sheet.autoResizeColumns(1, 13);

    // Set minimum widths for better readability
    sheet.setColumnWidth(1, Math.max(120, sheet.getColumnWidth(1)));  // Patient ID
    sheet.setColumnWidth(2, Math.max(120, sheet.getColumnWidth(2)));  // Vorname
    sheet.setColumnWidth(3, Math.max(120, sheet.getColumnWidth(3)));  // Nachname
    sheet.setColumnWidth(4, Math.max(100, sheet.getColumnWidth(4)));  // Geburtsjahr
    sheet.setColumnWidth(5, Math.max(200, sheet.getColumnWidth(5)));  // Email
    sheet.setColumnWidth(6, Math.max(120, sheet.getColumnWidth(6)));  // Telefon
    sheet.setColumnWidth(7, Math.max(200, sheet.getColumnWidth(7)));  // Adresse
    sheet.setColumnWidth(8, Math.max(150, sheet.getColumnWidth(8)));  // Versicherung
    sheet.setColumnWidth(9, Math.max(140, sheet.getColumnWidth(9)));  // Erinnerung (Stunden)
    sheet.setColumnWidth(10, Math.max(250, sheet.getColumnWidth(10))); // Notizen
    sheet.setColumnWidth(11, Math.max(140, sheet.getColumnWidth(11))); // Erstellt am
    sheet.setColumnWidth(12, Math.max(180, sheet.getColumnWidth(12))); // Behandlungsergebnis
    sheet.setColumnWidth(13, Math.max(160, sheet.getColumnWidth(13))); // Behandlung abgeschlossen

    // Add checkbox validation for "Hoàn tất điều trị" column
    var checkboxRange = sheet.getRange(2, 13, 1000, 1); // Apply to rows 2-1001
    var checkboxRule = SpreadsheetApp.newDataValidation()
      .requireCheckbox()
      .setAllowInvalid(false)
      .build();
    checkboxRange.setDataValidation(checkboxRule);

    sheet.setFrozenRows(1);

    Logger.log('✅ Patients sheet created');
    return 'SUCCESS: Patients sheet created';

  } catch (error) {
    Logger.log('❌ Error: ' + error.toString());
    return 'ERROR: ' + error.toString();
  }
}

// ============================================
// Initialize Review Form (NO manual sheet creation)
// ============================================

function initializeDentistReviewsSheet() {
  try {
    // Only create the Google Form - it will auto-create its own response sheet
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    createReviewForm(ss);

    return 'SUCCESS: Review Form created';

  } catch (error) {
    Logger.log('❌ Error: ' + error.toString());
    return 'ERROR: ' + error.toString();
  }
}

// ============================================
// Create Google Form for Dentist Reviews (SIMPLE VERSION - NO PRE-FILL)
// ============================================

function createReviewForm(spreadsheet) {
  try {
    // Check if form already exists
    var formUrl = PropertiesService.getScriptProperties().getProperty('REVIEW_FORM_URL');
    if (formUrl) {
      Logger.log('⚠️ Review form already exists: ' + formUrl);
      return formUrl;
    }

    // Create new form (German only)
    var form = FormApp.create('Zahnarzt Bewertung');

    // Set form description (German only)
    form.setDescription('Bitte bewerten Sie Ihre Behandlung.\n\nVielen Dank für Ihr Feedback!');

    // Set confirmation message (German only)
    form.setConfirmationMessage('✅ Vielen Dank für Ihre Bewertung!');

    // Allow multiple responses
    form.setLimitOneResponsePerUser(false);
    form.setCollectEmail(true); // Collect email for identification

    // Question 1: Doctor Name (dropdown)
    form.addMultipleChoiceItem()
      .setTitle('Welcher Arzt hat Sie behandelt?')
      .setChoiceValues(['Seitschenko-Dinh', 'Kukadiya', 'Ikikardes', 'Taifour', 'Nikolaou'])
      .setRequired(true);

    // Question 4: Treatment Date
    form.addDateItem()
      .setTitle('Behandlungsdatum')
      .setHelpText('Wann wurden Sie behandelt?')
      .setRequired(true);

    // Question 5: Rating (1-5 stars)
    form.addScaleItem()
      .setTitle('⭐ Bewertung\n\nWie bewerten Sie Ihre Behandlung?')
      .setBounds(1, 5)
      .setLabels('⭐ Sehr schlecht', '⭐⭐⭐⭐⭐ Ausgezeichnet')
      .setRequired(true);

    // Question 6: Review Text (optional)
    form.addParagraphTextItem()
      .setTitle('💬 Ihre Bewertung (optional)\n\nBeschreiben Sie Ihre Erfahrung mit dem Arzt und der Behandlung')
      .setRequired(false);

    // Link form to Dentist_Reviews sheet
    form.setDestination(FormApp.DestinationType.SPREADSHEET, spreadsheet.getId());

    // Get form URL and Form ID
    var formUrl = form.getPublishedUrl();
    var formId = form.getId();
    var editUrl = form.getEditUrl();

    // Save to Script Properties
    PropertiesService.getScriptProperties().setProperty('REVIEW_FORM_URL', formUrl);
    PropertiesService.getScriptProperties().setProperty('REVIEW_FORM_ID', formId);
    PropertiesService.getScriptProperties().setProperty('REVIEW_FORM_EDIT_URL', editUrl);

    Logger.log('✅ Review form created: ' + formUrl);
    Logger.log('📝 Form ID: ' + formId);
    Logger.log('📝 Edit form: ' + editUrl);

    return formUrl;

  } catch (error) {
    Logger.log('❌ Error creating review form: ' + error.toString());
    return null;
  }
}

// ============================================
// Delete and recreate review form
// ============================================

function deleteAndRecreateReviewForm() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // Step 1: Delete old form if exists
    var formId = PropertiesService.getScriptProperties().getProperty('REVIEW_FORM_ID');
    if (formId) {
      try {
        var form = FormApp.openById(formId);
        var formTitle = form.getTitle();

        // Delete the form
        DriveApp.getFileById(formId).setTrashed(true);
        Logger.log('✅ Deleted old form: ' + formTitle);
      } catch (e) {
        Logger.log('⚠️ Could not delete old form (may already be deleted): ' + e.toString());
      }
    }

    // Step 2: Delete old response sheet if exists
    var sheets = ss.getSheets();
    for (var i = 0; i < sheets.length; i++) {
      var sheetName = sheets[i].getName();
      // Look for form response sheets (Vietnamese or German)
      if (sheetName.indexOf('Câu trả lời') !== -1 ||
          sheetName.indexOf('Form_Responses') !== -1 ||
          sheetName.indexOf('Formularantworten') !== -1 ||
          sheetName.indexOf('Form-Antworten') !== -1) {
        ss.deleteSheet(sheets[i]);
        Logger.log('✅ Deleted old response sheet: ' + sheetName);
      }
    }

    // Step 3: Clear script properties
    PropertiesService.getScriptProperties().deleteProperty('REVIEW_FORM_URL');
    PropertiesService.getScriptProperties().deleteProperty('REVIEW_FORM_ID');
    PropertiesService.getScriptProperties().deleteProperty('REVIEW_FORM_EDIT_URL');
    Logger.log('✅ Cleared form properties');

    // Step 4: Create new form
    Logger.log('📝 Creating new review form...');
    var newFormUrl = createReviewForm(ss);

    if (newFormUrl) {
      Logger.log('✅ SUCCESS: New review form created');
      Logger.log('🔗 Form URL: ' + newFormUrl);

      // Show success message
      SpreadsheetApp.getUi().alert(
        '✅ Form đã được tạo lại thành công!\n\n' +
        '🔗 URL: ' + newFormUrl + '\n\n' +
        '⚠️ LƯU Ý:\n' +
        '- Nếu headers vẫn hiển thị tiếng Việt, vui lòng:\n' +
        '  1. Vào https://myaccount.google.com/language\n' +
        '  2. Chọn "Deutsch" (Tiếng Đức)\n' +
        '  3. Lưu và chạy lại function này'
      );

      return 'SUCCESS: Review form recreated';
    } else {
      throw new Error('Failed to create new form');
    }

  } catch (error) {
    Logger.log('❌ Error: ' + error.toString());
    SpreadsheetApp.getUi().alert('❌ Lỗi: ' + error.toString());
    return 'ERROR: ' + error.toString();
  }
}

// ============================================
// Review form submission handling removed
// Google Forms automatically collects responses
// ============================================

// ============================================
// Sync patient info to Patients sheet
// ============================================

function syncPatientInfo(patientData) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var patientsSheet = ss.getSheetByName('Patients');

    // Create Patients sheet if it doesn't exist
    if (!patientsSheet) {
      Logger.log('📋 Creating Patients sheet...');
      initializePatientsSheet();
      patientsSheet = ss.getSheetByName('Patients');
    }

    var patientFirstname = patientData.patientFirstname || '';
    var patientLastname = patientData.patientLastname || '';
    var patientEmail = patientData.patientEmail || '';
    var patientPhone = patientData.patientPhone || '';
    var patientBirthYear = patientData.patientBirthYear || '';
    var reminderTime = patientData.reminderTime || '2';

    // Skip if essential info is missing
    if (!patientFirstname || patientFirstname === '-' || !patientLastname || patientLastname === '-') {
      Logger.log('⚠️ No patient name, skipping sync');
      return;
    }

    // Generate Patient ID: FirstnameLastname + PhoneDigits (e.g., TIEN5643)
    // Remove Vietnamese accents and special characters
    function removeAccents(str) {
      var accents = 'ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ';
      var noAccents = 'AAAAEEEIIOOOOUUADIUOaaaaeeeiioooouuadiuoUAAAAAAAAAAAAAAAAAEEEEEuaaaaaaaaaaaaaaaaaaEEIIOOOOOOOOOOOOUUUUeeiioooooooooooouuuuUUUYYYYYuuuyyyy';
      var newStr = '';
      for (var i = 0; i < str.length; i++) {
        var pos = accents.indexOf(str[i]);
        newStr += (pos !== -1) ? noAccents[pos] : str[i];
      }
      return newStr.replace(/[^a-zA-Z0-9]/g, ''); // Remove all non-alphanumeric
    }

    var phoneDigits = patientPhone.replace(/[^0-9]/g, '');
    var lastSixDigits = phoneDigits.slice(-6);
    var cleanFirstname = removeAccents(patientFirstname);

    // Debug logging to diagnose Patient ID generation
    Logger.log('🔍 Patient ID Generation:');
    Logger.log('   - Original firstname: "' + patientFirstname + '"');
    Logger.log('   - Clean firstname: "' + cleanFirstname + '"');
    Logger.log('   - Phone: "' + patientPhone + '"');
    Logger.log('   - Phone digits: "' + phoneDigits + '"');
    Logger.log('   - Last 6 digits: "' + lastSixDigits + '"');

    // Only use firstname (not lastname) + last 6 digits of phone
    var patientId = cleanFirstname + lastSixDigits;
    patientId = patientId.toUpperCase();

    Logger.log('   - Final Patient ID: "' + patientId + '"');

    // Check if patient already exists (by Patient ID ONLY - not by email to prevent false matches)
    var data = patientsSheet.getDataRange().getDisplayValues();
    var existingRow = -1;

    Logger.log('🔍 Looking for existing patient with ID: ' + patientId);

    for (var i = 1; i < data.length; i++) {
      var rowId = data[i][0] ? data[i][0].trim() : '';

      // Match by Patient ID ONLY (firstname + last 6 digits of phone)
      // This prevents false matches where different patients have same email
      if (rowId === patientId) {
        existingRow = i + 1; // Convert to 1-based row index
        Logger.log('✅ Found existing patient at row ' + existingRow);
        break;
      }
    }

    if (existingRow === -1) {
      Logger.log('➕ Patient ID ' + patientId + ' not found - will create new row');
    }

    if (existingRow !== -1) {
      // Patient exists - update existing record
      Logger.log('🔄 Updating existing patient: ' + patientFirstname + ' ' + patientLastname + ' (row ' + existingRow + ')');

      // Update fields if new data is available (don't overwrite with '-')
      if (patientFirstname && patientFirstname !== '-') {
        patientsSheet.getRange(existingRow, 2).setValue(patientFirstname); // Vorname
      }
      if (patientLastname && patientLastname !== '-') {
        patientsSheet.getRange(existingRow, 3).setValue(patientLastname); // Nachname
      }
      if (patientBirthYear && patientBirthYear !== '-') {
        patientsSheet.getRange(existingRow, 4).setValue(patientBirthYear); // Geburtsjahr
      }
      if (patientEmail && patientEmail !== '-') {
        patientsSheet.getRange(existingRow, 5).setValue(patientEmail); // Email
      }
      if (patientPhone && patientPhone !== '-') {
        patientsSheet.getRange(existingRow, 6).setValue(patientPhone); // Telefon
      }
      if (reminderTime && reminderTime !== '-') {
        patientsSheet.getRange(existingRow, 9).setValue(reminderTime); // Erinnerung (Stunden)
      }

      // Update timestamp
      patientsSheet.getRange(existingRow, 11).setValue(new Date()); // Erstellt am (last updated)

    } else {
      // New patient - add new row
      Logger.log('➕ Adding new patient: ' + patientFirstname + ' ' + patientLastname);

      var timestamp = new Date();

      var newRow = [
        patientId,
        patientFirstname,
        patientLastname,
        patientBirthYear === '-' ? '' : patientBirthYear,
        patientEmail === '-' ? '' : patientEmail,
        patientPhone === '-' ? '' : patientPhone,
        '', // Adresse (empty for now)
        '', // Versicherung (empty for now)
        reminderTime,
        '', // Notizen (empty for now)
        timestamp,
        '', // Kết quả điều trị (empty for now)
        false // Hoàn tất điều trị (unchecked by default)
      ];

      // Count existing patients by checking Patient ID column (column 1)
      // This is more reliable than searching for empty rows
      var existingData = patientsSheet.getDataRange().getValues();
      var patientCount = 0;

      // Count rows with non-empty Patient ID (starting from row 2, index 1)
      for (var i = 1; i < existingData.length; i++) {
        var patientIdInRow = existingData[i][0] ? existingData[i][0].toString().trim() : '';
        if (patientIdInRow !== '') {
          patientCount++;
        }
      }

      // New row number = Row 1 (header) + number of existing patients + 1
      var newRowNumber = 1 + patientCount + 1;

      Logger.log('📊 Existing patients found: ' + patientCount);
      Logger.log('📝 Writing new patient to row: ' + newRowNumber);

      // Write data to specific row
      patientsSheet.getRange(newRowNumber, 1, 1, 13).setValues([newRow]);

      // Format new row
      var newRowRange = patientsSheet.getRange(newRowNumber, 1, 1, 13);
      newRowRange.setBorder(true, true, true, true, true, true, '#000000', SpreadsheetApp.BorderStyle.SOLID);
      newRowRange.setVerticalAlignment('middle');
      newRowRange.setBackground(newRowNumber % 2 === 0 ? '#f9fafb' : '#ffffff');

      Logger.log('✅ Patient added at row ' + newRowNumber + ': ' + patientId + ' - ' + patientFirstname + ' ' + patientLastname);
    }

  } catch (error) {
    Logger.log('❌ Error syncing patient: ' + error.toString());
  }
}

// ============================================
// Check and send appointment reminders (run every hour)
// ============================================

function checkAndSendReminders() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var appointmentsSheet = ss.getSheetByName('New_Appointments');

    if (!appointmentsSheet) {
      Logger.log('⚠️ New_Appointments sheet not found');
      return;
    }

    var data = appointmentsSheet.getDataRange().getDisplayValues();
    var now = new Date();

    var remindersSent = 0;

    // Skip header row
    for (var i = 1; i < data.length; i++) {
      var row = data[i];

      // Columns: [Zeitstempel, Symptom, Arzt, Arzt E-Mail, Arzt Telefon, Datum, Zeit, Beschreibung, Sprache, Patient Vorname, Patient Nachname, Patient Geburtsjahr, Patient Telefon, Patient E-Mail, Erinnerung (Stunden)]
      var dateStr = row[5] ? row[5].trim() : '';
      var timeStr = row[6] ? row[6].trim() : '';
      var patientFirstname = row[9] ? row[9].trim() : '';
      var patientLastname = row[10] ? row[10].trim() : '';
      var patientEmail = row[13] ? row[13].trim() : '';
      var doctorName = row[2] ? row[2].trim() : '';
      var reminderTime = row[14] ? parseFloat(row[14]) : 2; // Hours before appointment

      var patientName = patientFirstname + ' ' + patientLastname;

      if (!dateStr || !timeStr || !patientEmail || patientEmail === '-') {
        continue;
      }

      // Parse appointment date and time
      var dateParts = dateStr.split('.');
      if (dateParts.length < 2) continue;

      var day = parseInt(dateParts[0], 10);
      var month = parseInt(dateParts[1], 10);
      var year = dateParts.length >= 3 ? parseInt(dateParts[2], 10) : new Date().getFullYear();

      var timeParts = timeStr.split(':');
      if (timeParts.length < 2) continue;

      var hour = parseInt(timeParts[0], 10);
      var minute = parseInt(timeParts[1], 10);

      var appointmentTime = new Date(year, month - 1, day, hour, minute, 0);

      // Calculate time until appointment
      var timeDiff = appointmentTime.getTime() - now.getTime();
      var hoursUntil = timeDiff / (1000 * 60 * 60);

      // Send single reminder based on patient's reminder time setting
      var shouldSendReminder = false;
      var reminderMessage = '';

      // Send reminder within +/- 0.5 hour window of reminderTime
      if (hoursUntil >= (reminderTime - 0.5) && hoursUntil <= (reminderTime + 0.5)) {
        shouldSendReminder = true;

        // Format reminder message based on time
        if (reminderTime < 1) {
          reminderMessage = (reminderTime * 60) + ' Minuten';
        } else if (reminderTime === 1) {
          reminderMessage = '1 Stunde';
        } else if (reminderTime === 24) {
          reminderMessage = '1 Tag';
        } else {
          reminderMessage = reminderTime + ' Stunden';
        }
      }

      if (shouldSendReminder) {
        sendPatientReminder(patientName, patientEmail, doctorName, dateStr, timeStr, reminderMessage);
        remindersSent++;
        Logger.log('✅ Reminder sent to: ' + patientEmail + ' for appointment at ' + dateStr + ' ' + timeStr + ' (' + reminderMessage + ' before)');
      }
    }

    Logger.log('📧 Sent ' + remindersSent + ' appointment reminders');
    return 'Sent ' + remindersSent + ' reminders';

  } catch (error) {
    Logger.log('❌ Error checking reminders: ' + error.toString());
    return 'ERROR: ' + error.toString();
  }
}

// ============================================
// Send immediate confirmation email to patient
// ============================================

function sendPatientConfirmation(patientFirstname, patientLastname, patientEmail, patientPhone, patientBirthYear, doctorName, dateStr, timeStr, symptom, description, reminderTime) {
  try {
    Logger.log('📧 sendPatientConfirmation called for: ' + patientEmail);
    var patientName = patientFirstname + ' ' + patientLastname;
    var subject = 'Terminbestätigung - Zahnarztpraxis';
    Logger.log('📧 Preparing email with subject: ' + subject);

    // Get location info based on doctor
    var location = getLocationByDentist(doctorName);
    var locationName = 'Zahnarztpraxis';
    var locationAddress = '';
    var locationPhone = '0202 660828';
    var locationEmail = 'info@zahnarztpraxis.de';
    var locationGmaps = '';

    if (location) {
      locationName = location.name;
      locationAddress = location.address + ', ' + location.postalCode + ' ' + location.city;
      locationPhone = location.phone;
      locationEmail = location.email;
      locationGmaps = location.gmapsUrl;
    }

    Logger.log('📧 Using location: ' + locationName + ' / ' + locationEmail + ' / ' + locationPhone);

    // Convert reminder time to readable format
    var reminderText = '';
    if (reminderTime == '0.5') reminderText = '30 Minuten';
    else if (reminderTime == '1') reminderText = '1 Stunde';
    else if (reminderTime == '2') reminderText = '2 Stunden';
    else if (reminderTime == '3') reminderText = '3 Stunden';
    else if (reminderTime == '6') reminderText = '6 Stunden';
    else if (reminderTime == '12') reminderText = '12 Stunden';
    else if (reminderTime == '24') reminderText = '1 Tag';
    else reminderText = reminderTime + ' Stunden';

    var body = 'Sehr geehrte/r ' + patientName + ',\n\n' +
               'vielen Dank für Ihre Terminanfrage. Wir haben folgende Daten erhalten:\n\n' +
               '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
               'PATIENTENDATEN:\n' +
               '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
               'Name: ' + patientName + '\n' +
               'Geburtsjahr: ' + patientBirthYear + '\n' +
               'Telefon: ' + patientPhone + '\n' +
               'E-Mail: ' + patientEmail + '\n\n' +
               '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
               'TERMINDETAILS:\n' +
               '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
               'Arzt: ' + doctorName + '\n' +
               'Datum: ' + dateStr + '\n' +
               'Uhrzeit: ' + timeStr + '\n' +
               'Grund: ' + symptom + '\n';

    if (description && description !== '-') {
      body += 'Beschreibung: ' + description + '\n';
    }

    body += '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
            'PRAXIS-STANDORT:\n' +
            '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
            locationName + '\n' +
            '📍 Adresse: ' + locationAddress + '\n' +
            '📞 Telefon: ' + locationPhone + '\n' +
            '📧 E-Mail: ' + locationEmail + '\n';

    if (locationGmaps) {
      body += '🗺️ Google Maps: ' + locationGmaps + '\n';
    }

    body += '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
            'ERINNERUNG:\n' +
            '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
            'Sie erhalten eine Erinnerung ' + reminderText + ' vor Ihrem Termin per E-Mail.\n\n' +
            'Falls Sie Fragen haben oder den Termin ändern möchten, kontaktieren Sie uns bitte.\n\n' +
            'Mit freundlichen Grüßen,\n' +
            'Ihr Praxis-Team';

    Logger.log('📧 Calling MailApp.sendEmail to: ' + patientEmail);
    MailApp.sendEmail({
      to: patientEmail,
      subject: subject,
      body: body
    });

    Logger.log('✅ Confirmation email sent successfully to: ' + patientEmail);

  } catch (error) {
    Logger.log('❌ Confirmation email error: ' + error.toString());
  }
}

// ============================================
// Handle treatment completion checkbox
// ============================================

function handleTreatmentCompletion(sheet, row) {
  try {
    // Get checkbox value (column 13)
    var isCompleted = sheet.getRange(row, 13).getValue();

    // Only proceed if checkbox is checked (TRUE)
    if (isCompleted !== true) {
      Logger.log('⚠️ Treatment not marked as completed, skipping email');
      return;
    }

    // Get patient data from the row
    var patientId = sheet.getRange(row, 1).getValue() || '';
    var patientFirstname = sheet.getRange(row, 2).getValue() || '';
    var patientLastname = sheet.getRange(row, 3).getValue() || '';
    var patientEmail = sheet.getRange(row, 5).getValue() || '';

    // Validate required fields
    if (!patientEmail || patientEmail === '' || !patientFirstname) {
      Logger.log('⚠️ Missing patient email or name, cannot send review request');
      return;
    }

    var patientName = patientFirstname + ' ' + patientLastname;

    // Get treatment result (column 12)
    var treatmentResult = sheet.getRange(row, 12).getValue() || 'Behandlung abgeschlossen';

    // Get the last appointment data from New_Appointments sheet for this patient
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var appointmentsSheet = ss.getSheetByName('New_Appointments');

    var doctorName = '';
    var appointmentDate = '';

    if (appointmentsSheet) {
      var appointmentsData = appointmentsSheet.getDataRange().getDisplayValues(); // Use getDisplayValues() to get formatted strings

      // Search from bottom to top to get the most recent appointment
      for (var i = appointmentsData.length - 1; i >= 1; i--) {
        var rowFirstname = appointmentsData[i][9] || '';
        var rowLastname = appointmentsData[i][10] || '';
        var rowEmail = appointmentsData[i][13] || '';

        Logger.log('🔍 Checking appointment row ' + i + ': ' + rowFirstname + ' ' + rowLastname + ' (' + rowEmail + ')');

        // Match by name or email
        if ((rowFirstname === patientFirstname && rowLastname === patientLastname) ||
            (rowEmail === patientEmail)) {
          doctorName = appointmentsData[i][2] || 'Ihr Arzt';
          appointmentDate = appointmentsData[i][5] || ''; // Now this is a string like "5.12.2025"

          Logger.log('✅ Found matching appointment:');
          Logger.log('   Doctor: ' + doctorName);
          Logger.log('   Date (raw): ' + appointmentDate);

          break;
        }
      }
    }

    Logger.log('📝 Generating pre-filled URL with:');
    Logger.log('   Patient ID: ' + patientId);
    Logger.log('   Patient Name: ' + patientName);
    Logger.log('   Doctor Name: ' + doctorName);
    Logger.log('   Appointment Date: ' + appointmentDate);

    // Generate Google Form URL with pre-filled data
    var reviewFormUrl = getPrefilledReviewFormUrl(patientId, patientName, doctorName, appointmentDate);

    // Send review request email
    sendReviewRequestEmail(patientName, patientEmail, doctorName, appointmentDate, treatmentResult, reviewFormUrl);

    Logger.log('✅ Review request email sent to: ' + patientEmail);

  } catch (error) {
    Logger.log('❌ Treatment completion handling error: ' + error.toString());
  }
}

// ============================================
// Send review request email to patient
// ============================================

function sendReviewRequestEmail(patientName, patientEmail, doctorName, treatmentDate, treatmentResult, reviewFormUrl) {
  try {
    var subject = '⭐ Bitte bewerten Sie Ihre Behandlung - ' + doctorName;

    var body = 'Sehr geehrte/r ' + patientName + ',\n\n' +
               'vielen Dank, dass Sie unsere Praxis besucht haben!\n\n' +
               '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
               'IHRE BEHANDLUNG:\n' +
               '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
               '👨‍⚕️ Arzt: ' + doctorName + '\n' +
               '📅 Datum: ' + treatmentDate + '\n' +
               '📋 Ergebnis: ' + treatmentResult + '\n\n' +
               'Ihre Behandlung wurde erfolgreich abgeschlossen.\n\n' +
               '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
               'WIR BRAUCHEN IHR FEEDBACK:\n' +
               '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
               'Bitte nehmen Sie sich 2 Minuten Zeit, um Ihre Erfahrung zu bewerten.\n' +
               'Ihr Feedback hilft uns, unseren Service zu verbessern!\n\n' +
               '⭐ Bewerten Sie hier:\n' +
               reviewFormUrl + '\n\n' +
               'Vielen Dank für Ihr Vertrauen!\n\n' +
               'Mit freundlichen Grüßen,\n' +
               'Ihr Praxis-Team';

    MailApp.sendEmail({
      to: patientEmail,
      subject: subject,
      body: body
    });

    Logger.log('✅ Review request email sent to: ' + patientEmail);

  } catch (error) {
    Logger.log('❌ Review request email error: ' + error.toString());
  }
}

// ============================================
// Send appointment reminder to patient (SHORT VERSION)
// ============================================

function sendPatientReminder(patientName, patientEmail, doctorName, dateStr, timeStr, reminderMessage) {
  try {
    var subject = '⏰ Terminerinnerung - ' + dateStr + ' um ' + timeStr;

    var body = 'Guten Tag ' + patientName + ',\n\n' +
               '⏰ TERMINERINNERUNG\n\n' +
               '📅 Datum: ' + dateStr + '\n' +
               '🕐 Uhrzeit: ' + timeStr + '\n' +
               '👨‍⚕️ Arzt: ' + doctorName + '\n\n' +
               'Ihr Termin ist in ca. ' + reminderMessage + '.\n' +
               'Bitte kommen Sie pünktlich.\n\n' +
               'Mit freundlichen Grüßen,\n' +
               'Ihr Praxis-Team';

    MailApp.sendEmail({
      to: patientEmail,
      subject: subject,
      body: body
    });

    Logger.log('📧 Reminder sent to: ' + patientEmail);

  } catch (error) {
    Logger.log('❌ Reminder email error: ' + error.toString());
  }
}

// ============================================
// Generate pre-filled review form URL
// ============================================

function getPrefilledReviewFormUrl(patientId, patientName, doctorName, appointmentDate) {
  try {
    // Get form URL from Script Properties (use URL, not ID for safety)
    var formUrl = PropertiesService.getScriptProperties().getProperty('REVIEW_FORM_URL');
    var formId = PropertiesService.getScriptProperties().getProperty('REVIEW_FORM_ID');

    if (!formUrl && !formId) {
      Logger.log('⚠️ Review form not found in Script Properties');
      Logger.log('⚠️ Please create form first: Menu → ⭐ Create Review Form');
      return 'https://forms.google.com';
    }

    // If we have URL but no ID, extract ID from URL
    if (formUrl && !formId) {
      var urlParts = formUrl.match(/\/forms\/d\/([a-zA-Z0-9-_]+)/);
      if (urlParts && urlParts[1]) {
        formId = urlParts[1];
        Logger.log('📝 Extracted Form ID from URL: ' + formId);
      } else {
        Logger.log('⚠️ Could not extract form ID from URL, returning plain URL');
        return formUrl;
      }
    }

    Logger.log('📝 Form ID: ' + formId);
    Logger.log('📝 Form URL: ' + formUrl);
    Logger.log('📝 Patient data: ' + patientName + ' | ' + doctorName + ' | ' + appointmentDate);

    // Get the form to retrieve Entry IDs
    var form = FormApp.openById(formId);
    var items = form.getItems();

    Logger.log('📋 Total questions in form: ' + items.length);

    // Build pre-fill URL
    var baseUrl = 'https://docs.google.com/forms/d/' + formId + '/viewform?usp=pp_url';

    // Find Entry IDs for doctor and date questions ONLY (no name/email fields in current form)
    var entryIds = {
      doctorName: null,
      treatmentDate: null
    };

    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var title = item.getTitle();
      var itemId = item.getId();

      Logger.log('📋 Question ' + i + ': "' + title + '" (ID: ' + itemId + ')');

      // Match questions by title (German)
      // Question 1: "Welcher Arzt hat Sie behandelt?"
      if (title.indexOf('Arzt') !== -1 && title.indexOf('behandelt') !== -1) {
        entryIds.doctorName = 'entry.' + itemId;
        Logger.log('   ✅ Matched as Doctor Name field');
      }
      // Question 2: "Behandlungsdatum"
      else if (title.indexOf('Behandlungsdatum') !== -1) {
        entryIds.treatmentDate = 'entry.' + itemId;
        Logger.log('   ✅ Matched as Treatment Date field');
      }
    }

    Logger.log('📝 Entry IDs found: ' + JSON.stringify(entryIds));

    // Build pre-filled URL with URL encoding
    var prefilledUrl = baseUrl;

    // Pre-fill doctor name (dropdown field)
    if (entryIds.doctorName && doctorName) {
      prefilledUrl += '&' + entryIds.doctorName + '=' + encodeURIComponent(doctorName);
      Logger.log('   ✅ Pre-filled doctor: ' + doctorName);
    }

    // Pre-fill treatment date (date field - format: YYYY-MM-DD)
    if (entryIds.treatmentDate && appointmentDate) {
      // Format date for Google Forms (YYYY-MM-DD)
      var dateParts = appointmentDate.split('.');
      if (dateParts.length >= 2) {
        var day = dateParts[0];
        var month = dateParts[1];
        var year = dateParts.length >= 3 ? dateParts[2] : new Date().getFullYear().toString();

        // Pad with zeros
        if (day.length === 1) day = '0' + day;
        if (month.length === 1) month = '0' + month;

        var formattedDate = year + '-' + month + '-' + day;
        prefilledUrl += '&' + entryIds.treatmentDate + '=' + formattedDate;
        Logger.log('   ✅ Pre-filled date: ' + formattedDate + ' (from ' + appointmentDate + ')');
      }
    }

    Logger.log('✅ Final pre-filled URL: ' + prefilledUrl);
    return prefilledUrl;

  } catch (error) {
    Logger.log('❌ Error generating pre-filled URL: ' + error.toString());
    Logger.log('Stack trace: ' + error.stack);

    // Fallback to base form URL (without pre-fill)
    var fallbackUrl = PropertiesService.getScriptProperties().getProperty('REVIEW_FORM_URL');
    if (fallbackUrl) {
      Logger.log('⚠️ Returning fallback URL (no pre-fill): ' + fallbackUrl);
      return fallbackUrl;
    } else {
      Logger.log('⚠️ No fallback URL available');
      return 'https://forms.google.com';
    }
  }
}

