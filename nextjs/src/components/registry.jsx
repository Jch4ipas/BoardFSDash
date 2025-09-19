import Clock from "@/components/Clock";
import NasaMedia from "@/services/infonasa";
import LatestWordPressVersion from "@/services/wordpresslastversion";
import Salleinfo from "@/services/Salleinfo";
import NextFreeze from "@/components/freeze";

export const registry = {
  Clock,
  NasaMedia,
  LatestWordPressVersion,
  Salleinfo,
  NextFreeze,
  "": () => <></>,
  iframe: (props) => <iframe {...props} />,
};

export const reverseRegistry = Object.fromEntries(
  Object.entries(registry).map(([key, value]) => [value, key])
);