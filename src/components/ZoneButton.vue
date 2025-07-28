<template>
  <div
    :key="status" 
    :class="['zone-button', status, { 'animate-bg': animateBg }]"
    @animationend="animateBg = false"
  >
    <!-- Iconos giratorios -->
    <div
      v-if="status === 'cooling' || status === 'heating'"
      class="zb-spin-icon"
      :style="spinIconStyle"
    />

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
  import { computed, ref, watch } from 'vue'
  import { useZonesStore } from '@/stores/useZonesStore'

  const props = defineProps({
    zone: { type: Object, required: true }
  })
  const store = useZonesStore()

  const status = computed(() => store.zoneStatus(props.zone))
  const spinIconStyle = computed(() => {
    const icon = status.value === 'heating' ? 'heat.svg' : 'cool.svg'
    return {
      backgroundImage: `url(/Iconos/${icon})`
    }
  })

  const animateBg = ref(false)

  // Cuando cambia el estado, activamos la animación
  watch(status, () => {
    animateBg.value = false
    // Forzamos un "tick" para reiniciar animación
    setTimeout(() => {
      animateBg.value = true
    }, 10)
  })

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
  @use "sass:color"; 

  $font-primary: 'Roboto', sans-serif;
  $box-shadow-default: 0 1px 3px rgba(0, 0, 0, 0.22), 0 1px 2px rgba(0, 0, 0, 0.34);

  $color-off-bg: #ffffff;
  $color-text-primary: #1f2933;
  $color-text-secondary: #7b8794;
  $color-text-tertiary: #9aa5b1;

  $color-heating-start: #ffb6a1;
  $color-heating-end: #cf1e11;

  $color-cooling-start: #9ad8ff;
  $color-cooling-end: #0b69a3;

  $color-comfort-start: #7fe2b8;
  $color-comfort-end: #01644f;

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @keyframes bgPulse {
    0% {
      filter: brightness(1);
      box-shadow: 0 0 0px rgba(255, 255, 255, 0);
    }
    50% {
      filter: brightness(1.09);
      box-shadow: 0 0 15px rgba(255, 255, 255, 0.6);
    }
    100% {
      filter: brightness(1);
      box-shadow: 0 0 0px rgba(255, 255, 255, 0);
    }
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
    transition: background-color 0.9s cubic-bezier(0.25, 0.1, 0.25, 1);

    & > * {
      position: relative;
      z-index: 1;
    }

    &.animate-bg {
      animation: bgPulse 0.6s ease forwards;
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
        transition: color 0.4s ease;
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
          transition: filter 0.4s ease;
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
        transition: color 0.4s ease;
      }

      .zb-status {
        font-family: $font-primary;
        font-weight: 500;
        font-size: 13px;
        color: $color-text-tertiary;
        margin: 4px 0 0;
        transition: color 0.4s ease;
      }
    }

    &.heating {
      background: linear-gradient(135deg, $color-heating-start, $color-heating-end);
      color: white;

      .zb-header .zb-temp,
      .zb-body .zb-name {
        color: white;
      }

      .zb-header .zb-power img {
        filter: brightness(0) saturate(100%) invert(1);
      }

      .zb-body {
        color: color.adjust($color-heating-end, $lightness: 15%);
      }

      .zb-status {
        color: #FFC3BD;
      }
    }

    &.cooling {
      background: linear-gradient(135deg, $color-cooling-start, $color-cooling-end);
      color: white;

      .zb-header .zb-temp,
      .zb-body .zb-name {
        color: white;
      }

      .zb-header .zb-power img {
        filter: brightness(0) saturate(100%) invert(1);
      }

      .zb-body {
        color: color.adjust($color-cooling-end, $lightness: 15%);
      }

      .zb-status {
        color:#B3ECFF; 
      }
    }

    &.comfort {
      background: linear-gradient(135deg, $color-comfort-start, $color-comfort-end);
      color: white;

      .zb-header .zb-temp,
      .zb-body .zb-name {
        color: white;
      }

      .zb-header .zb-power img {
        filter: brightness(0) saturate(100%) invert(1);
      }

      .zb-body {
        color: color.adjust($color-comfort-end, $lightness: 15%);
      }

      .zb-status {
        color: #C6F7E5;
      }
    }
  }
</style>
