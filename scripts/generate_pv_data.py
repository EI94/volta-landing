import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import math
import os

def generate_pv_data_csv(
    start_date="2023-07-01 00:00:00",
    end_date="2023-08-01 00:00:00",   # Fino al 1 agosto escluso, quindi tutto luglio
    freq="15T",                      # Step di 15 minuti
    output_file="data/inverter_data_12MW_north_milan_july2023.csv"
):
    """
    Genera un dataset simulato di un impianto FV da 12 MW a Nord di Milano
    e salva i dati in CSV.
    """

    # 1. Crea un indice temporale con la risoluzione desiderata
    time_index = pd.date_range(start=start_date, end=end_date, freq=freq)
    print(f"Generazione dataset con {len(time_index)} intervalli temporali (step {freq}).")

    # Parametri generali
    # -----------------------------------------------------------------------------
    # Impianto da 12 MWp, ipotesi: 12 MW DC, con efficienza 85% per l'uscita AC
    # Tensione AC nominale (es. 20 kV) e step su 15 minuti
    # Inseriamo un fattore di guasto casuale (1%).
    # -----------------------------------------------------------------------------
    DC_peak_kW = 12000.0     # 12 MW = 12.000 kW
    inverter_efficiency = 0.85
    nominal_AC_voltage_kV = 20.0
    fault_probability = 0.01  # 1% di guasti random
    # Frequenza europea ~ 50 Hz con piccole fluttuazioni
    nominal_frequency = 50.0

    # 2. Generazione della radiazione solare sintetica
    # -----------------------------------------------------------------------------
    # Usando una forma sinusoidale con picco circa a mezzogiorno + rumore casuale
    # e un clamp a 0 (di notte non c'è produzione).
    # -----------------------------------------------------------------------------
    minutes_total = np.arange(len(time_index)) * (15)  # 15 min
    hours_of_day = (minutes_total / 60.0) % 24         # ore del giorno (0..24 ricicla)

    I_max = 1000.0  # W/m^2
    # base sinus per il giorno
    irradiance_base = I_max * np.sin(math.pi * (hours_of_day - 6) / 12.0)
    irradiance_base[irradiance_base < 0] = 0

    # Rumore per simulare nuvole e variazioni casuali
    cloud_noise = np.random.normal(0, 100, size=len(irradiance_base))
    irradiance = irradiance_base + cloud_noise
    irradiance[irradiance < 0] = 0  # clamp di nuovo

    # 3. Generazione temperatura pannelli
    # -----------------------------------------------------------------------------
    # Temperatura di base che varia tra ~18°C di notte e ~30-35°C di giorno
    # + un delta dovuto all'irraggiamento (pannelli scaldano di più con alta radiazione).
    # -----------------------------------------------------------------------------
    temp_night = 18.0
    temp_day = 30.0

    # Ondulazione giorno/notte
    daily_temp_wave = (temp_day - temp_night) * np.sin(math.pi * (hours_of_day - 5) / 12.0)
    daily_temp_wave[daily_temp_wave < 0] = 0
    base_temp = temp_night + daily_temp_wave

    # Sovratemperatura dovuta all'irraggiamento (0..25 °C extra)
    temp_pv = base_temp + (irradiance / I_max) * 25.0
    # Rumore termico
    temp_pv += np.random.normal(0, 1, size=len(temp_pv))

    # 4. Calcolo potenza DC e AC
    # -----------------------------------------------------------------------------
    # Potenza DC = (DC_peak_kW) * (irradiance / 1000)
    # clamp a DC_peak_kW se supera (overshoot di rumore).
    # Poi potenza AC = potenza DC * efficienza inverter (85%)
    # -----------------------------------------------------------------------------
    P_dc = DC_peak_kW * (irradiance / I_max)
    P_dc[P_dc > DC_peak_kW] = DC_peak_kW  # clamp a 12 MW DC

    P_ac = P_dc * inverter_efficiency  # kW

    # 5. Calcolo Tensione AC e Corrente AC
    # -----------------------------------------------------------------------------
    # ipotesi: l'inverter esce in media tensione (20 kV).
    # I_ac = P_ac / (sqrt(3) * V_ll) * 1000
    # Aggiungiamo rumore sulla tensione: +/- qualche centinaio di V
    # -----------------------------------------------------------------------------
    V_ac_nominal_V = nominal_AC_voltage_kV * 1000.0  # 20 kV -> 20000 V

    tension_noise = np.random.normal(0, 200, size=len(P_ac))
    V_ac_array = V_ac_nominal_V + tension_noise  # in Volt

    I_ac = (P_ac / (np.sqrt(3) * nominal_AC_voltage_kV)) * 1000.0  # in A

    # 6. Frequenza e Fault
    # -----------------------------------------------------------------------------
    # Frequenza ~ 50 Hz con +/- 0.02 di rumore
    # Fault con probabilità 1%. Se c'è un fault, P_ac=0, I_ac=0
    # -----------------------------------------------------------------------------
    freq = nominal_frequency + np.random.normal(0, 0.02, size=len(time_index))

    # Generazione di un array di boolean (true=guasto)
    random_vals = np.random.rand(len(time_index))  # 0..1
    fault_flag = (random_vals < fault_probability).astype(int)  # 1 se guasto, 0 se ok

    # Se fault_flag=1, potenza = 0, corrente = 0
    P_ac_faulted = P_ac.copy()
    I_ac_faulted = I_ac.copy()

    P_ac_faulted[fault_flag == 1] = 0.0
    I_ac_faulted[fault_flag == 1] = 0.0

    # 7. Creazione DataFrame
    # -----------------------------------------------------------------------------
    df = pd.DataFrame({
        "Irradiance_Wm2": np.round(irradiance, 2),
        "ModuleTemp_C": np.round(temp_pv, 2),
        "PowerAC_kW": np.round(P_ac_faulted, 2),
        "VoltageAC_V": np.round(V_ac_array, 2),
        "CurrentAC_A": np.round(I_ac_faulted, 2),
        "Frequency_Hz": np.round(freq, 3),
        "Fault_Flag": fault_flag
    }, index=time_index)

    df.index.name = "Timestamp"

    # Assicuriamoci che la directory esista
    os.makedirs(os.path.dirname(output_file), exist_ok=True)

    # 8. Salvataggio CSV
    df.to_csv(output_file)
    print(f"File CSV generato: {output_file}")
    print("Numero di righe:", len(df))

    return df


# -------------------------------------------------------------------------
# Se vuoi eseguire lo script direttamente, decommenta la parte sotto:
# -------------------------------------------------------------------------

if __name__ == "__main__":
    # Genera il dataset per tutto luglio 2023, 15-min step
    df_generated = generate_pv_data_csv(
        start_date="2023-07-01 00:00:00",
        end_date="2023-08-01 00:00:00",
        freq="15T",
        output_file="data/inverter_data_12MW_north_milan_july2023.csv"
    )

    # (Opzionale) Controllo rapido dei primi record
    print("Prime 5 righe del dataset:")
    print(df_generated.head(5))

    # (Opzionale) Grafico di esempio (se vuoi controllare a colpo d'occhio)
    plt.figure()
    plt.plot(df_generated.index, df_generated["PowerAC_kW"], label="Power AC (kW)")
    plt.xlabel("Time")
    plt.ylabel("kW")
    plt.title("Simulazione Impianto FV 12MW - Potenza AC")
    plt.legend()
    plt.show() 