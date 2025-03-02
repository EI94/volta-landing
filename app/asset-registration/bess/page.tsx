'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Box, Container, Typography, Button, Paper, Grid, TextField, 
  FormControlLabel, Switch, MenuItem, InputAdornment, Stepper,
  Step, StepLabel, StepContent, Alert, Divider
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';

// Componente per l'inserimento delle caratteristiche tecniche del BESS
const TechnicalForm = ({ formData, setFormData }: any) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            label="Nome del sistema di storage"
            name="name"
            value={formData.name || ''}
            onChange={handleChange}
            variant="outlined"
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label="Capacità totale"
            name="energyCapacity"
            value={formData.energyCapacity || ''}
            onChange={handleChange}
            variant="outlined"
            type="number"
            InputProps={{
              endAdornment: <InputAdornment position="end">MWh</InputAdornment>,
            }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label="Potenza massima di carico/scarico"
            name="powerCapacity"
            value={formData.powerCapacity || ''}
            onChange={handleChange}
            variant="outlined"
            type="number"
            InputProps={{
              endAdornment: <InputAdornment position="end">MW</InputAdornment>,
            }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label="Efficienza round-trip"
            name="efficiency"
            value={formData.efficiency || ''}
            onChange={handleChange}
            variant="outlined"
            type="number"
            InputProps={{
              endAdornment: <InputAdornment position="end">%</InputAdornment>,
            }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label="Durata attesa della batteria"
            name="expectedLifetime"
            value={formData.expectedLifetime || ''}
            onChange={handleChange}
            variant="outlined"
            type="number"
            InputProps={{
              endAdornment: <InputAdornment position="end">anni</InputAdornment>,
            }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            select
            label="Strategia di utilizzo"
            name="usageStrategy"
            value={formData.usageStrategy || ''}
            onChange={handleChange}
            variant="outlined"
          >
            <MenuItem value="fastResponse">Fast Response</MenuItem>
            <MenuItem value="arbitraggio">Arbitraggio</MenuItem>
            <MenuItem value="flessibilita">Flessibilità</MenuItem>
            <MenuItem value="altro">Altro</MenuItem>
          </TextField>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            select
            label="Tecnologia della batteria"
            name="batteryTechnology"
            value={formData.batteryTechnology || ''}
            onChange={handleChange}
            variant="outlined"
          >
            <MenuItem value="liIon">Li-Ion</MenuItem>
            <MenuItem value="naIon">Na-Ion</MenuItem>
            <MenuItem value="flowBattery">Flow Battery</MenuItem>
            <MenuItem value="altro">Altro</MenuItem>
          </TextField>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label="Latitudine"
            name="latitude"
            value={formData.latitude || ''}
            onChange={handleChange}
            variant="outlined"
            type="number"
            inputProps={{ step: "0.000001" }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label="Longitudine"
            name="longitude"
            value={formData.longitude || ''}
            onChange={handleChange}
            variant="outlined"
            type="number"
            inputProps={{ step: "0.000001" }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.gridConnected || false}
                onChange={handleChange}
                name="gridConnected"
                color="primary"
              />
            }
            label="Connettività alla rete"
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.hasIncentives || false}
                onChange={handleChange}
                name="hasIncentives"
                color="primary"
              />
            }
            label="Incentivi attivi"
          />
        </Grid>
        
        {formData.hasIncentives && (
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Specificare incentivi attivi"
              name="incentivesDescription"
              value={formData.incentivesDescription || ''}
              onChange={handleChange}
              variant="outlined"
              multiline
              rows={2}
            />
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

// Componente per la selezione del revenue stream
const RevenueStreamForm = ({ formData, setFormData }: any) => {
  const [selectedRevenueStream, setSelectedRevenueStream] = useState<string>(formData.revenueStreamType || '');
  
  const handleRevenueStreamChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSelectedRevenueStream(value);
    setFormData({
      ...formData,
      revenueStreamType: value
    });
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Seleziona il tipo di revenue stream
      </Typography>
      
      <TextField
        select
        fullWidth
        label="Tipo di Revenue Stream"
        name="revenueStreamType"
        value={selectedRevenueStream}
        onChange={handleRevenueStreamChange}
        variant="outlined"
        sx={{ mb: 4 }}
      >
        <MenuItem value="tolling">Tolling</MenuItem>
        <MenuItem value="capacityMarket">Capacity Market</MenuItem>
        <MenuItem value="macse">MACSE (Mercato dei Servizi Energetici)</MenuItem>
        <MenuItem value="ppa">PPA</MenuItem>
        <MenuItem value="merchant">Merchant</MenuItem>
      </TextField>
      
      {/* Campi specifici per Tolling */}
      {selectedRevenueStream === 'tolling' && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              label="Nome operatore"
              name="tollingOperator"
              value={formData.tollingOperator || ''}
              onChange={handleChange}
              variant="outlined"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="Condizioni economiche"
              name="tollingRemunerationType"
              value={formData.tollingRemunerationType || ''}
              onChange={handleChange}
              variant="outlined"
              select
            >
              <MenuItem value="mwh">€/MWh</MenuItem>
              <MenuItem value="mwyear">€/MW/anno</MenuItem>
            </TextField>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="Valore economico"
              name="tollingRemunerationValue"
              value={formData.tollingRemunerationValue || ''}
              onChange={handleChange}
              variant="outlined"
              type="number"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="Durata del contratto"
              name="tollingContractDuration"
              value={formData.tollingContractDuration || ''}
              onChange={handleChange}
              variant="outlined"
              type="number"
              InputProps={{
                endAdornment: <InputAdornment position="end">anni</InputAdornment>,
              }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Penalità per indisponibilità"
              name="tollingPenalties"
              value={formData.tollingPenalties || ''}
              onChange={handleChange}
              variant="outlined"
              multiline
              rows={2}
            />
          </Grid>
        </Grid>
      )}
      
      {/* Campi specifici per Capacity Market */}
      {selectedRevenueStream === 'capacityMarket' && (
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="Volume di capacità assegnato"
              name="cmCapacityVolume"
              value={formData.cmCapacityVolume || ''}
              onChange={handleChange}
              variant="outlined"
              type="number"
              InputProps={{
                endAdornment: <InputAdornment position="end">MW</InputAdornment>,
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="Prezzo ottenuto"
              name="cmCapacityPrice"
              value={formData.cmCapacityPrice || ''}
              onChange={handleChange}
              variant="outlined"
              type="number"
              InputProps={{
                endAdornment: <InputAdornment position="end">€/MW/anno</InputAdornment>,
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="Durata della partecipazione"
              name="cmDuration"
              value={formData.cmDuration || ''}
              onChange={handleChange}
              variant="outlined"
              type="number"
              InputProps={{
                endAdornment: <InputAdornment position="end">anni</InputAdornment>,
              }}
            />
          </Grid>
        </Grid>
      )}
      
      {/* Campi specifici per MACSE */}
      {selectedRevenueStream === 'macse' && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              select
              label="Tipologia di servizio offerto"
              name="macseServiceType"
              value={formData.macseServiceType || ''}
              onChange={handleChange}
              variant="outlined"
            >
              <MenuItem value="fcr">FCR</MenuItem>
              <MenuItem value="afrr">aFRR</MenuItem>
              <MenuItem value="mfrr">mFRR</MenuItem>
            </TextField>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="Prezzo minimo richiesto"
              name="macseMinPrice"
              value={formData.macseMinPrice || ''}
              onChange={handleChange}
              variant="outlined"
              type="number"
              InputProps={{
                endAdornment: <InputAdornment position="end">€/MW</InputAdornment>,
              }}
            />
          </Grid>
        </Grid>
      )}
      
      {/* Campi specifici per PPA */}
      {selectedRevenueStream === 'ppa' && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              label="Nome controparte"
              name="ppaCounterparty"
              value={formData.ppaCounterparty || ''}
              onChange={handleChange}
              variant="outlined"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="Durata contratto"
              name="ppaContractDuration"
              value={formData.ppaContractDuration || ''}
              onChange={handleChange}
              variant="outlined"
              type="number"
              InputProps={{
                endAdornment: <InputAdornment position="end">anni</InputAdornment>,
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="Prezzo"
              name="ppaPrice"
              value={formData.ppaPrice || ''}
              onChange={handleChange}
              variant="outlined"
              type="number"
              InputProps={{
                endAdornment: <InputAdornment position="end">€/MWh</InputAdornment>,
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="Volume garantito"
              name="ppaGuaranteedVolume"
              value={formData.ppaGuaranteedVolume || ''}
              onChange={handleChange}
              variant="outlined"
              type="number"
              InputProps={{
                endAdornment: <InputAdornment position="end">MWh/anno</InputAdornment>,
              }}
            />
          </Grid>
        </Grid>
      )}
      
      {/* Campi specifici per Merchant */}
      {selectedRevenueStream === 'merchant' && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Partecipazione ai mercati GME
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.merchantMGP || false}
                      onChange={handleChange}
                      name="merchantMGP"
                      color="primary"
                    />
                  }
                  label="MGP"
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.merchantMI || false}
                      onChange={handleChange}
                      name="merchantMI"
                      color="primary"
                    />
                  }
                  label="MI"
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.merchantMSD || false}
                      onChange={handleChange}
                      name="merchantMSD"
                      color="primary"
                    />
                  }
                  label="MSD"
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.merchantAltro || false}
                      onChange={handleChange}
                      name="merchantAltro"
                      color="primary"
                    />
                  }
                  label="Altro"
                />
              </Grid>
            </Grid>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              select
              label="Strategia di vendita"
              name="merchantStrategy"
              value={formData.merchantStrategy || ''}
              onChange={handleChange}
              variant="outlined"
            >
              <MenuItem value="spot">Spot</MenuItem>
              <MenuItem value="hedging">Hedging</MenuItem>
              <MenuItem value="arbitraggio">Arbitraggio</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

// Pagina principale per la registrazione di un asset BESS
export default function BESSRegistrationPage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    energyCapacity: '',
    powerCapacity: '',
    efficiency: '',
    expectedLifetime: '',
    usageStrategy: '',
    batteryTechnology: '',
    latitude: '',
    longitude: '',
    gridConnected: false,
    hasIncentives: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const steps = [
    {
      label: 'Caratteristiche Tecniche',
      description: 'Inserisci le caratteristiche tecniche del sistema BESS',
      component: <TechnicalForm formData={formData} setFormData={setFormData} />
    },
    {
      label: 'Revenue Stream',
      description: 'Scegli e configura il revenue stream',
      component: <RevenueStreamForm formData={formData} setFormData={setFormData} />
    }
  ];

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Preparazione dei dati per la API
      const assetData = {
        name: formData.name,
        type: 'BESS',
        location: {
          coordinates: {
            lat: parseFloat(formData.latitude as string),
            lng: parseFloat(formData.longitude as string)
          },
          country: 'IT',
          // Qui potremmo aggiungere anche city e zone in base alla posizione
        },
        capacity: {
          power: parseFloat(formData.powerCapacity as string),
          energy: parseFloat(formData.energyCapacity as string)
        },
        efficiency: parseFloat(formData.efficiency as string),
        details: {
          expectedLifetime: parseFloat(formData.expectedLifetime as string),
          usageStrategy: formData.usageStrategy,
          batteryTechnology: formData.batteryTechnology,
          gridConnected: formData.gridConnected,
          hasIncentives: formData.hasIncentives,
          incentivesDescription: formData.incentivesDescription || null
        },
        revenueStream: {
          type: formData.revenueStreamType,
          // Aggiungi qui i dettagli specifici del revenue stream selezionato
        }
      };
      
      // Logica specifica per ogni tipo di revenue stream
      if (formData.revenueStreamType === 'tolling') {
        assetData.revenueStream = {
          ...assetData.revenueStream,
          operator: formData.tollingOperator,
          remunerationType: formData.tollingRemunerationType,
          remunerationValue: parseFloat(formData.tollingRemunerationValue as string),
          contractDuration: parseInt(formData.tollingContractDuration as string),
          penalties: formData.tollingPenalties || null
        };
      } else if (formData.revenueStreamType === 'capacityMarket') {
        assetData.revenueStream = {
          ...assetData.revenueStream,
          capacityVolume: parseFloat(formData.cmCapacityVolume as string),
          capacityPrice: parseFloat(formData.cmCapacityPrice as string),
          duration: parseInt(formData.cmDuration as string)
        };
      }
      
      // Chiamata alla API per salvare l'asset
      const response = await fetch('/api/assets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assetData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Errore durante la registrazione dell\'asset');
      }
      
      setSuccess(true);
      // Dopo 2 secondi, reindirizza alla dashboard
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
      
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          borderRadius: 2 
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={() => router.push('/asset-registration')}
            sx={{ mr: 2 }}
          >
            Indietro
          </Button>
          
          <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
            Registrazione BESS Utility Scale
          </Typography>
        </Box>
        
        <Divider sx={{ mb: 4 }} />
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {success ? (
          <Alert severity="success" sx={{ mb: 3 }}>
            Asset registrato con successo! Sarai reindirizzato alla dashboard.
          </Alert>
        ) : (
          <>
            <Stepper activeStep={activeStep} orientation="vertical">
              {steps.map((step, index) => (
                <Step key={step.label}>
                  <StepLabel>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      {step.label}
                    </Typography>
                  </StepLabel>
                  <StepContent>
                    <Typography color="text.secondary" paragraph>
                      {step.description}
                    </Typography>
                    {step.component}
                    <Box sx={{ mb: 2, mt: 3 }}>
                      <div>
                        <Button
                          variant="contained"
                          onClick={index === steps.length - 1 ? handleSubmit : handleNext}
                          sx={{ mt: 1, mr: 1 }}
                          disabled={isSubmitting}
                          startIcon={index === steps.length - 1 ? <SaveIcon /> : undefined}
                        >
                          {index === steps.length - 1 ? 'Registra Asset' : 'Continua'}
                        </Button>
                        <Button
                          disabled={index === 0 || isSubmitting}
                          onClick={handleBack}
                          sx={{ mt: 1, mr: 1 }}
                        >
                          Indietro
                        </Button>
                      </div>
                    </Box>
                  </StepContent>
                </Step>
              ))}
            </Stepper>
            
            {activeStep === steps.length && (
              <Paper square elevation={0} sx={{ p: 3 }}>
                <Typography>Tutti i passaggi completati - Puoi ora registrare l'asset</Typography>
                <Button 
                  onClick={handleSubmit} 
                  sx={{ mt: 1, mr: 1 }} 
                  variant="contained"
                  disabled={isSubmitting}
                  startIcon={<SaveIcon />}
                >
                  Registra Asset
                </Button>
              </Paper>
            )}
          </>
        )}
      </Paper>
    </Container>
  );
} 