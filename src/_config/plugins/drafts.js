export const drafts = eleventyConfig => {
  eleventyConfig.addPreprocessor("drafts", "*", (data, _) => {
    if (data.draft && isProductionBuild()) {
      return false;
    }
  });
};

function isProductionBuild() {
  return process.env.ELEVENTY_ENV === 'production'
    && process.env.ELEVENTY_RUN_MODE === 'build';
}