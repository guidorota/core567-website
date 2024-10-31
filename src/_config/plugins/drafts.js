import path from 'node:path';

export const drafts = eleventyConfig => {
  eleventyConfig.addPreprocessor("drafts", "*", (data, _) => {
    if (isDraft(data) && isProductionBuild()) {
      return false;
    }
  });
};

function isProductionBuild() {
  return process.env.ELEVENTY_ENV === 'production'
    && process.env.ELEVENTY_RUN_MODE === 'build';
}

function isDraft(data) {
  return data.draft
    || path.parse(data.page.inputPath).name.startsWith('draft');
}