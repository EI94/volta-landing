import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    // Ottieni il path del file dal query parameter 'file', default a 'inverter_data_12MW_north_milan_july2023.csv'
    const searchParams = request.nextUrl.searchParams;
    const fileName = searchParams.get('file') || 'inverter_data_12MW_north_milan_july2023.csv';
    
    // Valida il nome del file per sicurezza
    if (!fileName.match(/^[a-zA-Z0-9_-]+\.csv$/)) {
      return NextResponse.json(
        { error: 'Nome file non valido' },
        { status: 400 }
      );
    }

    // Costruisce il percorso completo del file - corretto da 'data' a 'public/data'
    const filePath = path.join(process.cwd(), 'public', 'data', fileName);
    
    // Verifica se il file esiste
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'File non trovato' },
        { status: 404 }
      );
    }

    // Legge il contenuto del file
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    
    // Ritorna il contenuto come JSON o come CSV in base al parametro 'format'
    const format = searchParams.get('format');
    
    if (format === 'json') {
      const rows = fileContent.split('\n');
      const headers = rows[0].split(',');
      
      // Parsing dei dati CSV (opzionalmente limita il numero di righe per prestazioni)
      const maxRows = parseInt(searchParams.get('limit') || '1000', 10);
      const parsedData = rows.slice(1, maxRows + 1).map(row => {
        const values = row.split(',');
        const rowData: Record<string, string | number> = {};
        
        headers.forEach((header, index) => {
          if (values[index] !== undefined) {
            if (header === 'Timestamp') {
              rowData[header] = values[index];
            } else {
              rowData[header] = parseFloat(values[index]);
            }
          }
        });
        
        return rowData;
      });
      
      return NextResponse.json(parsedData);
    } else {
      // Ritorna il CSV grezzo
      return new NextResponse(fileContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename=${fileName}`
        }
      });
    }
  } catch (error) {
    console.error('Errore nella lettura del file CSV:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
} 