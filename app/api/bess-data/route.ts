import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

interface BESSRecord {
  Timestamp: string;
  Market_Price_EUR_MWh: string;
  BESS_Power_kW: string;
  BESS_SoC_MWh: string;
  'BESS_SoC_%': string;
  BESS_Temperature_C: string;
  Operating_Mode: string;
  Fault_Flag: string;
  Fault_Code: string;
  Cycle_Count: string;
  AC_Voltage_V: string;
  AC_Frequency_Hz: string;
  [key: string]: string;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const fileName = searchParams.get('file') || 'bess_60MW_4h_viterbo_may2025.csv';
    const format = searchParams.get('format') || 'json';
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    // Sicurezza: verifica che il file richiesto sia consentito
    const fileNamePattern = /^[a-zA-Z0-9_-]+\.csv$/;
    if (!fileNamePattern.test(fileName)) {
      return NextResponse.json(
        { error: 'Nome file non valido' },
        { status: 400 }
      );
    }

    // Costruisci il percorso completo
    const filePath = path.join(process.cwd(), 'public', 'data', fileName);

    // Verifica che il file esista
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'File non trovato' },
        { status: 404 }
      );
    }

    // Leggi il contenuto del file
    const fileContent = fs.readFileSync(filePath, 'utf-8');

    if (format === 'csv') {
      // Restituisci direttamente il CSV
      return new NextResponse(fileContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${fileName}"`,
        },
      });
    } else {
      // Analizza il CSV in JSON
      const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
      }) as BESSRecord[];

      // Filtra per data se necessario
      let filteredRecords = records;
      if (startDateParam || endDateParam) {
        filteredRecords = records.filter((record: BESSRecord) => {
          const recordDate = new Date(record.Timestamp);
          const startDate = startDateParam ? new Date(startDateParam) : new Date(0);
          const endDate = endDateParam ? new Date(endDateParam) : new Date(8640000000000000);
          return recordDate >= startDate && recordDate <= endDate;
        });
      }

      // Limita il numero di record se necessario
      const limitedRecords = limit ? filteredRecords.slice(0, limit) : filteredRecords;

      return NextResponse.json(limitedRecords);
    }
  } catch (error) {
    console.error('Errore nella gestione della richiesta:', error);
    return NextResponse.json(
      { error: 'Errore del server' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
export const revalidate = 0; 