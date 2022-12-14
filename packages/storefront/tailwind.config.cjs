const colors = require('tailwindcss/colors');
const chroma = require('chroma-js');
const getCMS = require('./storefront.cms.cjs');

// IntelliSense for UnoCSS icons
let defaultIcons = {
  brandIcons: 'brands',
  brandIconsShortcuts: [
    'facebook',
    'twitter',
    'instagram',
    'linkedin',
    'youtube',
    'google',
    'pinterest',
    'tiktok',
    'telegram',
    'whatsapp',
    'messenger',
    'pix',
  ],
  brandLogos: 'logos',
  brandLogosShortcuts: [
    'visa',
    'mastercard',
    'paypal',
    'apple-pay',
    'google-pay',
    'amex',
    'elo',
    'hipercard',
    'dinersclub',
  ],
  generalIcons: 'general',
};
if (globalThis.storefront_default_icons) {
  const deepmerge = require('@fastify/deepmerge')();
  defaultIcons = deepmerge(defaultIcons, globalThis.storefront_default_icons);
}

const { primaryColor, secondaryColor } = getCMS();
const brandColors = {
  primary: primaryColor,
  secondary: secondaryColor || primaryColor,
  ...globalThis.storefront_brand_colors,
};
const brandColorsPalletes = {};
const onBrandColors = {};
Object.keys(brandColors).forEach((colorName) => {
  const hex = brandColors[colorName];
  const color = chroma(hex);
  let subtle;
  let bold;
  if (color.luminance() >= 0.1) {
    subtle = chroma(hex).brighten(1.5);
    bold = chroma(hex).darken(1.5);
  } else {
    subtle = chroma(hex).darken();
    bold = chroma(hex).brighten();
  }
  const pallete = {
    subtle: subtle.css(),
    DEFAULT: color.css(),
    bold: bold.css(),
  };
  const scale = chroma.scale([
    chroma(hex).luminance(0.95), // 50
    chroma(hex).luminance(0.84), // 100
    chroma(hex).luminance(0.73), // 200
    chroma(hex).luminance(0.62), // 300
    chroma(hex).luminance(0.49), // 400
    chroma(hex).luminance(0.35), // 500
    chroma(hex).luminance(0.23), // 600
    chroma(hex).luminance(0.15), // 700
    chroma(hex).luminance(0.10), // 800
    chroma(hex).luminance(0.05), // 900
  ]).colors(10);
  scale.forEach((sHex, index) => {
    const palleteIndex = index === 0 ? '50' : (100 * index).toString();
    pallete[palleteIndex] = chroma(sHex).css();
  });
  brandColorsPalletes[colorName] = pallete;
  const colorVariants = { color, subtle, bold };
  Object.keys(colorVariants).forEach((tone) => {
    const label = tone === 'color' ? colorName : `${colorName}-${tone}`;
    const lightness = colorVariants[tone].get('lab.l');
    if (lightness > 90) {
      onBrandColors[label] = pallete['800'];
    } else if (lightness > 75) {
      onBrandColors[label] = pallete['900'];
    } else {
      onBrandColors[label] = `var(--c-on-${(lightness > 60 ? 'light' : 'dark')})`;
    }
  });
});

const genTailwindConfig = ({
  brandIcons = defaultIcons.brandIcons,
  brandIconsShortcuts = defaultIcons.brandIconsShortcuts,
  brandLogos = defaultIcons.brandLogos,
  brandLogosShortcuts = defaultIcons.brandLogosShortcuts,
  generalIcons = defaultIcons.generalIcons,
  baseColor = 'slate',
  successColor = 'emerald',
  warningColor = 'amber',
  dangerColor = 'rose',
} = {}) => {
  const config = {
    theme: {
      extend: {
        colors: {
          ...brandColorsPalletes,
          on: onBrandColors,
          base: typeof baseColor === 'string' ? colors[baseColor] : baseColor,
          success: typeof successColor === 'string' ? colors[successColor] : successColor,
          warning: typeof warningColor === 'string' ? colors[warningColor] : warningColor,
          danger: typeof dangerColor === 'string' ? colors[dangerColor] : dangerColor,
        },
        fontFamily: {
          sans: ['var(--font-sans)'],
          mono: ['var(--font-mono)'],
        },
      },
    },
    plugins: [
      ({ addUtilities }) => {
        addUtilities({
          ...Object.keys(onBrandColors).reduce((utilities, colorLabel) => {
            const [colorName, tone] = colorLabel.split('-');
            const textColor = onBrandColors[colorLabel];
            const backgroundColor = brandColorsPalletes[colorName][tone || 'DEFAULT'];
            utilities[`.${colorLabel}`] = {
              'background-color': `var(--c-${colorLabel}, ${backgroundColor})`,
              color: `var(--c-on-${colorLabel}, ${textColor})`,
            };
            return utilities;
          }, {}),
          ...[{
            iconset: generalIcons,
          }, {
            iconset: brandIcons,
            shortcuts: brandIconsShortcuts,
          }, {
            iconset: brandLogos,
            shortcuts: brandLogosShortcuts,
          }].reduce((utilities, { iconset, shortcuts }) => {
            if (iconset) {
              if (!shortcuts) {
                const { icons } = require(`@iconify-json/${iconset}`);
                shortcuts = Object.keys(icons.icons);
                if (!shortcuts.includes('shopping-cart')) {
                  shortcuts.push('shopping-cart');
                }
              }
              shortcuts.forEach((shortcut) => {
                if (typeof shortcut === 'string') {
                  utilities[`.i-${shortcut}`] = {
                    '--iconify': iconset,
                    '--icon': `"${shortcut}"`,
                  };
                } else {
                  utilities[`.i-${shortcut[0]}`] = {
                    '--iconify': iconset,
                    '--icon': `"${shortcut[1]}"`,
                  };
                }
              });
            }
            return utilities;
          }, {}),
        });
      },
    ],
  };
  return config;
};

const tailwindConfig = genTailwindConfig();

module.exports = {
  ...tailwindConfig,
  genTailwindConfig,
  defaultIcons,
  brandColors,
  brandColorsPalletes,
  onBrandColors,
};
