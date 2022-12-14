const { join: joinPath } = require('path');

const {
  defineConfig,
  presetUno,
  presetIcons,
  transformerCompileClass,
  transformerDirectives,
} = require('unocss');

const {
  genTailwindConfig,
  defaultIcons,
  brandColors,
  brandColorsPalletes,
  onBrandColors,
} = require(joinPath(process.cwd(), 'tailwind.config.cjs'));

const colorCSSVars = {};
Object.keys(brandColors).forEach((colorName) => {
  Object.keys(brandColorsPalletes[colorName]).forEach((tone) => {
    const colorLabel = tone === 'DEFAULT' ? colorName : `${colorName}-${tone}`;
    colorCSSVars[colorLabel] = brandColorsPalletes[colorName][tone];
  });
});
Object.keys(onBrandColors).forEach((colorLabel) => {
  const rgb = onBrandColors[colorLabel];
  const [colorName] = colorLabel.split('-');
  const colorCSSVar = Object.keys(colorCSSVars).find((varName) => {
    return colorCSSVars[varName] === rgb && new RegExp(`${colorName}-\\d`).test(varName);
  });
  colorCSSVars[`on-${colorLabel}`] = colorCSSVar ? `var(--c-${colorCSSVar})` : rgb;
});

const genUnoCSSConfig = ({
  brandIcons = defaultIcons.brandIcons,
  brandIconsShortcuts = defaultIcons.brandIconsShortcuts,
  brandLogos = defaultIcons.brandLogos,
  brandLogosShortcuts = defaultIcons.brandLogosShortcuts,
  generalIcons = defaultIcons.generalIcons,
  shoppingCartIcon = 'shopping-bag',
  preflights = [{
    getCSS: () => {
      const strCSSVars = Object.entries(colorCSSVars)
        .map(([varName, value]) => `--c-${varName}:${value};`)
        .join(' ');
      return `:root { ${strCSSVars} }`;
    },
  }],
} = {}) => {
  const tailwindConfig = genTailwindConfig();
  const rules = [];
  tailwindConfig.plugins?.forEach((plugin) => {
    plugin({
      addUtilities: (utilities) => {
        Object.keys(utilities).forEach((selector) => {
          // Skip icons selectors added on tailwind.config.cjs only for IntelliSense
          if (!selector.startsWith('.i-')) {
            rules.push([selector.replace('.', ''), utilities[selector]]);
          }
        });
      },
    });
  });
  const theme = tailwindConfig.theme.extend;
  return {
    preflights,
    rules,
    shortcuts: [
      ...brandIconsShortcuts.map((brand) => {
        return typeof brand === 'string'
          ? { [`i-${brand}`]: `i-${brandIcons}:${brand}` }
          : { [`i-${brand[0]}`]: `i-${brandIcons}:${brand[1]}` };
      }),
      ...brandLogosShortcuts.map((brand) => {
        return typeof brand === 'string'
          ? { [`i-${brand}`]: `i-${brandLogos}:${brand}` }
          : { [`i-${brand[0]}`]: `i-${brandLogos}:${brand[1]}` };
      }),
      { 'i-shopping-cart': `i-${generalIcons}:${shoppingCartIcon}` },
      [/^i-([^:]+)$/, ([, icon]) => `i-${generalIcons}:${icon}`],
    ],
    theme: {
      ...theme,
      colors: {
        ...theme.colors,
        // Generate runtime themeable brand colors utilities with CSS vars
        ...Object.keys(brandColors).reduce((colors, colorName) => {
          colors[colorName] = {};
          Object.keys(brandColorsPalletes[colorName]).forEach((tone) => {
            const colorLabel = tone === 'DEFAULT' ? colorName : `${colorName}-${tone}`;
            colors[colorName][tone] = `var(--c-${colorLabel})`;
          });
          return colors;
        }, {}),
        on: Object.keys(onBrandColors).reduce((onColors, colorLabel) => {
          return {
            ...onColors,
            colorLabel: `var(--c-on-${colorLabel})`,
          };
        }, {}),
      },
    },
    transformers: [
      transformerDirectives(),
      transformerCompileClass(),
    ],
    presets: [
      presetUno(),
      presetIcons({
        extraProperties: {
          display: 'inline-block',
          'vertical-align': 'middle',
        },
      }),
    ],
  };
};

const unoCSSConfig = genUnoCSSConfig();

exports.default = defineConfig(unoCSSConfig);

exports.genUnoCSSConfig = genUnoCSSConfig;
exports.unoCSSConfig = unoCSSConfig;
exports.colorCSSVars = colorCSSVars;
