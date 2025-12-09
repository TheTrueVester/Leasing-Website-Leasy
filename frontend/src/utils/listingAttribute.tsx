import { Badge } from "@/components/ui/badge";
import {
  AirVentIcon,
  CroissantIcon,
  BusIcon,
  DumbbellIcon,
  MicrowaveIcon,
  BathIcon,
  StoreIcon,
  TrainFrontIcon,
  TrainFrontTunnelIcon,
} from "lucide-react";
import { ReactNode } from "react";
import { MdOutlineKitchen } from "react-icons/md";
import { PiHairDryer, PiOven } from "react-icons/pi";

export function attributeIcon(attribute: string, className?: string) {
  const attr = attribute.toLowerCase();
  let icon: ReactNode;

  if (attr === "air conditioner") {
    icon = <AirVentIcon className={`stroke-primary ${className}`} />;
  } else if (attr === "bakery") {
    icon = <CroissantIcon className={`stroke-primary ${className}`} />;
  } else if (attr === "bus") {
    icon = <BusIcon className={`stroke-primary ${className}`} />;
  } else if (attr === "gym") {
    icon = <DumbbellIcon className={`stroke-primary ${className}`} />;
  } else if (attr === "hair dryer") {
    icon = <PiHairDryer className={`fill-primary size-6 ${className}`} />;
  } else if (attr === "oven") {
    icon = <PiOven className={`fill-primary size-6 ${className}`} />;
  } else if (attr === "microwave") {
    icon = <MicrowaveIcon className={`stroke-primary ${className}`} />;
  } else if (attr === "separate bathroom") {
    icon = <BathIcon className={`stroke-primary ${className}`} />;
  } else if (attr === "separate kitchen") {
    icon = <MdOutlineKitchen className={`fill-primary size-6 ${className}`} />;
  } else if (attr === "supermarket") {
    icon = <StoreIcon className={`stroke-primary ${className}`} />;
  } else if (attr === "s-bahn") {
    icon = <TrainFrontIcon className={`stroke-primary ${className}`} />;
  } else if (attr === "u-bahn") {
    icon = <TrainFrontTunnelIcon className={`stroke-primary ${className}`} />;
  } else {
    icon = <a />;
  }
  return icon;
}

export function attributeToBadge(attribute: string) {
  const attr = attribute.toLowerCase();
  const icon = attributeIcon(attr);
  return (
    <Badge key={attribute} className="py-2 my-1 space-x-2" variant="outline">
      {icon}
      <span className="truncate">{attribute}</span>
    </Badge>
  );
}
