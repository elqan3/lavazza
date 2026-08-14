import {
  Coffee,
  Heart,
  QrCode,
  Quote,
  Clock,
  Smartphone,
  Armchair,
  Award,
  type LucideIcon,
} from "lucide-react";

export type Service = {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
};

export type Drink = {
  name: string;
  nameEn: string;
  price: string;
  image: string;
};

export type WhyItem = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export const navLinks = [
  { label: "الرئيسية", href: "#hero" },
  { label: "الخدمات", href: "#services" },
  { label: "المنيو", href: "/menu" },
  { label: "مساحة لافازا", href: "/mood-space" },
  { label: "تواصل", href: "#contact" },
];

export const services: Service[] = [
  {
    icon: Coffee,
    title: "المنيو",
    description: "تصفّح مشروباتنا وحلوياتنا المحضّرة بعناية",
    href: "/menu",
  },
  {
    icon: Heart,
    title: "مساحة لافازا",
    description: "شارك لحظاتك مع مجتمع لافازا مود",
    href: "/mood-space",
  },
  {
    icon: Quote,
    title: "الاقتباسات",
    description: "اقتباسات ملهمة ترافق كل فنجان",
    href: "#quote",
  },
  {
    icon: QrCode,
    title: "QR",
    description: "الوصول السريع لجميع خدمات لافازا",
    href: "/home",
  },
];

export const popularDrinks: Drink[] = [
  {
    name: "لاتيه",
    nameEn: "Latte",
    price: "15 د.ل",
    image: "/menu/menu1.jpg",
  },
  {
    name: "كابتشينو",
    nameEn: "Cappuccino",
    price: "12 د.ل",
    image: "/menu/menu2.jpg",
  },
  {
    name: "موكا",
    nameEn: "Mocha",
    price: "18 د.ل",
    image: "/menu/menu3.jpg",
  },
  {
    name: "قهوة تركية",
    nameEn: "Turkish Coffee",
    price: "8 د.ل",
    image: "/menu/menu4.jpg",
  },
];

export const whyLavaza: WhyItem[] = [
  {
    icon: Award,
    title: "جودة عالية",
    description: "مكونات مختارة وتحضير احترافي في كل صنف",
  },
  {
    icon: Clock,
    title: "خدمة سريعة",
    description: "طلبك يصل إليك بسرعة دون المساس بالجودة",
  },
  {
    icon: Smartphone,
    title: "تجربة رقمية",
    description: "منيو رقمي ومساحة تفاعلية بين يديك",
  },
  {
    icon: Armchair,
    title: "مكان مريح",
    description: "أجواء هادئة تناسب العمل واللقاءات",
  },
];

export const quotes = [
  "القهوة ليست مجرد مشروب، إنها لحظة هدوء.",
  "ابدأ يومك بابتسامة وفنجان قهوة.",
  "كل لحظة جميلة تبدأ بقهوة.",
  "خذ استراحة، واستمتع بلحظتك.",
  "في فنجان القهوة، نجد أنفسنا.",
  "القهوة هي لغة الحب التي يفهمها الجميع.",
  "لحظة قهوة، وعالم من السكينة.",
  "الصباح الجميل يبدأ برائحة القهوة.",
];

export const aboutText =
  "لافازا مقهى عصري يجمع بين أصالة القهوة جمال الحلويات وتجربة رقمية متكاملة. نؤمن بأن كل صنف يحمل قصة، وكل زيارة تستحق أن تكون لحظة مميزة.";

export const contactInfo = {
  address: "ترهونة, ليبيا",
  hours: "يومياً · 8:00 ص – 11:00 م",
  phone: "+218 91 000 0000",
  social: [
    { label: "Instagram", href: "https://instagram.com" },
    { label: "Facebook", href: "https://facebook.com" },
  ],
};

export const footerLinks = [
  { label: "المنيو", href: "/menu" },
  { label: "مساحة لافازا", href: "/mood-space" },
  { label: "الاقتباسات", href: "#quote" },
  { label: "تواصل", href: "#contact" },
];
