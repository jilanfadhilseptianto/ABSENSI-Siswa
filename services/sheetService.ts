
import { SPREADSHEET_ID, GAS_WEBAPP_URL } from '../constants';
import { Teacher, Student, AttendanceRecord } from '../types';

/**
 * Fetches data from a Google Sheet using the public visualization API (JSON format)
 */
export const fetchSheetData = async (sheetName: string): Promise<any[]> => {
  const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;
  
  try {
    const response = await fetch(url);
    const text = await response.text();
    // The visualization API returns a JSON string wrapped in a callback function call
    const jsonData = JSON.parse(text.substring(47, text.length - 2));
    
    const rows = jsonData.table.rows;
    const cols = jsonData.table.cols;
    
    return rows.map((row: any) => {
      const obj: any = {};
      row.c.forEach((cell: any, i: number) => {
        const key = cols[i].label.toLowerCase().replace(/ /g, '_') || `col_${i}`;
        obj[key] = cell ? cell.v : null;
      });
      return obj;
    });
  } catch (error) {
    console.error(`Error fetching sheet ${sheetName}:`, error);
    return [];
  }
};

/**
 * Submits attendance data to the Google Apps Script endpoint
 */
export const submitAttendance = async (data: AttendanceRecord): Promise<boolean> => {
  // If the GAS_WEBAPP_URL is still the placeholder, we simulate success for demo purposes
  if (GAS_WEBAPP_URL.includes('REPLACE_WITH_YOUR_DEPLOYED_ID')) {
    console.warn("GAS URL not set. Simulating success...");
    return new Promise(resolve => setTimeout(() => resolve(true), 1500));
  }

  try {
    const response = await fetch(GAS_WEBAPP_URL, {
      method: 'POST',
      mode: 'no-cors', // Common for GAS web apps
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    // With no-cors, we can't read the response body, but usually if it doesn't throw, it's ok
    return true;
  } catch (error) {
    console.error("Error submitting attendance:", error);
    return false;
  }
};
