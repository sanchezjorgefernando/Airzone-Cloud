import { mount } from "@vue/test-utils";
import { setActivePinia, createPinia } from "pinia";
import { describe, it, expect, beforeEach, vi } from "vitest";
import ZoneButton from "../../components/ZoneButton.vue";

const zoneStatusMock = vi.fn();

vi.mock("@/stores/useZonesStore", () => {
  return {
    useZonesStore: () => ({
      zoneStatus: zoneStatusMock,
    }),
  };
});

const baseZone = {
  id: 1,
  nameZone: "Living Room Zone",
  tempAmb: 21.456,
  tempAmbConsigna: 22,
  isOn: true,
  modeZone: "heat",
};

const createWrapper = (zoneOverrides = {}) => {
  return mount(ZoneButton, {
    props: {
      zone: { ...baseZone, ...zoneOverrides },
    },
  });
};
describe("ZoneButton.vue", () => {

  beforeEach(() => {
    setActivePinia(createPinia());
    zoneStatusMock.mockReset();
  });

  it("should display the correct status text for heating", () => {
    zoneStatusMock.mockReturnValue("heating");
    const wrapper = createWrapper();

    expect(wrapper.find(".zb-status").text()).toBe(
      `Heating to ${baseZone.tempAmbConsigna}°`
    );
  });

  it("should display the correct status text for cooling", () => {
    zoneStatusMock.mockReturnValue("cooling");
    const wrapper = createWrapper();

    expect(wrapper.find(".zb-status").text()).toBe(
      `Cooling to ${baseZone.tempAmbConsigna}°`
    );
  });

  it("should display the correct status text for comfort", () => {
    zoneStatusMock.mockReturnValue("comfort");
    const wrapper = createWrapper();

    expect(wrapper.find(".zb-status").text()).toBe(`Success`);
  });
});
