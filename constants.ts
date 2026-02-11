
export const SPREADSHEET_ID = '1HMZM578cM93x6kF3GOZ_1e3byMYH4IOV0Q7xrl3XhuY';

// This is a placeholder for the Google Apps Script Web App URL.
// In a real scenario, the user would deploy a GAS script and paste the URL here.
// For the demo, we will simulate the success message.
export const GAS_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbz_REPLACE_WITH_YOUR_DEPLOYED_ID/exec';

export const STATUS_OPTIONS = ['Hadir', 'Izin', 'Sakit', 'Alpa'];
export const LESSON_HOURS = Array.from({ length: 10 }, (_, i) => `${i + 1}`);

// Help text for users to setup the Google Sheet backend
export const GOOGLE_APPS_SCRIPT_CODE = `
function doPost(e) {
  var sheet = SpreadsheetApp.openById("1HMZM578cM93x6kF3GOZ_1e3byMYH4IOV0Q7xrl3XhuY").getSheetByName("Data Kehadiran");
  var data = JSON.parse(e.postData.contents);
  
  sheet.appendRow([
    data.nisn,
    data.name,
    data.class,
    data.rombel,
    data.lessonHour,
    data.status,
    data.date,
    data.teacherUsername
  ]);
  
  return ContentService.createTextOutput(JSON.stringify({result: "success"})).setMimeType(ContentService.MimeType.JSON);
}
`;
