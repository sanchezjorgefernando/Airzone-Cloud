<template>
  <div :class="['zone-button', status]">
    <!-- Icono giratorio para cooling -->
    <div v-if="status === 'cooling'" class="zb-spin-icon"></div>

    <!-- HEADER: temperatura + botón power -->
    <div class="zb-header">
      <span class="zb-temp">{{ formattedTemp }}</span>
      <button class="zb-power" @click="$emit('toggle', zone.id)">
        <img src="/Iconos/power.svg" alt="Power" />
      </button>
    </div>

    <!-- BODY: nombre de zona y estado -->
    <div class="zb-body">
      <p class="zb-name">{{ truncatedName }}</p>
      <p class="zb-status">{{ statusText }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useZonesStore } from '@/stores/useZonesStore'

const props = defineProps({
  zone: { type: Object, required: true }
})
const store = useZonesStore()
const status = computed(() => store.zoneStatus(props.zone))

const truncatedName = computed(() => {
  const name = props.zone.nameZone || ''
  return name.length > 15 ? name.slice(0, 15) + '. . .' : name
})

const formattedTemp = computed(() => {
  return `${props.zone.tempAmb.toFixed(1)}º`
})

const statusText = computed(() => {
  const sp = props.zone.tempAmbConsigna
  switch (status.value) {
    case 'heating':
      return `Heating to ${sp}°`
    case 'cooling':
      return `Cooling to ${sp}°`
    case 'comfort':
      return `Success`
    default:
      return 'OFF'
  }
})
</script>

<style scoped lang="scss">
$font-primary: 'Roboto', sans-serif;
$box-shadow-default: 0 1px 3px rgba(0, 0, 0, 0.22), 0 1px 2px rgba(0, 0, 0, 0.34);

$color-off-bg: #ffffff;
$color-text-primary: #1f2933;
$color-text-secondary: #7b8794;
$color-text-tertiary: #9aa5b1;

$color-heating: #ffc3bd;
$color-cooling: #b3ecff;
$color-comfort: #c6f7e5;

/* Animación para girar */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.zone-button {
  position: relative;
  width: 200px;
  height: 130px;
  padding: 17px 13px;
  border-radius: 10px;
  background-color: $color-off-bg;
  box-shadow: $box-shadow-default;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  transition: background-color 0.4s ease-in-out;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    z-index: 0;
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
    opacity: 0;
    transition: opacity 0.6s ease-in-out;
    pointer-events: none;
  }

  & > * {
    position: relative;
    z-index: 1;
  }

  .zb-spin-icon {
    position: absolute;
    top: 43px;
    left: 156px;
    width: 118px;
    height: 177px;
    background-image: url(/Iconos/cool.svg);
    background-repeat: no-repeat;
    background-size: contain;
    background-position: center;
    filter: brightness(0) invert(1);
    opacity: 0.08;
    pointer-events: none;
    z-index: 1;
    animation: spin 8s linear infinite;
    transition: opacity 0.6s ease-in-out;
  }

  .zb-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .zb-temp {
      font-family: $font-primary;
      font-weight: 500;
      font-size: 33px;
      color: $color-text-secondary;
      margin: 0;
    }

    .zb-power {
      width: 55px;
      height: 55px;
      display: flex;
      justify-content: center;
      align-items: center;
      background: none;
      border: none;
      cursor: pointer;

      img {
        width: 33px;
        height: 33px;
        filter: invert(68%) sepia(7%) saturate(0%) hue-rotate(180deg) brightness(100%) contrast(88%);
      }
    }
  }

  .zb-body {
    .zb-name {
      font-family: $font-primary;
      font-weight: 500;
      font-size: 16px;
      color: $color-text-primary;
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
    }

    .zb-status {
      font-family: $font-primary;
      font-weight: 500;
      font-size: 13px;
      color: $color-text-tertiary;
      margin: 4px 0 0;
    }
  }

  &.heating {
    &::after {
      background-image: radial-gradient(circle at 0% 100%, #ef694e 0%, #cf1e11 100%);
      opacity: 1;
    }

    &::before {
      content: '';
      position: absolute;
      top: 40px;
      left: 150px;
      width: 118px;
      height: 177px;
      background-image: url(/Iconos/heat.svg);
      background-repeat: no-repeat;
      background-size: contain;
      background-position: center;
      filter: brightness(0) invert(1);
      opacity: 0.08;
      pointer-events: none;
      z-index: 1;
      animation: spin 10s linear infinite;
      transform-origin: center center;
    }

    .zb-header .zb-temp,
    .zb-body .zb-name {
      color: white;
    }

    .zb-header .zb-power img {
      filter: brightness(0) saturate(100%) invert(1);
    }

    .zb-body .zb-status {
      color: $color-heating;
    }
  }

  &.cooling {
    &::after {
      background-image: radial-gradient(circle at 0% 100%, #40c3f7 0%, #0b69a3 100%);
      opacity: 1;
    }

    .zb-header .zb-temp,
    .zb-body .zb-name {
      color: white;
    }

    .zb-header .zb-power img {
      filter: brightness(0) saturate(100%) invert(1);
    }

    .zb-body .zb-status {
      color: $color-cooling;
    }
  }

  &.comfort {
    &::after {
      background-image: radial-gradient(circle at 3% 99%, #2dcc9a 0%, #01644f 100%);
      opacity: 1;
    }

    .zb-header .zb-temp,
    .zb-body .zb-name {
      color: white;
    }

    .zb-header .zb-power img {
      filter: brightness(0) saturate(100%) invert(1);
    }

    .zb-body .zb-status {
      color: $color-comfort;
    }
  }
}
</style>
