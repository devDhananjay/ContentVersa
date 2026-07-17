import type { ToolSlug } from "@/lib/tools/registry";
import { IfscFinderTool } from "./ifsc-finder-tool";
import { PincodeFinderTool } from "./pincode-finder-tool";
import { RtoFinderTool } from "./rto-finder-tool";
import { VehiclePlateDecoderTool } from "./vehicle-plate-decoder-tool";
import { PanGstinCheckerTool } from "./pan-gstin-checker-tool";
import { FssaiCheckerTool } from "./fssai-checker-tool";
import { EmiCalculatorTool } from "./emi-calculator-tool";
import { SipCalculatorTool } from "./sip-calculator-tool";
import { FuelPriceTool } from "./fuel-price-tool";
import { WeatherTool } from "./weather-tool";
import { CurrencyConverterTool } from "./currency-converter-tool";
import { AgeCalculatorTool } from "./age-calculator-tool";
import { QrGeneratorTool } from "./qr-generator-tool";
import { BarcodeGeneratorTool } from "./barcode-generator-tool";
import { UuidGeneratorTool } from "./uuid-generator-tool";
import { IndianHolidaysTool } from "./indian-holidays-tool";
import { ElectionInfoTool } from "./election-info-tool";
import { GeoLocationTool } from "./geo-location-tool";
import { NearbyPlacesTool } from "./nearby-places-tool";

const TOOL_COMPONENTS: Record<ToolSlug, React.ComponentType> = {
  "ifsc-finder": IfscFinderTool,
  "pincode-finder": PincodeFinderTool,
  "rto-finder": RtoFinderTool,
  "vehicle-plate-decoder": VehiclePlateDecoderTool,
  "pan-gstin-checker": PanGstinCheckerTool,
  "fssai-checker": FssaiCheckerTool,
  "emi-calculator": EmiCalculatorTool,
  "sip-calculator": SipCalculatorTool,
  "fuel-price": FuelPriceTool,
  weather: WeatherTool,
  "currency-converter": CurrencyConverterTool,
  "age-calculator": AgeCalculatorTool,
  "qr-generator": QrGeneratorTool,
  "barcode-generator": BarcodeGeneratorTool,
  "uuid-generator": UuidGeneratorTool,
  "indian-holidays": IndianHolidaysTool,
  "election-info": ElectionInfoTool,
  "geo-location": GeoLocationTool,
  "nearby-places": NearbyPlacesTool,
  "nearby-hotels": () => <NearbyPlacesTool defaultCategory="hotels" />,
  "nearby-restaurants": () => <NearbyPlacesTool defaultCategory="restaurants" />,
  "nearby-hospitals": () => <NearbyPlacesTool defaultCategory="hospitals" />,
  "nearby-schools": () => <NearbyPlacesTool defaultCategory="schools" />,
  "nearby-atms": () => <NearbyPlacesTool defaultCategory="atms" />,
};

export function ToolRenderer({ slug }: { slug: ToolSlug }) {
  const Component = TOOL_COMPONENTS[slug];
  return <Component />;
}
