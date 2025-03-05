import numpy as np
import pandas as pd
import math
import os

def generate_bess_data_csv(
    start_date="2025-05-01 00:00:00",
    end_date="2025-06-01 00:00:00",
    freq="15T",
    output_file="bess_60MW_4h_viterbo_may2025.csv"
):
    """
    Genera un dataset simulato per un BESS da 60 MW / 240 MWh (4h) a Viterbo,
    con risoluzione 15-min, arbitraggio energetico e vari parametri realistici.
    """

    # 1. Crea l'indice temporale
    time_index = pd.date_range(start=start_date, end=end_date, freq=freq)
    n_steps = len(time_index)
    print(f"Generazione dataset BESS con {n_steps} intervalli da {freq}.")

    # 2. Parametri del BESS (4h)
    power_bess_max_kW = 60000.0   # 60 MW = 60.000 kW
    capacity_bess_mwh = 240.0     # 240 MWh (4h)
    soc_min_mwh = 0.2 * capacity_bess_mwh   # 20% = 48 MWh
    soc_max_mwh = 0.95 * capacity_bess_mwh  # 95% = 228 MWh
    eta_charge = 0.95
    eta_discharge = 0.95

    # 3. Generazione del segnale di prezzo
    minutes_total = np.arange(n_steps) * (pd.Timedelta(freq).total_seconds() / 60.0)
    hours_of_day = (minutes_total / 60.0) % 24

    base_price = 50.0
    daily_price_variation = 10.0 * np.sin(math.pi * (hours_of_day - 14) / 12.0)
    price_noise = np.random.normal(0, 2, n_steps)

    market_price = base_price + daily_price_variation + price_noise
    market_price[market_price < 0] = 0
    market_price[market_price > 200] = 200

    # 4. Strategia di arbitraggio semplice
    bess_power_kW = np.zeros(n_steps)  
    bess_soc_mwh = np.zeros(n_steps)
    bess_soc_mwh[0] = (soc_min_mwh + soc_max_mwh)/2.0

    # Calcoliamo la media giornaliera per determinare la soglia
    daily_means = np.zeros(n_steps)
    current_day = None

    for i in range(n_steps):
        day_date = time_index[i].date()
        if day_date != current_day:
            current_day = day_date
            mask = [d.date() == current_day for d in time_index]
            day_mean = np.mean(market_price[mask])
            daily_means[mask] = day_mean

    # 5. Calcolo SoC e potenza
    for i in range(1, n_steps):
        price_now = market_price[i]
        day_mean_price = daily_means[i]

        if price_now < day_mean_price:
            # carichiamo
            bess_power_kW[i] = power_bess_max_kW
        elif price_now > day_mean_price:
            # scarichiamo
            bess_power_kW[i] = -power_bess_max_kW
        else:
            bess_power_kW[i] = 0
        
        delta_t_hours = (pd.Timedelta(freq).total_seconds() / 3600.0)
        if bess_power_kW[i] > 0:
            # carica
            energy_in = bess_power_kW[i] * eta_charge * delta_t_hours / 1000.0
            bess_soc_mwh[i] = bess_soc_mwh[i-1] + energy_in
        elif bess_power_kW[i] < 0:
            # scarica
            energy_out = abs(bess_power_kW[i]) * (1.0/eta_discharge) * delta_t_hours / 1000.0
            bess_soc_mwh[i] = bess_soc_mwh[i-1] - energy_out
        else:
            bess_soc_mwh[i] = bess_soc_mwh[i-1]
        
        # clamp SoC
        if bess_soc_mwh[i] > soc_max_mwh:
            bess_soc_mwh[i] = soc_max_mwh
            bess_power_kW[i] = 0
        elif bess_soc_mwh[i] < soc_min_mwh:
            bess_soc_mwh[i] = soc_min_mwh
            bess_power_kW[i] = 0

    # Operating_Mode
    operating_mode = []
    for p in bess_power_kW:
        if p > 0:
            operating_mode.append("Charge")
        elif p < 0:
            operating_mode.append("Discharge")
        else:
            operating_mode.append("Idle")

    # 6. Fault e temperatura
    fault_probability = 0.01
    fault_random = np.random.rand(n_steps) < fault_probability
    fault_flag = fault_random.astype(int)

    fault_code = np.zeros(n_steps, dtype=int)
    for i in range(n_steps):
        if fault_flag[i] == 1:
            fault_code[i] = np.random.randint(1,4)  # codici 1..3
        else:
            fault_code[i] = 0

    bess_power_faulted = bess_power_kW.copy()
    bess_soc_faulted = bess_soc_mwh.copy()
    for i in range(1, n_steps):
        if fault_flag[i] == 1:
            bess_power_faulted[i] = 0.0
            bess_soc_faulted[i] = bess_soc_faulted[i-1]

    # Temperatura (base 25°C, +5°C max a potenza nominale, + extra se fault)
    bess_temperature = np.zeros(n_steps)
    for i in range(n_steps):
        base_temp = 25.0
        power_ratio = abs(bess_power_faulted[i]) / power_bess_max_kW
        thermal_increase = 5.0 * power_ratio
        noise = np.random.normal(0, 2)
        bess_temperature[i] = base_temp + thermal_increase + noise
        if fault_flag[i] == 1:
            bess_temperature[i] += np.random.uniform(3,8)

    # 7. Cycle Count (cicli accumulati)
    cycle_count = np.zeros(n_steps, dtype=int)
    ccount = 0
    for i in range(1, n_steps):
        cycle_count[i] = ccount
        if bess_power_faulted[i-1] > 0 and bess_power_faulted[i] < 0:
            ccount += 1
        if bess_power_faulted[i-1] < 0 and bess_power_faulted[i] > 0:
            ccount += 1
        cycle_count[i] = ccount

    # 8. AC Voltage & Frequency
    nominal_voltage_v = 150000.0
    voltage_noise = np.random.normal(0, 1000, n_steps)
    ac_voltage_v = nominal_voltage_v + voltage_noise

    freq_noise = np.random.normal(0, 0.02, n_steps)
    ac_frequency_hz = 50.0 + freq_noise

    # 9. Creazione DataFrame finale
    df = pd.DataFrame({
        "Market_Price_EUR_MWh": np.round(market_price, 2),
        "BESS_Power_kW": np.round(bess_power_faulted, 2),
        "BESS_SoC_MWh": np.round(bess_soc_faulted, 2),
        "BESS_SoC_%": np.round(bess_soc_faulted/capacity_bess_mwh*100.0, 2),
        "BESS_Temperature_C": np.round(bess_temperature, 2),
        "Operating_Mode": operating_mode,
        "Fault_Flag": fault_flag,
        "Fault_Code": fault_code,
        "Cycle_Count": cycle_count,
        "AC_Voltage_V": np.round(ac_voltage_v, 2),
        "AC_Frequency_Hz": np.round(ac_frequency_hz, 3)
    }, index=time_index)

    df.index.name = "Timestamp"

    # Assicuriamoci che la directory esista
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    
    df.to_csv(output_file)
    print(f"File CSV generato: {output_file}")
    print(f"Numero di righe: {len(df)}")

    return df


# Esecuzione diretta
if __name__ == "__main__":
    df_bess = generate_bess_data_csv(
        start_date="2025-05-01 00:00:00",
        end_date="2025-06-01 00:00:00",
        freq="15T",
        output_file="public/data/bess_60MW_4h_viterbo_may2025.csv"
    )

    print(df_bess.head(10)) 