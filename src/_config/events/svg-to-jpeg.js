import {promises as fsPromises, existsSync} from 'node:fs';
import path from 'node:path';
import Image from '@11ty/eleventy-img';

const opengraphPreviewImagesDir = 'dist/assets/og-images/';

export const svgToJpeg = async function () {

  if (!existsSync(opengraphPreviewImagesDir)) {
    console.log('No OpenGraph images dist directory found');
    return;
  }

  const files = await fsPromises.readdir(opengraphPreviewImagesDir);
  if (files.length == 0) {
    console.log('No images found on OG images dir');
    return;
  }

  files.forEach(async function (filename) {
    const imageUrl = opengraphPreviewImagesDir + filename;
    await Image(imageUrl, {
      formats: ['jpeg'],
      outputDir: opengraphPreviewImagesDir,
      filenameFormat: function (id, src, width, format, options) {
        return `${path.parse(src).name}.${format}`;
      }
    });
  });
};
