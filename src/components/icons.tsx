import type { ComponentType } from "react";
import { BadgeCheck, ClipboardList, House, MapPinned, Navigation, Star, UserRound, WalletCards } from "lucide-react-native";

export type AppIconProps = { size?: number; stroke?: string; strokeWidth?: number };
type Icon = ComponentType<AppIconProps>;

// Lucide's published React 19 declarations conflict with this Expo SVG type set.
const native = (icon: unknown) => icon as Icon;

export const HomeIcon = native(House);
export const JobsIcon = native(ClipboardList);
export const EarningsIcon = native(WalletCards);
export const ProfileIcon = native(UserRound);
export const RouteIcon = native(Navigation);
export const MapIcon = native(MapPinned);
export const StarIcon = native(Star);
export const VerifiedIcon = native(BadgeCheck);
