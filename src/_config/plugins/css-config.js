import postcss from 'postcss';
import postcssImport from 'postcss-import';
import postcssImportExtGlob from 'postcss-import-ext-glob';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';

export const cssConfig = eleventyConfig => {
  eleventyConfig.addTemplateFormats('css');
  eleventyConfig.addExtension('css', {
    outputFileExtension: 'css',
    compile: async (content, inputPath) => {
      if (!(inputPath || '').startsWith('./src/assets/css/')) {
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
