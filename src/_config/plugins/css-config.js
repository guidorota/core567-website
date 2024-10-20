import postcss from 'postcss';
import postcssImport from 'postcss-import';
import postcssImportExtGlob from 'postcss-import-ext-glob';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import * as path from 'path';

export const cssConfig = eleventyConfig => {
  eleventyConfig.addTemplateFormats('css');
  eleventyConfig.addExtension('css', {
    outputFileExtension: 'css',
    compile: async (content, inputPath) => {
      const sanitisedInputPath = inputPath || '';
      if (!sanitisedInputPath.startsWith('./src/assets/css/')) {
        return;
      }

      if (path.basename(sanitisedInputPath).startsWith('_')) {
        return;
      }

      return async () => {
        let result = await postcss([
          postcssImportExtGlob,
          postcssImport,
          tailwindcss,
          autoprefixer,
          cssnano
        ]).process(content, {
          from: inputPath,
          to: null
        });
      
        return result.css;
      };
    }
  });
};
