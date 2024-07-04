import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Blog of Jcyuyi',
  tagline: 'Learn, practice and build',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://jcyuyi.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'jcyuyi', // Usually your GitHub org/user name.
  projectName: 'blog', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'zh-Hans',
    locales: ['zh-Hans'],
  },

  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: false, // Optional: disable the docs plugin
        blog: {
          routeBasePath: '/', // Serve the blog at the site's root
          blogSidebarTitle: 'All posts',
          blogSidebarCount: 'ALL',
        },
        theme: {
          customCss: ['./src/css/custom.css', './src/css/custom-color.css'],
        },
      },
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/android-chrome-384x384.png',
    navbar: {
      title: 'Blog of Jcyuyi',
      logo: {
        alt: 'Blog of Jcyuyi Logo',
        src: 'img/android-chrome-192x192.png',
      },
      items: [],
    },
    footer: {
      style: 'light',
      links: [],
      copyright: `Blog of Jcyuyi. Copyright © ${new Date().getFullYear()} CC BY-SA 3.0. Built with <a href='https://docusaurus.io/'>Docusaurus</a>.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
