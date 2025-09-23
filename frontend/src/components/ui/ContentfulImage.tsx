'use client';

import { PlaceholderValue, OnLoadingComplete } from 'next/dist/shared/lib/get-img-props';
import Image from 'next/image';
import { JSX } from 'react';

export default function ContentfulImage(
  props: JSX.IntrinsicAttributes
    & Omit<React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>, "height" | "width" | "loading" | "ref" | "alt" | "src" | "srcSet"> & {
      src: string | import("next/dist/shared/lib/get-img-props").StaticImport;
      alt: string;
      width?: number | `${number}`;
      height?: number | `${number}`;
      fill?: boolean;
      loader?: import("next/dist/shared/lib/get-img-props").ImageLoader;
      quality?: number | `${number}`;
      priority?: boolean;
      loading?: "eager" | "lazy" | undefined;
      placeholder?: PlaceholderValue;
      blurDataURL?: string;
      unoptimized?: boolean;
      overrideSrc?: string;
      onLoadingComplete?: OnLoadingComplete;
      layout?: string;
      objectFit?: string;
      objectPosition?: string;
      lazyBoundary?: string;
      lazyRoot?: string;
    } & React.RefAttributes<HTMLImageElement | null>
) {
  const contentfulLoader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => {
    return `${src}?w=${width}&q=${quality || 90}&fm=webp`;
  };

  return (
    <Image loader={contentfulLoader} {...props} alt={props.alt} />
  );
}