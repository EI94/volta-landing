import React from 'react';

/**
 * Interfaccia che definisce la struttura dei dati esportabili.
 * Ogni chiave può contenere una stringa, un numero o una data.
 */
interface ExportableData {
  [key: string]: string | number | Date;
}

/**
 * Props del componente DataExport
 * @property {ExportableData[]} data - Array di dati da esportare
 * @property {string} filename - Nome del file da generare (senza estensione)
 * @property {function} onError - Callback opzionale per la gestione degli errori
 */
interface DataExportProps {
  data: ExportableData[];
  filename: string;
  onError?: (error: Error) => void;
}

/**
 * Componente per l'esportazione di dati in formato CSV ed Excel (TSV).
 * Fornisce pulsanti per esportare i dati in entrambi i formati e gestisce
 * automaticamente la formattazione dei dati, inclusi date e numeri.
 *
 * @component
 * @example
 * ```tsx
 * <DataExport
 *   data={[{ name: "Test", value: 42, date: new Date() }]}
 *   filename="export"
 *   onError={(error) => console.error(error)}
 * />
 * ```
 */
const DataExport: React.FC<DataExportProps> = ({ data, filename, onError }) => {
  /**
   * Gestisce gli errori in modo uniforme, registrandoli in console e
   * notificando l'utente attraverso un alert o una callback personalizzata.
   * @param {Error} error - L'errore da gestire
   * @param {string} context - Il contesto in cui si è verificato l'errore
   */
  const handleError = (error: Error, context: string) => {
    console.error(`Errore durante ${context}:`, error);
    if (onError) {
      onError(error);
    } else {
      alert(`Si è verificato un errore durante ${context}. Riprova più tardi.`);
    }
  };

  /**
   * Valida i dati prima dell'esportazione.
   * @param {ExportableData[]} data - I dati da validare
   * @returns {boolean} true se i dati sono validi, false altrimenti
   */
  const validateData = (data: ExportableData[]): boolean => {
    if (!Array.isArray(data) || data.length === 0) {
      handleError(new Error('Dati non validi o vuoti'), 'la validazione dei dati');
      return false;
    }
    return true;
  };

  /**
   * Formatta i dati per l'esportazione, convertendo date e numeri in stringhe.
   * @param {ExportableData[]} data - I dati da formattare
   * @returns {Record<string, string | number>[]} I dati formattati
   */
  const formatDataForExport = (data: ExportableData[]) => {
    try {
      return data.map(item => {
        const formattedItem: Record<string, string | number> = {};
        Object.entries(item).forEach(([key, value]) => {
          if (value instanceof Date) {
            formattedItem[key] = value.toLocaleString('it-IT');
          } else if (typeof value === 'number') {
            formattedItem[key] = value.toFixed(2);
          } else {
            formattedItem[key] = value as string;
          }
        });
        return formattedItem;
      });
    } catch (error) {
      handleError(error as Error, 'la formattazione dei dati');
      return [];
    }
  };

  /**
   * Rinomina le colonne per una migliore leggibilità.
   * @param {string} key - La chiave originale della colonna
   * @returns {string} Il nome formattato della colonna
   */
  const renameColumns = (key: string): string => {
    return key
      .replace('_siteA', ' (Sito A)')
      .replace('_siteB', ' (Sito B)')
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase());
  };

  /**
   * Gestisce il download del file generato.
   * @param {Blob} blob - Il blob contenente i dati del file
   * @param {string} extension - L'estensione del file
   */
  const downloadFile = (blob: Blob, extension: string) => {
    try {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.${extension}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      handleError(error as Error, 'il download del file');
    }
  };

  /**
   * Esporta i dati in formato CSV.
   * Gestisce la formattazione dei dati e il download del file.
   */
  const exportToCSV = () => {
    try {
      if (!validateData(data)) return;

      const formattedData = formatDataForExport(data);
      if (formattedData.length === 0) return;

      const headers = Object.keys(formattedData[0]).map(renameColumns);
      
      const csvRows = [
        headers.join(','),
        ...formattedData.map(row => 
          Object.values(row).map(value => 
            typeof value === 'string' ? `"${value}"` : value
          ).join(',')
        )
      ];

      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      downloadFile(blob, 'csv');
    } catch (error) {
      handleError(error as Error, "l'esportazione CSV");
    }
  };

  /**
   * Esporta i dati in formato Excel (TSV).
   * Gestisce la formattazione dei dati e il download del file.
   */
  const exportToExcel = () => {
    try {
      if (!validateData(data)) return;

      const formattedData = formatDataForExport(data);
      if (formattedData.length === 0) return;

      const headers = Object.keys(formattedData[0]).map(renameColumns);
      
      const tsvRows = [
        headers.join('\t'),
        ...formattedData.map(row => 
          Object.values(row).map(value => 
            typeof value === 'string' ? `"${value}"` : value
          ).join('\t')
        )
      ];

      const tsvContent = tsvRows.join('\n');
      const blob = new Blob([tsvContent], { type: 'text/tab-separated-values;charset=utf-8;' });
      downloadFile(blob, 'xls');
    } catch (error) {
      handleError(error as Error, "l'esportazione Excel");
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm font-medium text-gray-700">Esporta:</span>
      <button
        onClick={exportToCSV}
        className="px-3 py-1 text-sm rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
      >
        CSV
      </button>
      <button
        onClick={exportToExcel}
        className="px-3 py-1 text-sm rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
      >
        Excel
      </button>
    </div>
  );
};

export default DataExport; 