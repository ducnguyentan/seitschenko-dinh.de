# Multi-Dentist Calendar Structure

## Overview
The Calendar sheet has been redesigned to support **5 dentists with 10 time slots per day**, allowing multiple dentists to be booked simultaneously at the same time.

## Structure Details

### Dentist List
The system supports 5 dentists (from index.html "Unser Ärzteteam"):
1. Seitschenko-Dinh
2. Kukadiya
3. IKIKARDES
4. TAIFOUR
5. NIKOLAOU

### Time Slots
10 time slots per day (reduced from 12):
- 08:00, 09:00, 10:00, 11:00, 12:00, 13:00, 14:00, 15:00, 16:00, 17:00
- Removed: 18:00 and 19:00

### Column Layout
Each day uses **52 columns total**:
- **Columns 1-2**: Date and Day (merged vertically across 3 rows)
- **Columns 3-52**: 10 time slots × 5 dentists = 50 columns

### Header Structure (2 rows)

**Header Row 1: Time Slot Labels**
- Contains time slot values (08:00, 09:00, etc.)
- Each time slot is **merged across 5 columns** (one for each dentist)
- Background: Teal (#14b8a6)
- Font: Bold, size 10
- Row height: 25px

**Header Row 2: Dentist Abbreviations**
- Contains dentist abbreviations: S-D, Kuk, IKI, TAI, NIK
- Repeated for each time slot (5 per time slot)
- Background: Darker teal (#0d9488)
- Font: Bold, size 8
- Row height: 20px

**Date/Day columns**: Merged vertically across both header rows

### Row Structure (3 rows per day)

**Row 1: Time Headers** (for each day)
- Contains time slot values (08:00, 09:00, etc.)
- Each time slot is **merged across 5 columns** (one for each dentist)
- Example: Columns 3-7 all show "08:00" (merged), Columns 8-12 show "09:00" (merged)
- Background: Light blue (#e0f2fe)
- Font: Bold, size 10
- Row height: 25px

**Row 2: Dentist Names**
- Contains dentist names repeated for each time slot
- Example: Columns 3-7 contain [Seitschenko-Dinh, Kukadiya, IKIKARDES, TAIFOUR, NIKOLAOU]
- Same pattern repeats for each time slot
- Background: Rainbow colors (matches time slot colors)
- Font: Bold, size 9
- Text wrapping: Disabled (names display on one line)
- Row height: 30px

**Row 3: Status Values**
- Contains booking status for each dentist at each time
- Possible values: `available`, `blocked`, `hidden`, `booked`
- Dropdown validation applied
- Font: Size 9
- Row height: 28px

### Column Widths
- **Column 1 (Datum)**: 100px
- **Column 2 (Wochentag)**: 90px
- **Columns 3-52 (Time slots)**: 110px each (wide enough to fit "Seitschenko-Dinh" on one line)

### Visual Example

```
| Date       | Day     | -------- 08:00 -------- | -------- 09:00 -------- | ...
| 24.11.2025 | Montag  | 08:00                   | 09:00                   | ...
|            |         | Seit...|Kuka...|IKIK...|TAIF...|NIKO...| (repeat) |
|            |         | avail  |booked |avail  |avail  |avail  | ...
```

### Rainbow Color Scheme

**Time Slot Colors (10 colors for 10 time slots):**
Applied to all 3 rows (Time, Arzt, Status) for each time slot's 5 dentist columns:
1. 08:00: #FFE5E5 (Light red/pink)
2. 09:00: #FFE9D9 (Light orange)
3. 10:00: #FFF4D9 (Light yellow)
4. 11:00: #E5FFE5 (Light green)
5. 12:00: #D9F4FF (Light cyan)
6. 13:00: #E5E5FF (Light blue)
7. 14:00: #F0E5FF (Light purple)
8. 15:00: #FFE5F9 (Light magenta)
9. 16:00: #FFE5EC (Light rose)
10. 17:00: #E5FFF4 (Light mint)

**Day Colors (7 colors for days of week):**
Applied to Date and Day columns (columns 1-2) across all 3 rows:
- Sunday: #FFD6D6 (Red)
- Monday: #FFE0C4 (Orange)
- Tuesday: #FFFAC4 (Yellow)
- Wednesday: #D6FFD6 (Green)
- Thursday: #C4E9FF (Cyan)
- Friday: #D6D6FF (Blue)
- Saturday: #F5D6FF (Purple)

### Conditional Formatting
Applied to Status row (Row 3) for all 50 time slot columns (overlays on top of rainbow colors):
- **Green** (#d1fae5 bg, #065f46 text): `available`
- **Red** (#fee2e2 bg, #991b1b text): `blocked`
- **Yellow** (#fef3c7 bg, #92400e text): `booked`
- **Gray** (#e5e7eb bg, #6b7280 text): `hidden`

### Booked Dentist Name Styling
When a dentist is booked:
- Status cell: Shows "booked" (yellow background via conditional formatting)
- Dentist name cell: **Blue color** (#0369a1), **Bold**

## Key Functions Updated

### 1. `addWeekToCalendar(sheet, startDate, weekNumber)`
- Creates 7 days × 3 rows = 21 rows per week
- Generates 52 columns per day (2 date + 50 time slots)
- Merges time headers horizontally across 5 dentist columns
- Merges date/day vertically across 3 rows
- Sets up dropdown validation for status values

### 2. `updateCalendarStatus(dateStr, timeStr, doctorName)`
- Finds matching date, time, AND dentist name
- Updates Status row to "booked"
- Colors the dentist name cell blue and bold

### 3. `syncCalendarWithAppointments()`
- Loops through all 52 columns (instead of 14)
- Matches appointments by date, time, AND dentist name
- Updates status for specific dentist only
- Colors booked dentist names blue

### 4. `getAvailableTimeSlots(dateStr)`
- Accepts date in either DD.MM or DD.MM.YYYY format (normalizes internally)
- Returns grouped data by time slot
- Each time slot contains array of dentists with their availability
- Response format:
```javascript
{
  status: 'success',
  date: '24.11.2025',
  dayName: 'Montag',
  slots: {
    '08:00': {
      time: '08:00',
      dentists: [
        { name: 'seitschenko-dinh', status: 'available', available: true },
        { name: 'kukadiya', status: 'booked', available: false },
        { name: 'ikikardes', status: 'available', available: true },
        { name: 'taifour', status: 'blocked', available: false },
        { name: 'nikolaou', status: 'available', available: true }
      ]
    },
    '09:00': { ... }
  }
}
```

### 5. `applyCalendarConditionalFormatting(sheet, numRows)`
- Applies conditional formatting to columns 3-52 (50 columns)
- Covers all status rows from row 2 to numRows

## Migration Notes

### From Previous 3-Row Structure
The previous structure had:
- 14 columns (2 date + 12 time slots)
- 1 Zeit row, 1 Status row, 1 Arzt row per day
- Single booking per time slot

New structure has:
- **52 columns** (2 date + 50 time slots)
- 1 Time row, 1 Arzt row, 1 Status row per day
- **5 simultaneous bookings possible** per time slot (one per dentist)

### Breaking Changes
1. **Column count**: Functions must loop to column 52 instead of 14
2. **Separator row**: Now spans 52 columns
3. **Status dropdown**: Now includes "booked" value (4 values instead of 3)
4. **Dentist matching**: Functions must match both time AND dentist name
5. **Time slots**: Only 10 slots (removed 18:00 and 19:00)

### Data Structure Changes
- **Old**: Status row had doctor name when booked
- **New**: Status row has "booked" status, doctor name is always in Arzt row

## Testing Checklist

- [ ] Create new Calendar sheet with `initializeCalendarSheet()`
- [ ] Add week with "Thêm tuần mới" button
- [ ] Verify 52 columns created (2 date + 50 time slots)
- [ ] Verify time headers merged across 5 columns
- [ ] Verify 5 dentist names appear for each time slot
- [ ] Test dropdown in Status row (4 values: available, blocked, hidden, booked)
- [ ] Book appointment for specific dentist
- [ ] Verify status changes to "booked" for that dentist only
- [ ] Verify dentist name turns blue and bold
- [ ] Verify other dentists at same time remain "available"
- [ ] Test `syncCalendarWithAppointments()` function
- [ ] Test `getAvailableTimeSlots()` returns correct grouped data

## Deployment Steps

1. **Backup existing data** from New_Appointments sheet
2. **Delete old Calendar sheet** (structure incompatible)
3. **Deploy updated script** to Google Apps Script
4. **Run `initializeCalendarSheet()`** to create new Calendar
5. **Add weeks** using "Thêm tuần mới" button
6. **Run `syncCalendarWithAppointments()`** to restore booking data
7. **Verify** all bookings restored correctly
8. **Test** new appointment booking flow

## Important Notes

⚠️ **Column Limit**: Google Sheets has a maximum of 18,278 columns. Current structure uses 52 columns per week. This is well within limits.

⚠️ **Performance**: Increased column count may slow down `getDataRange()` operations. Consider using specific ranges when possible.

⚠️ **Frontend Updates**: The `appointment.html` file may need updates to handle the new `getAvailableTimeSlots()` response format with dentist arrays.

## Date Created
2025-11-26

## Last Updated
2025-11-27 - Fixed auto-sync between New_Appointments and Calendar (handles merged cells)
2025-11-27 - Fixed manual sync `syncCalendarWithAppointments()` to handle merged time headers
2025-11-26 - Added rainbow color scheme for time slots and days
2025-11-26 - Standardized format to match New_Appointments: lowercase dentist names, DD.MM date format
2025-11-26 - Fixed `getAvailableTimeSlots()` to accept both DD.MM and DD.MM.YYYY date formats

## Auto-Sync Feature
When a new appointment is booked via `doPost()`:
1. Automatically updates Calendar status to "booked" for that specific dentist at that time
2. Colors the dentist name blue and bold in the Calendar
3. Normalizes date format (DD.MM.YYYY → DD.MM, removes leading zeros)
4. Handles merged time header cells correctly
5. Logs success/failure to execution logs
