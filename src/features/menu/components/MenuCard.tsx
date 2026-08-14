import Image from "next/image";

interface MenuCardProps {
  image: string;
  index: number;
  onClick: () => void;
}

export default function MenuCard({
  image,
  index,
  onClick,
}: MenuCardProps) {
  return (
    <article
      onClick={onClick}
      className="
        rounded-2xl
        overflow-hidden
        bg-white
        shadow-2xl
        ring-1
        ring-white/10
        transition-transform
        cursor-pointer
        active:scale-[0.98]
      "
    >
      <div className="flex items-center justify-between bg-lavaza-blue px-4 py-2.5">
        <span className="font-jakarta text-[10px] uppercase tracking-[0.2em] text-white/80">
          انقر للفتح والتكبير 🔍
        </span>

        <span className="font-jakarta bg-yellow-400 text-[#16284a] text-xs font-bold rounded-full px-3 py-0.5 shadow">
          {index + 1}
        </span>
      </div>

      <div className="relative w-full bg-white">
        <Image
          src={image}
          alt={`Lavaza Menu Page ${index + 1}`}
          width={800}
          height={1150}
          sizes="(max-width: 768px) 100vw, 450px"
          quality={90}
          loading={index === 0 ? "eager" : "lazy"}
          className="w-full h-auto object-contain block"
        />
      </div>
    </article>
  );
}