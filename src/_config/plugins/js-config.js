import esbuild from 'esbuild';

export const jsConfig = eleventyConfig => {
  eleventyConfig.addTemplateFormats('js');

  eleventyConfig.addExtension('js', {
    outputFileExtension: 'js',
    compile: async (_, inputPath) => {
      if (!(inputPath || '').startsWith('./src/assets/scripts/')) {
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