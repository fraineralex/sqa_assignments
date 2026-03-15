import path from 'node:path';

export const config = {
  runner: 'local',
  specs: ['./test/specs/**/*.spec.ts'],
  exclude: [],
  maxInstances: 1,
  capabilities: [
    {
      platformName: 'Android',
      'appium:automationName': 'UiAutomator2',
      'appium:deviceName': 'Pixel_7_API_34',
      'appium:platformVersion': '14.0',
      'appium:app': path.join(process.cwd(), 'apps', 'Android-MyDemoAppRN.apk'),
      'appium:appPackage': 'com.saucelabs.mydemoapp.rn',
      'appium:appActivity': 'com.saucelabs.mydemoapp.rn.MainActivity',
      'appium:noReset': false,
      'appium:newCommandTimeout': 240
    }
  ],
  logLevel: 'info',
  bail: 0,
  baseUrl: '',
  waitforTimeout: 10000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,
  services: [
    ['appium', {
      command: 'appium'
    }]
  ],
  framework: 'mocha',
  reporters: ['spec'],
  mochaOpts: {
    ui: 'bdd',
    timeout: 60000,
    require: ['ts-node/register']
  }
};
