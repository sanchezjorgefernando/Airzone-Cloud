import { defineStore } from 'pinia'

/**
 * Store para la gestión de zonas térmicas usando Pinia.
 * Controla estados, simulación de temperatura y modos de operación.
 */
export const useZonesStore = defineStore('zones', {
  /**
   * Estado reactivo global del store.
   * - zones: Array con información de cada zona térmica.
   * - intervals: Objeto para almacenar intervalos activos (simulación por zona).
   */
  state: () => ({
    zones: [],
    intervals: {}
  }),

  /**
   * Getters computados para derivar información basada en el estado.
   */
  getters: {
    /**
     * Determina el estado térmico actual de una zona basada en temperatura y estado.
     * @param {Object} zone - Zona a evaluar.
     * @returns {'off'|'heating'|'cooling'|'comfort'} Estado térmico.
     */
    zoneStatus: (state) => (zone) => {
      if (!zone.isOn) return 'off'
      if (zone.tempAmbConsigna > zone.tempAmb) return 'heating'
      if (zone.tempAmbConsigna < zone.tempAmb) return 'cooling'
      return 'comfort'
    }
  },

  /**
   * Acciones para manipular el estado y lógica del store.
   */
  actions: {
    /**
     * Inicializa las zonas con datos simulados.
     * En un escenario real, aquí se podría realizar una llamada a una API.
     */
    async fetchZones() {
      this.zones = [
        { id: 1, nameZone: 'Living Room', tempAmb: 20, tempAmbConsigna: 22, isOn: false, modeZone: 'heat', testTemps: [24, 18, 26] },
        { id: 2, nameZone: 'Bedroom',     tempAmb: 20, tempAmbConsigna: 22, isOn: false, modeZone: 'heat', testTemps: [19, 23, 21] },
        { id: 3, nameZone: 'Kitchen',     tempAmb: 24, tempAmbConsigna: 22, isOn: false, modeZone: 'cool', testTemps: [26, 20, 18] },
        { id: 4, nameZone: 'Kitchen',     tempAmb: 24, tempAmbConsigna: 22, isOn: false, modeZone: 'cool', testTemps: [26, 20, 18] },
        { id: 5, nameZone: 'Kitchen iasdofioasdifodsaif', tempAmb: 24, tempAmbConsigna: 22, isOn: false, modeZone: 'cool', testTemps: [26, 20, 18] },
      ].map(zone => ({
        ...zone,
        originalTempAmb: zone.tempAmb,  // Temperatura inicial para restaurar cuando se apaga la zona
        testIndex: -1                   // Índice para controlar ciclos de prueba de temperatura
      }))
    },

    /**
     * Alterna el estado de encendido/apagado de una zona.
     * @param {number} id - Identificador de la zona.
     */
    toggleZone(id) {
      const zone = this.zones.find(z => z.id === id)
      if (!zone) return

      zone.isOn = !zone.isOn

      if (zone.isOn) {
        // Al encender, se reinician parámetros y se inicia la simulación
        zone.testIndex = -1
        zone.tempAmb = zone.originalTempAmb
        this.startTemperatureRegulation(id)
      } else {
        // Al apagar, se detiene la simulación y se restablece temperatura original
        this.stopTemperatureRegulation(id)
        zone.tempAmb = zone.originalTempAmb
      }
    },

    /**
     * Actualiza la consigna de temperatura de una zona.
     * @param {Object} param0 
     * @param {number} param0.id - ID de la zona.
     * @param {number} param0.value - Nueva temperatura de consigna.
     */
    setSetpoint({ id, value }) {
      const zone = this.zones.find(z => z.id === id)
      if (zone) zone.tempAmbConsigna = value
    },

    /**
     * Actualiza el modo de operación de la zona (calefacción/refrigeración).
     * No se utiliza directamente en la simulación actual.
     * @param {Object} param0
     * @param {number} param0.id - ID de la zona.
     * @param {string} param0.mode - Nuevo modo ('heat' o 'cool').
     */
    setMode({ id, mode }) {
      const zone = this.zones.find(z => z.id === id)
      if (zone) zone.modeZone = mode
    },

    /**
     * Inicia la simulación del control de temperatura para una zona específica.
     * Controla el cambio progresivo de la temperatura hacia la consigna.
     * @param {number} id - ID de la zona.
     */
    startTemperatureRegulation(id) {
      const zone = this.zones.find(z => z.id === id)
      if (!zone || !zone.isOn) return

      // Evita múltiples intervalos para la misma zona
      this.stopTemperatureRegulation(id)

      // Intervalo que simula el cambio de temperatura cada 200ms
      this.intervals[id] = setInterval(() => {
        const z = this.zones.find(z => z.id === id)
        if (!z || !z.isOn) return

        const step = 0.08 // Incremento/Decremento de temperatura por ciclo

        if (z.tempAmb < z.tempAmbConsigna) {
          // Simula calentamiento gradual
          z.tempAmb = parseFloat(Math.min(z.tempAmb + step, z.tempAmbConsigna).toFixed(1))
        } else if (z.tempAmb > z.tempAmbConsigna) {
          // Simula enfriamiento gradual
          z.tempAmb = parseFloat(Math.max(z.tempAmb - step, z.tempAmbConsigna).toFixed(1))
        } else {
          // Temperatura alcanzada: se detiene la simulación para esta zona
          this.stopTemperatureRegulation(id)
          console.log(`✅ Zona ${z.nameZone} alcanzó temperatura de confort.`)

          // Ciclo de prueba: avanzamos a la siguiente temperatura de test
          z.testIndex++

          if (z.testIndex < z.testTemps.length) {
            // Espera 1 segundo antes de iniciar siguiente ciclo de simulación
            setTimeout(() => {
              if (!z.isOn) return

              // Actualiza temperatura ambiente a valor de prueba
              z.tempAmb = z.testTemps[z.testIndex]

              // Ajusta modo según la relación entre tempAmb y consigna
              if (z.tempAmb < z.tempAmbConsigna) {
                z.modeZone = 'heat'
              } else if (z.tempAmb > z.tempAmbConsigna) {
                z.modeZone = 'cool'
              }

              console.log(`➡️ Reiniciando ciclo: ${z.nameZone} con tempAmb=${z.tempAmb}, consigna=${z.tempAmbConsigna}, modo=${z.modeZone}`)

              // Reactiva la simulación con el nuevo estado
              this.startTemperatureRegulation(id)
            }, 1000)
          } else {
            // Fin del ciclo de pruebas para esta zona
            console.log(`🛑 Zona ${z.nameZone}: ciclo de pruebas finalizado.`)
          }
        }
      }, 200)
    },

    /**
     * Detiene la simulación (intervalo) para una zona específica.
     * @param {number} id - ID de la zona.
     */
    stopTemperatureRegulation(id) {
      if (this.intervals[id]) {
        clearInterval(this.intervals[id])
        delete this.intervals[id]
      }
    }
  }
})
