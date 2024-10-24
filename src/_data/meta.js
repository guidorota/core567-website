export const url = process.env.URL || 'http://localhost:8080';
export const siteName = 'Core 567';
export const siteDescription = 'Thoughts and rants about engineering and life';
export const siteType = 'Person'; // schema
export const locale = 'en_EN';
export const lang = 'en';
export const author = {
  name: 'Guido Rota',
  avatar: '/icon-512x512.png' // path to the author's avatar. In this case just using a favicon.
};
export const creator = {
  name: 'Guido Rota',
  email: 'hello@core567.com',
  social: 'https://x.com/guidorota'
};
export const social = {
  github: 'https://github.com/guidorota/',
  x: 'https://x.com/guidorota',
  linkedin: 'https://www.linkedin.com/in/guido-rota-0704b480/'
};
export const pathToSvgLogo = 'src/assets/svg/master-logo.svg'; // used for favicon generation
export const themeColor = '#2465BC'; //  Manifest: defines the default theme color for the application
export const themeBgColor = '#FBFBFB'; // Manifest: defines a placeholder background color for the application page to display before its stylesheet is loaded
export const opengraph_default = '/assets/images/template/opengraph-default.jpg'; // fallback/default meta image
export const opengraph_default_alt = "Visible content: Core 567"; // alt text for default meta image"
export const blog = {
  // RSS feed
  name: 'Core 567',
  description: 'Thoughts and rants about engineering and life',
  // feed links are looped over in the head. You may add more to the array.
  feedLinks: [
    {
      title: 'Atom Feed',
      url: '/feed.xml',
      type: 'application/atom+xml'
    },
    {
      title: 'JSON Feed',
      url: '/feed.json',
      type: 'application/json'
    }
  ],
  // Tags
  tagSingle: 'Tag',
  tagPlural: 'Tags',
  tagMore: 'More tags:',
  // pagination
  paginationLabel: 'Blog',
  paginationPage: 'Page',
  paginationPrevious: 'Previous',
  paginationNext: 'Next',
  paginationNumbers: true
};
export const details = {
  aria: 'section controls',
  expand: 'expand all',
  collapse: 'collapse all'
};
export const navigation = {
  navLabel: 'Menu',
  ariaTop: 'Main',
  ariaBottom: 'Complementary',
  ariaPlatforms: 'Platforms',
  drawerNav: false
};
