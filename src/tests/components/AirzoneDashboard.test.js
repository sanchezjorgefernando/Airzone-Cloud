import { describe, it, expect, vi, beforeEach } from "vitest";
import { shallowMount } from "@vue/test-utils";
import AirzoneDashboard from "../../components/AirzoneDashboard.vue";
import ZoneButton from "@/components/ZoneButton.vue";
import { useZonesStore } from "../../stores/useZonesStore";

const fetchZonesMock = vi.fn();

vi.mock("@/stores/useZonesStore", () => {
  return {
    useZonesStore: () => ({
      zones: [
        {
          id: 1,
          nameZone: "Living Room",
          tempAmb: 23,
          tempAmbConsigna: 24,
          isOn: true,
        },
        {
          id: 2,
          nameZone: "Bedroom",
          tempAmb: 21,
          tempAmbConsigna: 22,
          isOn: false,
        },
      ],
      fetchZones: fetchZonesMock,
      toggleZone: vi.fn(),
      startTemperatureRegulation: vi.fn(),
      stopTemperatureRegulation: vi.fn(),
      zoneStatus: (zone) => (zone.isOn ? "ON" : "OFF"),
    }),
  };
});

describe("AirzoneDashboard.vue", () => {
  let store;
  let wrapper;

  beforeEach(() => {
    store = useZonesStore();

    wrapper = shallowMount(AirzoneDashboard, {
      global: {
        components: { ZoneButton },
      },
    });
  });

  it("should mount correctly", () => {
    expect(wrapper.exists()).toBe(true);
  });

  it("should call fetchZones when mounting", () => {
    expect(fetchZonesMock).toHaveBeenCalled();
  });

  it("should render ZoneButtons correctly ", () => {
    const buttons = wrapper.findAllComponents(ZoneButton);

    expect(buttons).toHaveLength(2);
  });

  it("muestra alerta al hacer click en detalles", async () => {
    global.alert = vi.fn();

    const zoneButton = wrapper.findComponent(ZoneButton);
    await zoneButton.vm.$emit("details", store.zones[0]);

    expect(global.alert).toHaveBeenCalledWith(
      expect.stringContaining("Living Room")
    );
    expect(global.alert).toHaveBeenCalledWith(expect.stringContaining("23"));
  });

  it("should render the ON and OFF buttons", () => {
    const houseButtons = wrapper.findAll(".toggle-group button");

    expect(houseButtons).toHaveLength(2);
    expect(houseButtons[0].text()).toBe("ON");
    expect(houseButtons[1].text()).toBe("OFF");
  });
});
