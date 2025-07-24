<template>
    <div class="container">
        <!-- Encabezado con título y clima actual -->
        <div class="header">
            <div class="title">AIRZONE</div>
            <div class="weather">32° 🌤️</div>
        </div>

        <!-- Grupo de botones ON/OFF para toda la casa (sin lógica implementada) -->
        <div class="toggle-group">
            <span>House</span>
            <div>
                <button>ON</button>
                <button>OFF</button>
            </div>
        </div>

        <!-- Sección con escenas predefinidas -->
        <div class="scenes-section">
            <span class="scenes-title">My Scenes</span>
            <div class="scenes">
                <div class="scene">Back Home</div>
                <div class="scene">Morning</div>
                <div class="scene">I'm Out</div>
            </div>
        </div>

        <!-- Sección con las zonas de climatización -->
        <div class="scenes-section">
            <span class="scenes-title">My Zones</span>
            <div class="zones">
                <!-- Componente ZoneButton para cada zona, con eventos para toggle y details -->
                <ZoneButton 
                    v-for="zone in store.zones" 
                    :key="zone.id" 
                    :zone="zone" 
                    @toggle="store.toggleZone"
                    @details="openDetails" 
                />
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, watch } from 'vue'
import { useZonesStore } from '@/stores/useZonesStore'
import ZoneButton from '@/components/ZoneButton.vue'

// Obtenemos el store que maneja las zonas (estado global)
const store = useZonesStore()

// Observamos cualquier cambio en el estado 'isOn' de cada zona para iniciar o detener regulación
watch(
    () => store.zones.map(z => z.isOn),
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

// Al montar el componente, cargar las zonas (desde API o datos simulados)
onMounted(() => {
    store.fetchZones()
})

// Antes de desmontar el componente, detener la regulación en todas las zonas activas
onBeforeUnmount(() => {
    store.zones.forEach(zone => store.stopTemperatureRegulation(zone.id))
})

// Función para mostrar detalles de una zona mediante alerta
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
// Definición de fuente principal
$font-primary: 'Roboto', sans-serif;

.container {
    font-family: $font-primary;
    width: 100%;
    max-width: 1200px;
    background-color: #ebf0f5;
    border-radius: 30px;
    padding: 40px;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
    box-sizing: border-box;
    margin: 40px auto;

    @media (max-width: 480px) {
        border-radius: 0;
        padding: 20px;
        margin: 0;
    }
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;

    .title {
        font-size: 28px;
        font-weight: bold;
    }

    .weather {
        font-size: 18px;
    }
}

.toggle-group {
    background-color: white;
    border-radius: 12px;
    padding: 14px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

    button {
        margin-left: 8px;
        padding: 6px 16px;
        border: none;
        border-radius: 6px;
        background-color: #ddd;
        cursor: pointer;
        font-weight: bold;
    }

    @media (max-width: 700px) {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
    }

}

.scenes {
    display: flex;
    gap: 14px;
    overflow-x: auto;
    margin-bottom: 30px;
}

.scene {
    background-color: white;
    padding: 14px;
    border-radius: 12px;
    text-align: center;
    font-size: 14px;
    min-width: 100px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    flex-shrink: 0;
}

.scenes-section {
    margin-bottom: 30px;

    .scenes-title {
        display: block;
        font-size: 20px;
        font-weight: bold;
        margin-bottom: 30px;
        color: #606162;
        font-family: $font-primary;
    }
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
