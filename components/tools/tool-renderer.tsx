import type { ToolSlug } from "@/lib/tools/registry";
import { IfscFinderTool } from "./ifsc-finder-tool";
import { PincodeFinderTool } from "./pincode-finder-tool";
import { RtoFinderTool } from "./rto-finder-tool";
import { VehiclePlateDecoderTool } from "./vehicle-plate-decoder-tool";
import { PanGstinCheckerTool } from "./pan-gstin-checker-tool";
import { EmiCalculatorTool } from "./emi-calculator-tool";
import { SipCalculatorTool } from "./sip-calculator-tool";
import { FuelPriceTool } from "./fuel-price-tool";

const TOOL_COMPONENTS: Record<ToolSlug, React.ComponentType> = {
  "ifsc-finder": IfscFinderTool,
  "pincode-finder": PincodeFinderTool,
  "rto-finder": RtoFinderTool,
  "vehicle-plate-decoder": VehiclePlateDecoderTool,
  "pan-gstin-checker": PanGstinCheckerTool,
  "emi-calculator": EmiCalculatorTool,
  "sip-calculator": SipCalculatorTool,
  "fuel-price": FuelPriceTool,
};

export function ToolRenderer({ slug }: { slug: ToolSlug }) {
  const Component = TOOL_COMPONENTS[slug];
  return <Component />;
}
