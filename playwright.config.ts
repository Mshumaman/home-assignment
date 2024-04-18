import {defineConfig, devices} from '@playwright/test';
import {AIRBNB_BASE_URL} from "./helpers/Environment";

export default defineConfig({
    timeout: 120000,
    testDir: './tests',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    reporter: [['html', {open: 'never'}],
        ['junit', {outputFile: 'results.xml'}]],

    projects: [
        {
            name: 'Google Chrome',
            use: {...devices['Desktop Chrome'], channel: 'chrome'},
        },
        // {
        //     name: 'Microsoft Edge',
        //     use: {...devices['Desktop Edge'], channel: 'msedge'},
        // },
        // {
        //     name: 'firefox',
        //     use: {...devices['Desktop Firefox']},
        // },
    ],
    use: {
        viewport: {width: 1920, height: 1080},
        trace: 'on-first-retry',
        screenshot: 'on',
        video: {
            mode: "retain-on-failure",
        },
        actionTimeout: 30000,
    },
});
