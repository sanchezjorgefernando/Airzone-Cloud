import { mount } from "@vue/test-utils";
import { setActivePinia, createPinia } from "pinia";
import { describe, it, expect, beforeEach, vi } from "vitest";

const zoneStatusMock = vi.fn();

vi.mock("@/stores/useZonesStore", () => {
  return {
    useZonesStore: () => ({
      zoneStatus: zoneStatusMock,
    }),
  };
});

import ZoneButton from "../../components/ZoneButton.vue";
import { useZonesStore } from "@/stores/useZonesStore";

describe("ZoneButton.vue", () => {
  let store;

  const baseZone = {
    id: 1,
    nameZone: "Living Room Zone",
    tempAmb: 21.456,
    tempAmbConsigna: 22,
    isOn: true,
    modeZone: "heat",
  };

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useZonesStore();
    zoneStatusMock.mockReset(); // Limpia mocks entre tests
  });

  it("displays correct status text for heating", () => {
    zoneStatusMock.mockReturnValue("heating");
    const wrapper = mount(ZoneButton, {
      props: { zone: baseZone },
    });
    expect(wrapper.find(".zb-status").text()).toBe(
      `Heating to ${baseZone.tempAmbConsigna}°`
    );
  });

  it("displays correct status text for cooling", () => {
    zoneStatusMock.mockReturnValue("cooling");
    const wrapper = mount(ZoneButton, {
      props: { zone: baseZone },
    });
    expect(wrapper.find(".zb-status").text()).toBe(
      `Cooling to ${baseZone.tempAmbConsigna}°`
    );
  });



  // Otros tests...
});
