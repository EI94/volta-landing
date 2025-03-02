'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Box, Container, Typography, Button, Paper, Grid, Card, CardContent, CardMedia, CardActionArea } from '@mui/material';
import { BatteryChargingFull, WbSunny } from '@mui/icons-material';

// Pagina principale per la registrazione di nuovi asset
export default function AssetRegistrationPage() {
  const [selectedAssetType, setSelectedAssetType] = useState<string | null>(null);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          borderRadius: 2,
          background: 'linear-gradient(145deg, #f0f7ff 0%, #e6f0fd 100%)',
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ fontWeight: 'bold', color: '#1a3e72' }}>
          AI Energy Copilot - Registrazione Nuovo Asset Rinnovabile
        </Typography>
        
        <Typography variant="subtitle1" paragraph align="center" sx={{ mb: 4, color: '#555' }}>
          Seleziona il tipo di asset che desideri registrare nella piattaforma
        </Typography>

        {!selectedAssetType ? (
          <Grid container spacing={4} sx={{ mt: 2 }}>
            <Grid item xs={12} md={6}>
              <Card 
                elevation={4}
                sx={{ 
                  height: '100%',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 20px rgba(0, 0, 0, 0.1)',
                  }
                }}
              >
                <CardActionArea 
                  onClick={() => setSelectedAssetType('pv')}
                  sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                >
                  <CardMedia
                    component="div"
                    sx={{
                      height: 220,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: '#fffaf0'
                    }}
                  >
                    <WbSunny sx={{ fontSize: 100, color: '#ff9800' }} />
                  </CardMedia>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h5" component="h2" align="center">
                      PV Utility Scale
                    </Typography>
                    <Typography variant="body1" color="text.secondary" paragraph align="center">
                      Registra un impianto fotovoltaico a livello utility scale e gestisci la sua produzione e revenue stream.
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card 
                elevation={4}
                sx={{ 
                  height: '100%',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 20px rgba(0, 0, 0, 0.1)',
                  }
                }}
              >
                <CardActionArea 
                  onClick={() => setSelectedAssetType('bess')}
                  sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                >
                  <CardMedia
                    component="div"
                    sx={{
                      height: 220,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: '#f0f7ff'
                    }}
                  >
                    <BatteryChargingFull sx={{ fontSize: 100, color: '#2196f3' }} />
                  </CardMedia>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h5" component="h2" align="center">
                      BESS Utility Scale
                    </Typography>
                    <Typography variant="body1" color="text.secondary" paragraph align="center">
                      Registra un sistema di accumulo a batteria e configura le strategie ottimali di utilizzo per massimizzare i ricavi.
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          </Grid>
        ) : (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom align="center">
              Hai selezionato: {selectedAssetType === 'pv' ? 'PV Utility Scale' : 'BESS Utility Scale'}
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Button 
                variant="contained" 
                color="primary" 
                size="large"
                component={Link}
                href={`/asset-registration/${selectedAssetType}`}
                sx={{ 
                  mr: 2,
                  px: 4, 
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 'bold',
                  backgroundColor: '#1976d2',
                  '&:hover': {
                    backgroundColor: '#1565c0',
                  }
                }}
              >
                Continua
              </Button>
              
              <Button 
                variant="outlined" 
                size="large" 
                onClick={() => setSelectedAssetType(null)}
                sx={{ 
                  px: 4, 
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 'bold'
                }}
              >
                Torna Indietro
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
    </Container>
  );
} 