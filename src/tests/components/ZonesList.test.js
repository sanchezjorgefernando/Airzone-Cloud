import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { describe, it, expect, beforeEach } from 'vitest'
import ZonesList from '../../components/ZoneLIst.vue'
import { useZonesStore } from '@/stores/useZonesStore'

describe('ZonesList.vue', () => {
  let pinia
  let store

  beforeEach(async () => {
    pinia = createPinia()
    setActivePinia(pinia)

    store = useZonesStore()

    // Mockear fetchZones para que cargue datos conocidos rápido
    store.fetchZones = async () => {
      store.zones = [
        { id: 1, nameZone: 'Living Room', tempAmb: 20, tempAmbConsigna: 22, isOn: false, modeZone: 'heat', testTemps: [24, 18, 26], originalTempAmb: 20, testIndex: -1 },
        { id: 2, nameZone: 'Bedroom', tempAmb: 20, tempAmbConsigna: 22, isOn: false, modeZone: 'heat', testTemps: [19, 23, 21], originalTempAmb: 20, testIndex: -1 }
      ]
    }
  })

  it('renders zones after fetchZones', async () => {
    const wrapper = mount(ZonesList, {
      global: {
        plugins: [pinia]
      }
    })

    // Esperar a que se ejecute fetchZones y reactive la UI
    await flushPromises()

    const zoneButtons = wrapper.findAllComponents({ name: 'ZoneButton' })

    expect(zoneButtons.length).toBe(2)

    // Verificar que el primer botón tenga el nombre correcto
    expect(zoneButtons[0].props('zone').nameZone).toBe('Living Room')
  })

  it('toggles zone on button click', async () => {
    const wrapper = mount(ZonesList, {
      global: {
        plugins: [pinia]
      }
    })

    await flushPromises()

    const zoneButtons = wrapper.findAllComponents({ name: 'ZoneButton' })

    // Emite evento toggle para la zona 1 (Living Room)
    await zoneButtons[0].vm.$emit('toggle', 1)

    // El estado isOn debe cambiar a true
    expect(store.zones[0].isOn).toBe(true)

    // Emitir toggle otra vez para apagar
    await zoneButtons[0].vm.$emit('toggle', 1)

    expect(store.zones[0].isOn).toBe(false)
  })

  it('opens details alert on details event', async () => {
    const wrapper = mount(ZonesList, {
      global: {
        plugins: [pinia]
      }
    })

    await flushPromises()

    window.alert = vi.fn()

    const zoneButtons = wrapper.findAllComponents({ name: 'ZoneButton' })

    await zoneButtons[0].vm.$emit('details', store.zones[0])

    expect(window.alert).toHaveBeenCalled()

    const alertMessage = window.alert.mock.calls[0][0]

    expect(alertMessage).toContain('Living Room')
    expect(alertMessage).toContain('20')
  })
})
