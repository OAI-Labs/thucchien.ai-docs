import {lightCodeTheme, darkCodeTheme} from './src/utils/prismTheme';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'AI Thực Chiến',
  tagline: 'Hướng dẫn sử dụng AI APIs trong cuộc thi AI thực chiến',
  favicon: 'img/favicon.png',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://docs.thucchien.ai',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'OAI-Labs', // Usually your GitHub org/user name.
  projectName: 'thucchien.ai-docs', // Usually your repo name.
  deploymentBranch: 'gh-pages', // The branch to deploy to.

  trailingSlash: false, // Remove trailing slash from URLs
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'vn',
    locales: ['vn'],
  },

  // Cho phép vẽ diagram bằng khối ```mermaid trong tài liệu.
  markdown: {
    mermaid: true,
  },
  themes: ['@docusaurus/theme-mermaid'],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: 'docs',
          // Tạm ẩn vòng Bán Kết / Chung Kết; xoá dòng này để hiện lại.
          exclude: ['round-3/**', 'round-4/**'],
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          // editUrl:
          //   'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          // editUrl:
          //   'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/thucchien-social-card.png',
    docs: {
      sidebar: {
        hideable: true,
        // autoCollapseCategories: true,
      },
    },
    navbar: {
      // hideOnScroll: true,
      title: 'AI Thực Chiến',
      logo: {
        alt: 'AI Thực Chiến Logo',
        src: 'img/logo.svg',
        href: '/',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'right',
          label: '📄 Tài liệu',
          href: '/docs/round-2',
        },
        // {
        //   to: '/tools/suno-login-guidelines',
        //   position: 'right',
        //   label: '🎵 Suno',
        // },
        // {
        //   href: 'https://github.com/facebook/docusaurus',
        //   label: 'GitHub',
        //   position: 'right',
        // },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Tài liệu',
          items: [
            {
              label: 'Giới thiệu',
              to: '/',
            },
            {
              label: 'Tài liệu vòng Chung Khảo',
              to: '/docs/round-2',
            },

          ],
        },
        {
          title: 'Liên kết',
          items: [
            {
              label: 'Thông tin AI Thực Chiến',
              href: 'https://thucchien.ai',
            },
            { label: "Thể lệ cuộc thi", 
              href: 'https://thucchien.ai/the-le-cuoc-thi/' 
            },
            {
              label: "Đăng ký dự thi",
              href: "https://thucchien.ai/#registration"
            }
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Tài liệu AI Thực Chiến.`,
    },
    prism: {
      theme: lightCodeTheme,
      darkTheme: darkCodeTheme,
      additionalLanguages: ['bash', 'diff', 'json'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
