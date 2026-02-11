
import { GoogleGenAI } from "@google/genai";
import { AttendanceRecord } from "../types";

// Always use named parameter and direct process.env.API_KEY as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAttendanceSummary = async (records: AttendanceRecord[]) => {
  // Assume API_KEY is pre-configured and valid. Check only for input data.
  if (records.length === 0) return null;

  const prompt = `
    Berikut adalah data absensi hari ini:
    ${records.map(r => `- ${r.name} (${r.class}): ${r.status}`).join('\n')}
    
    Tolong berikan ringkasan singkat dalam Bahasa Indonesia yang ramah tentang tingkat kehadiran kelas ini dan saran tindak lanjut jika ada siswa yang tidak hadir (Alpa/Sakit).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "Anda adalah asisten administrasi sekolah yang cerdas dan suportif.",
      }
    });
    // Directly access the .text property on the GenerateContentResponse object
    return response.text;
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return null;
  }
};
