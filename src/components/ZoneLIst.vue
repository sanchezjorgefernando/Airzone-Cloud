<template>
    <div class="zones">
      <ZoneButton
        v-for="zone in store.zones"
        :key="zone.id"
        :zone="zone"
        @toggle="store.toggleZone"
        @details="openDetails"
      />
    </div>
</template>


<script setup>
import { onMounted, onBeforeUnmount, watch } from 'vue'
import { useZonesStore }   from '@/stores/useZonesStore'
import ZoneButton          from '@/components/ZoneButton.vue'

const store = useZonesStore()

// Observa cualquier cambio en el array de zonas
watch(
  () => store.zones.map(z => z.isOn), // solo los estados isOn
  (newStates) => {
    newStates.forEach((isOn, index) => {
      const zone = store.zones[index]
      if (isOn) {
        store.startTemperatureRegulation(zone.id)
      } else {
        store.stopTemperatureRegulation(zone.id)
      }
    })
  },
  { deep: true, immediate: true }
)


// Al montar, carga las zonas (mock o API)
onMounted(() => {
  store.fetchZones()
})

// Cancelar todos los intervalos al desmontar el componente
onBeforeUnmount(() => {
  store.zones.forEach(zone => store.stopTemperatureRegulation(zone.id))
})

// Función que gestiona el evento 'details'
function openDetails(zone) {
  alert(`
    Zona: ${zone.nameZone}
    Ambiente: ${zone.tempAmb}°C
    Consigna: ${zone.tempAmbConsigna}°C
    Estado: ${store.zoneStatus(zone)}
  `)
}
</script>

<style scoped lang="scss">
  .zone-list {
    display: grid;
    gap: 1rem;
    padding: 1rem 15px;
    justify-content: center;
    width: 100%;
    box-sizing: border-box;
  }

  .zones {
    display: grid;
    grid-template-columns: repeat(4, 230px); // 4 columnas fijas de 200px ancho
    gap: 30px; // Espacio de 30px entre filas y columnas
    justify-content: center;
    justify-items: center;

    @media (min-width: 640px) and (max-width: 1024px) {
        grid-template-columns: repeat(3, 230px);
    }

    @media (max-width: 640px) {
        grid-template-columns: repeat(2, 230px);
    }

    @media (max-width: 480px) {
        grid-template-columns: 1fr;
    }
}
</style>