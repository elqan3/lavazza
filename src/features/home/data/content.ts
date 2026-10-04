import {
  Coffee,
  Heart,
  Clock,
  Smartphone,
  Armchair,
  Award,
  type LucideIcon,
} from "lucide-react";

export type Drink = {
  name: string;
  nameEn: string;
  image: string;
};

export type WhyItem = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export const navLinks = [
  { label: "الرئيسية", href: "#hero" },
  { label: "اطلب الآن", href: "/order" },
  { label: "المنيو", href: "/menu" },
  { label: "مساحة لافازا", href: "/mood-space" },
  { label: "تواصل", href: "#contact" },
];

export const popularDrinks: Drink[] = [
  { name: "لاتيه", nameEn: "Latte", image: "/menu/menu1.jpg" },
  { name: "كابتشينو", nameEn: "Cappuccino", image: "/menu/menu2.jpg" },
  { name: "موكا", nameEn: "Mocha", image: "/menu/menu3.jpg" },
  { name: "قهوة تركية", nameEn: "Turkish Coffee", image: "/menu/menu4.jpg" },
];

export const whyLavaza: WhyItem[] = [
  {
    icon: Award,
    title: "جودة عالية",
    description: "مكونات مختارة وتحضير متقن في كل صنف",
  },
  {
    icon: Clock,
    title: "خدمة سريعة",
    description: "طلبك يصل إليك بسرعة دون المساس بالجودة",
  },
  {
    icon: Smartphone,
    title: "طلب أسهل",
    description: "تصفح الأصناف واطلب مباشرة من هاتفك",
  },
  {
    icon: Armchair,
    title: "مكان مريح",
    description: "أجواء هادئة تناسب العمل واللقاءات",
  },
];

export const aboutText =
  "لافازا مقهى عصري يجمع بين القهوة والحلويات وأجواء مريحة. نؤمن بأن كل زيارة تستحق أن تكون لحظة مميزة.";

export const contactInfo = {
  address: "ترهونة, ليبيا",
  hours: "يومياً · 8:00 ص – 11:00 م",
  phone: "+218 91 000 0000",
};

export const footerLinks = [
  { label: "اطلب الآن", href: "/order" },
  { label: "المنيو", href: "/menu" },
  { label: "مساحة لافازا", href: "/mood-space" },
  { label: "تواصل", href: "#contact" },
];
