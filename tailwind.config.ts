import type { Config } from 'tailwindcss';
import daisyui from 'daisyui';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  daisyui: {
    themes: [
      {
        mytheme: {
          primary: '#08FC08',
          secondary: '#ED1E79',
          accent: '#4A154B',
          neutral: '#2B3440',
          'base-100': '#ffffff',
          info: '#2d8eff',
          success: '#13ce66',
          warning: '#ffcc3d',
          error: '#ff4949',
        },
      },
    ],
  },
  plugins: [daisyui],
};
export default config;
