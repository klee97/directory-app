'use client';

import Image from 'next/image';

export default function ContentfulImage(props) {
  const contentfulLoader = ({ src, width, quality }) => {
    return `${src}?w=${width}&q=${quality || 75}`;
  };

  return <Image loader={contentfulLoader} objectFit='cover' {...props} />;
}