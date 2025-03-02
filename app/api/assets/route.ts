import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import type { NextRequest } from 'next/server';
import { AssetConfig, AssetConfigSchema, createAssetConfig } from '@/lib/models/assetConfig';

const ASSETS_PATH = path.join(process.cwd(), 'data', 'assets.json');

// Assicurati che la directory esista
if (!fs.existsSync(path.dirname(ASSETS_PATH))) {
  fs.mkdirSync(path.dirname(ASSETS_PATH), { recursive: true });
}

// Assicurati che il file esista con almeno un asset di default
if (!fs.existsSync(ASSETS_PATH)) {
  const defaultAsset = createAssetConfig({
    name: 'BESS Demo',
    location: {
      city: 'Milano',
      country: 'IT',
      zone: 'NORD',
      coordinates: {
        lat: 45.4642,
        lng: 9.1900
      }
    },
    capacity: {
      power: 20, // MW
      energy: 80 // MWh
    },
    efficiency: 92,
    revenueStream: {
      type: 'MERCHANT',
      preferredMarkets: ['MGP', 'MI'],
      minimumPrice: 75,
      maximumPrice: 35
    }
  });

  fs.writeFileSync(ASSETS_PATH, JSON.stringify([defaultAsset], null, 2));
}

// GET: Recupera tutti gli asset o un asset specifico per ID
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    const assets: AssetConfig[] = JSON.parse(fs.readFileSync(ASSETS_PATH, 'utf-8'));
    
    if (id) {
      const asset = assets.find(a => a.id === id);
      if (!asset) {
        return NextResponse.json(
          { error: 'Asset non trovato' },
          { status: 404 }
        );
      }
      return NextResponse.json(asset);
    }
    
    return NextResponse.json(assets);
  } catch (error) {
    console.error('Errore nel recupero degli asset:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero degli asset' },
      { status: 500 }
    );
  }
}

// POST: Crea un nuovo asset
export async function POST(request: NextRequest) {
  try {
    const assets: AssetConfig[] = JSON.parse(fs.readFileSync(ASSETS_PATH, 'utf-8'));
    const data = await request.json();
    
    // Verifica che i dati siano validi
    const parsedData = AssetConfigSchema.parse(data);
    
    // Verifica che l'ID non esista già
    if (assets.some(a => a.id === parsedData.id)) {
      return NextResponse.json(
        { error: 'Asset con questo ID già esistente' },
        { status: 400 }
      );
    }
    
    // Aggiungi il nuovo asset
    assets.push(parsedData);
    
    // Salva il file aggiornato
    fs.writeFileSync(ASSETS_PATH, JSON.stringify(assets, null, 2));
    
    return NextResponse.json(parsedData, { status: 201 });
  } catch (error) {
    console.error('Errore nella creazione dell\'asset:', error);
    return NextResponse.json(
      { 
        error: 'Errore nella creazione dell\'asset',
        details: error instanceof Error ? error.message : 'Errore sconosciuto'
      },
      { status: 400 }
    );
  }
}

// PUT: Aggiorna un asset esistente
export async function PUT(request: NextRequest) {
  try {
    const assets: AssetConfig[] = JSON.parse(fs.readFileSync(ASSETS_PATH, 'utf-8'));
    const data = await request.json();
    
    // Verifica che i dati siano validi
    const parsedData = AssetConfigSchema.parse(data);
    
    // Trova l'indice dell'asset da aggiornare
    const index = assets.findIndex(a => a.id === parsedData.id);
    
    if (index === -1) {
      return NextResponse.json(
        { error: 'Asset non trovato' },
        { status: 404 }
      );
    }
    
    // Aggiorna l'asset
    assets[index] = parsedData;
    
    // Salva il file aggiornato
    fs.writeFileSync(ASSETS_PATH, JSON.stringify(assets, null, 2));
    
    return NextResponse.json(parsedData);
  } catch (error) {
    console.error('Errore nell\'aggiornamento dell\'asset:', error);
    return NextResponse.json(
      { 
        error: 'Errore nell\'aggiornamento dell\'asset',
        details: error instanceof Error ? error.message : 'Errore sconosciuto'
      },
      { status: 400 }
    );
  }
}

// DELETE: Elimina un asset
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID asset non specificato' },
        { status: 400 }
      );
    }
    
    const assets: AssetConfig[] = JSON.parse(fs.readFileSync(ASSETS_PATH, 'utf-8'));
    
    // Verifica che l'asset esista
    const index = assets.findIndex(a => a.id === id);
    
    if (index === -1) {
      return NextResponse.json(
        { error: 'Asset non trovato' },
        { status: 404 }
      );
    }
    
    // Rimuovi l'asset
    assets.splice(index, 1);
    
    // Salva il file aggiornato
    fs.writeFileSync(ASSETS_PATH, JSON.stringify(assets, null, 2));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Errore nell\'eliminazione dell\'asset:', error);
    return NextResponse.json(
      { error: 'Errore nell\'eliminazione dell\'asset' },
      { status: 500 }
    );
  }
} 