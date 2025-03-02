'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Box, Container, Typography, Button, Paper, Grid, TextField, 
  FormControlLabel, Switch, MenuItem, InputAdornment, Stepper,
  Step, StepLabel, StepContent, Alert, Divider
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SaveIcon from '@mui/icons-material/Save';

// Componente per l'inserimento delle caratteristiche tecniche dell'impianto PV
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
            label="Nome dell'impianto"
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
            label="Potenza installata"
            name="power"
            value={formData.power || ''}
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
            label="Efficienza prevista"
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
          <FormControlLabel
            control={
              <Switch
                checked={formData.hasTracking || false}
                onChange={handleChange}
                name="hasTracking"
                color="primary"
              />
            }
            label="Tracking system"
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label="Degrado annuo previsto"
            name="annualDegradation"
            value={formData.annualDegradation || ''}
            onChange={handleChange}
            variant="outlined"
            type="number"
            InputProps={{
              endAdornment: <InputAdornment position="end">%</InputAdornment>,
            }}
          />
        </Grid>
        
        <Grid item xs={12}>
          <Button
            variant="outlined"
            component="label"
            startIcon={<CloudUploadIcon />}
            fullWidth
            sx={{ py: 1.5 }}
          >
            Carica curva di produzione (CSV)
            <input
              type="file"
              hidden
              accept=".csv"
              onChange={(e) => {
                // Gestione del file
                const file = e.target.files?.[0];
                if (file) {
                  setFormData({
                    ...formData,
                    productionCurveFile: file.name
                  });
                }
              }}
            />
          </Button>
          {formData.productionCurveFile && (
            <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
              File selezionato: {formData.productionCurveFile}
            </Typography>
          )}
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
        <MenuItem value="ppa">PPA (Power Purchase Agreement)</MenuItem>
        <MenuItem value="tolling">Tolling</MenuItem>
        <MenuItem value="merchant">Merchant (GME)</MenuItem>
        <MenuItem value="ritiroDesicato">Ritiro Dedicato</MenuItem>
        <MenuItem value="scambioSulPosto">Scambio sul Posto</MenuItem>
        <MenuItem value="altro">Altro</MenuItem>
      </TextField>
      
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
            <FormControlLabel
              control={
                <Switch
                  checked={formData.ppaIndexed || false}
                  onChange={handleChange}
                  name="ppaIndexed"
                  color="primary"
                />
              }
              label="Indicizzazione"
            />
          </Grid>
          
          {formData.ppaIndexed && (
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tipo di indicizzazione"
                name="ppaIndexType"
                value={formData.ppaIndexType || ''}
                onChange={handleChange}
                variant="outlined"
                select
              >
                <MenuItem value="brent">Brent</MenuItem>
                <MenuItem value="inflation">Inflazione</MenuItem>
                <MenuItem value="other">Altro</MenuItem>
              </TextField>
            </Grid>
          )}
          
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
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Clausole di flessibilità"
              name="ppaFlexibilityClauses"
              value={formData.ppaFlexibilityClauses || ''}
              onChange={handleChange}
              variant="outlined"
              multiline
              rows={3}
              placeholder="Eventuali penali, take-or-pay, ecc."
            />
          </Grid>
        </Grid>
      )}
      
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
              label="Condizioni di remunerazione"
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
              label="Valore remunerazione"
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
              label="Strategia di vendita"
              name="merchantStrategy"
              value={formData.merchantStrategy || ''}
              onChange={handleChange}
              variant="outlined"
              select
            >
              <MenuItem value="spot">Spot</MenuItem>
              <MenuItem value="hedging">Hedging</MenuItem>
              <MenuItem value="ppaComplementari">PPA Complementari</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      )}
      
      {/* Campi specifici per Ritiro Dedicato */}
      {selectedRevenueStream === 'ritiroDesicato' && (
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="Tariffa applicata"
              name="ritiroTariffa"
              value={formData.ritiroTariffa || ''}
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
              label="Data di inizio adesione"
              name="ritiroStartDate"
              value={formData.ritiroStartDate || ''}
              onChange={handleChange}
              variant="outlined"
              type="date"
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
        </Grid>
      )}
      
      {/* Campi specifici per Scambio sul Posto */}
      {selectedRevenueStream === 'scambioSulPosto' && (
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="Tipologia di scambio"
              name="scambioTipo"
              value={formData.scambioTipo || ''}
              onChange={handleChange}
              variant="outlined"
              select
            >
              <MenuItem value="parziale">Parziale</MenuItem>
              <MenuItem value="totale">Totale</MenuItem>
            </TextField>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="Valore medio dello scambio"
              name="scambioValoreMedio"
              value={formData.scambioValoreMedio || ''}
              onChange={handleChange}
              variant="outlined"
              type="number"
              InputProps={{
                endAdornment: <InputAdornment position="end">MWh</InputAdornment>,
              }}
              helperText="Ultimi 12 mesi"
            />
          </Grid>
        </Grid>
      )}
      
      {/* Campi specifici per Altro */}
      {selectedRevenueStream === 'altro' && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              label="Descrizione"
              name="altroDescrizione"
              value={formData.altroDescrizione || ''}
              onChange={handleChange}
              variant="outlined"
              multiline
              rows={3}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              label="Modalità di calcolo del revenue"
              name="altroModalitaCalcolo"
              value={formData.altroModalitaCalcolo || ''}
              onChange={handleChange}
              variant="outlined"
              multiline
              rows={3}
            />
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

// Pagina principale per la registrazione di un asset PV
export default function PVRegistrationPage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    power: '',
    efficiency: '',
    hasTracking: false,
    annualDegradation: '',
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
      description: 'Inserisci le caratteristiche tecniche dell\'impianto PV',
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
        type: 'PV',
        location: {
          coordinates: {
            lat: parseFloat(formData.latitude as string),
            lng: parseFloat(formData.longitude as string)
          },
          country: 'IT',
          // Qui potremmo aggiungere anche city e zone in base alla posizione
        },
        capacity: {
          power: parseFloat(formData.power as string),
        },
        efficiency: parseFloat(formData.efficiency as string),
        details: {
          hasTracking: formData.hasTracking,
          annualDegradation: parseFloat(formData.annualDegradation as string),
          gridConnected: formData.gridConnected,
          hasIncentives: formData.hasIncentives,
          incentivesDescription: formData.incentivesDescription || null
        },
        revenueStream: {
          type: formData.revenueStreamType,
          // Aggiungi qui i dettagli specifici del revenue stream selezionato
          // in base al tipo di revenueStreamType
        }
      };
      
      // Logica specifica per ogni tipo di revenue stream
      if (formData.revenueStreamType === 'ppa') {
        assetData.revenueStream = {
          ...assetData.revenueStream,
          counterparty: formData.ppaCounterparty,
          contractDuration: parseInt(formData.ppaContractDuration as string),
          contractPrice: parseFloat(formData.ppaPrice as string),
          indexed: formData.ppaIndexed,
          indexType: formData.ppaIndexType || null,
          guaranteedVolume: parseFloat(formData.ppaGuaranteedVolume as string),
          flexibilityClauses: formData.ppaFlexibilityClauses || null
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
            Registrazione PV Utility Scale
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