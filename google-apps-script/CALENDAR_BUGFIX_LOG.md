# Calendar Bug Fix Log

## Issue: TypeError in addNextWeek() function
**Date**: 2025-11-23
**Error**: `TypeError: Cannot read properties of undefined (reading 'getFullYear')` at line 446

### Root Cause
The `addNextWeek()` function was trying to parse the last date from the Calendar sheet, but the date parsing logic didn't handle all possible return types from `getValue()`:
- Google Sheets `getValue()` can return either a Date object or a string
- The original code assumed it would always be a string
- When it was a Date object (or had unexpected format), parsing failed
- This caused an invalid Date to be passed to `addWeekToCalendar()`
- `addWeekToCalendar()` then tried to call `.getFullYear()` on undefined/invalid Date

### Fixes Applied

#### 1. Enhanced `addWeekToCalendar()` validation (lines 441-453)
```javascript
function addWeekToCalendar(sheet, startDate, weekNumber) {
  // Validate startDate parameter
  if (!startDate) {
    throw new Error('startDate không được để trống');
  }

  if (!(startDate instanceof Date)) {
    throw new Error('startDate phải là Date object. Received: ' + typeof startDate);
  }

  if (isNaN(startDate.getTime())) {
    throw new Error('startDate không hợp lệ: ' + startDate);
  }
  // ... rest of function
}
```

**Why**: Prevents the function from proceeding with invalid dates, gives clear error messages

#### 2. Improved `addNextWeek()` date parsing (lines 647-689)
```javascript
// Get the last date from column B (Date column)
var lastDateValue = calendarSheet.getRange(lastRow, 2).getValue();
Logger.log('📅 Last date value from cell: ' + lastDateValue + ' (type: ' + typeof lastDateValue + ')');

// Validate that we have a value
if (!lastDateValue) {
  throw new Error('Không tìm thấy ngày cuối cùng trong Calendar. Vui lòng kiểm tra dữ liệu.');
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
      throw new Error('Định dạng ngày không hợp lệ: ' + lastDateStr + '. Cần format DD.MM.YYYY');
    }

    lastDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
  }
}

// Validate the Date object is valid
if (!lastDate || isNaN(lastDate.getTime())) {
  throw new Error('Không thể phân tích ngày: ' + lastDateValue);
}

Logger.log('✅ Final parsed date: ' + lastDate.toISOString());
```

**Why**: Handles multiple scenarios:
- Direct Date object from Google Sheets
- String in DD.MM.YYYY format
- Date.toString() results with GMT/UTC

#### 3. Added comprehensive logging
- Logs the raw value and type from the cell
- Logs which parsing path was taken
- Logs the final parsed date
- Helps debug future issues

#### 4. Updated troubleshooting documentation
Added new section in CALENDAR_SETUP.md for debugging date parsing errors

### Testing Checklist
- [ ] Deploy updated code to Apps Script
- [ ] Test `initializeCalendarSheet()` - should create first week
- [ ] Test `addNextWeek()` from menu - should add second week without errors
- [ ] Check Apps Script logs (View > Logs) to verify logging works
- [ ] Test with different date formats in the sheet

### Error Messages Now Provided
Instead of cryptic `Cannot read properties of undefined`, users now get:
- "startDate không được để trống" - if startDate is null/undefined
- "startDate phải là Date object" - if wrong type passed
- "startDate không hợp lệ" - if Date is invalid
- "Không tìm thấy ngày cuối cùng trong Calendar" - if cell is empty
- "Định dạng ngày không hợp lệ" - if string format is wrong
- "Không thể phân tích ngày" - if parsing fails

### Files Modified
1. `appointmentSheet.gs` - Lines 441-453, 647-689
2. `CALENDAR_SETUP.md` - Added troubleshooting section
3. `CALENDAR_BUGFIX_LOG.md` - This file (new)

### Status
✅ **FIXED** - Ready for deployment and testing
