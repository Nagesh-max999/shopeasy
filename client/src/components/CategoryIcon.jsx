import {
  HeadphonesIcon, ShirtIcon, HomeIcon, PenIcon, BagIcon, TagIcon, StoreIcon,
  AppleIcon, UtensilsIcon, LaptopIcon, PhoneIcon, SparklesIcon, ShoeIcon, BallIcon,
} from './Icons.jsx';

// Matched by keyword so names like "Mobiles & Tablets" or "Kitchen & Dining" still get an icon
const RULES = [
  [/grocer|fruit|vegetable|food/, AppleIcon],
  [/kitchen|dining|cook/, UtensilsIcon],
  [/mobile|phone|tablet/, PhoneIcon],
  [/laptop|computer/, LaptopIcon],
  [/electronic|audio|headphone/, HeadphonesIcon],
  [/beauty|skin|fragrance|makeup|care/, SparklesIcon],
  [/foot|shoe/, ShoeIcon],
  [/fashion|cloth|apparel|wear/, ShirtIcon],
  [/sport|fitness/, BallIcon],
  [/home|decor|furniture/, HomeIcon],
  [/station|book|office/, PenIcon],
  [/accessor|bag|watch|jewel/, BagIcon],
];

export default function CategoryIcon({ name, ...props }) {
  if (!name) return <StoreIcon {...props} />;
  const key = name.toLowerCase();
  const Icon = RULES.find(([re]) => re.test(key))?.[1] || TagIcon;
  return <Icon {...props} />;
}
