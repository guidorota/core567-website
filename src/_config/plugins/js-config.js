import esbuild from 'esbuild';
import * as path from 'path';

export const jsConfig = eleventyConfig => {
  eleventyConfig.addTemplateFormats('js');

  eleventyConfig.addExtension('js', {
    outputFileExtension: 'js',
    compile: async (_, inputPath) => {
      const sanitisedInputPath = inputPath || '';
      if (!sanitisedInputPath.startsWith('./src/assets/scripts/')) {
        return;
      }

      if (path.basename(sanitisedInputPath).startsWith('_')) {
        return;
      }

      return async () => {
        let output = await esbuild.build({
          target: 'es2020',
          entryPoints: [inputPath],
          bundle: true,
          minify: true,
          write: false
        });

        return output.outputFiles[0].text;
      };
    }
  });
};