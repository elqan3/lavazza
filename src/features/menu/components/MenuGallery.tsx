"use client";

import { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";

import { menus } from "@/features/menu/data";
import MenuCard from "./MenuCard";

const slides = menus.map((src) => ({ src }));

export default function MenuGallery() {
  const [index, setIndex] = useState(-1);

  return (
    <>
      <section className="py-6">
        <div className="max-w-md mx-auto px-4 space-y-6">
          {menus.map((image, idx) => (
            <MenuCard
              key={image}
              image={image}
              index={idx}
              onClick={() => setIndex(idx)}
            />
          ))}
        </div>
      </section>

      <Lightbox
        open={index >= 0}
        index={index}
        close={() => setIndex(-1)}
        slides={slides}
        plugins={[Zoom]}
        zoom={{
          maxZoomPixelRatio: 3,
          zoomInMultiplier: 1.5,
          doubleTapDelay: 300,
        }}
      />
    </>
  );
}