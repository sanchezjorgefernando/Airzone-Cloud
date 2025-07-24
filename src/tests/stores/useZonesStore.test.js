import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useZonesStore } from '@/stores/useZonesStore'

describe('useZonesStore', () => {
  let store

  beforeEach(async () => {
    setActivePinia(createPinia())
    store = useZonesStore()
    await store.fetchZones()
  })

  it('should load 3 zones initially', () => {
    expect(store.zones.length).toBe(3)
  })

  it('should toggle a zone on and off', () => {
    const zoneId = 1
    expect(store.zones[0].isOn).toBe(false)

    store.toggleZone(zoneId)
    expect(store.zones[0].isOn).toBe(true)

    store.toggleZone(zoneId)
    expect(store.zones[0].isOn).toBe(false)
  })

  it('should update the setpoint of a zone', () => {
    const zoneId = 2
    store.setSetpoint({ id: zoneId, value: 25 })
    expect(store.zones.find(z => z.id === zoneId).tempAmbConsigna).toBe(25)
  })

  it('should update the mode of a zone', () => {
    const zoneId = 3
    store.setMode({ id: zoneId, mode: 'cool' })
    expect(store.zones.find(z => z.id === zoneId).modeZone).toBe('cool')
  })

  it('should correctly detect heating state', () => {
    const zone = {
      tempAmb: 20,
      tempAmbConsigna: 22,
      isOn: true
    }
    expect(store.zoneStatus(zone)).toBe('heating')
  })

  it('should correctly detect cooling state', () => {
    const zone = {
      tempAmb: 24,
      tempAmbConsigna: 22,
      isOn: true
    }
    expect(store.zoneStatus(zone)).toBe('cooling')
  })

  it('should correctly detect comfort state', () => {
    const zone = {
      tempAmb: 22,
      tempAmbConsigna: 22,
      isOn: true
    }
    expect(store.zoneStatus(zone)).toBe('comfort')
  })

  it('should correctly detect off state', () => {
    const zone = {
      tempAmb: 22,
      tempAmbConsigna: 22,
      isOn: false
    }
    expect(store.zoneStatus(zone)).toBe('off')
  })
})
