// Karma configuration para Angular 21 + @angular/build:karma
// ChromeHeadless + cobertura (HTML + lcov).
//
// Resolución del binario de Chrome en este orden:
//   1. La variable de entorno CHROME_BIN si está seteada.
//   2. El Chrome que descarga puppeteer con su `npm install`.
//   3. Karma intentará encontrar Chrome en el PATH del sistema.
//
// En macOS/Windows con Chrome instalado normalmente, la opción 3 funciona sin configurar nada.
// En CI es recomendable que puppeteer (ya en devDependencies) haga la descarga.

if (!process.env.CHROME_BIN) {
  try {
    process.env.CHROME_BIN = require('puppeteer').executablePath();
  } catch (e) {
    // si puppeteer no descargó su chrome, dejamos que karma-chrome-launcher lo busque en el sistema
  }
}

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage')
    ],
    client: {
      jasmine: {
        random: false,
        stopOnSpecFailure: false
      },
      clearContext: false
    },
    jasmineHtmlReporter: {
      suppressAll: true
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage/cms-obstetricia'),
      subdir: '.',
      reporters: [
        { type: 'html' },
        { type: 'text-summary' },
        { type: 'lcovonly' }
      ]
    },
    reporters: ['progress', 'kjhtml'],
    browsers: ['ChromeHeadlessCI'],
    customLaunchers: {
      ChromeHeadlessCI: {
        base: 'ChromeHeadless',
        flags: [
          '--no-sandbox',
          '--disable-gpu',
          '--disable-dev-shm-usage',
          '--headless=new'
        ]
      }
    },
    restartOnFileChange: true,
    singleRun: false
  });
};
