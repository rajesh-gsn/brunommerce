import * as http from 'http';
import path from 'path';
import { AddressInfo } from 'net';
import { test, expect } from '../../../playwright';
import { buildCommonLocators, openRequest, sendRequest, waitForReadyPage } from '../../utils/page';
import { initBruCollection, writeBruRequest } from '../../utils/fixtures/bru-collection';

const COLLECTION_NAME = 'local-time-collection';

const RESPONSES: Record<string, string> = {
  '/with-times': JSON.stringify({ createdAt: '2026-10-26T06:30:00Z', updatedAt: '2026-10-26T20:00:00.250Z', note: 'due 2026-10-26' }),
  '/without-times': JSON.stringify({ id: 1, due: '2026-10-26', at: '2026-10-26T06:30:00+02:00' })
};

test.describe('Response local time', () => {
  let server: http.Server;
  let apiUrl: string;

  test.beforeEach(async () => {
    server = http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' }).end(RESPONSES[req.url || ''] ?? '{}');
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    apiUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  test.afterEach(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
      server.closeAllConnections();
    });
  });

  const launchWithRequests = async (
    { launchElectronApp, createTmpDir }: { launchElectronApp: any; createTmpDir: (tag?: string) => Promise<string> },
    requests: Record<string, string>
  ) => {
    const collectionDir = path.join(await createTmpDir('local-time'), COLLECTION_NAME);
    initBruCollection(collectionDir, COLLECTION_NAME);
    Object.entries(requests).forEach(([name, endpoint], index) => {
      writeBruRequest(collectionDir, name, { seq: index + 1, url: `${apiUrl}${endpoint}` });
    });

    const app = await launchElectronApp({
      initUserDataPath: path.join(__dirname, 'init-user-data'),
      templateVars: { collectionPath: collectionDir.split(path.sep).join('/') },
      // The renderer follows the machine's timezone, so pin it to get a fixed expectation
      dotEnv: { TZ: 'Asia/Kolkata' }
    });
    const page = await waitForReadyPage(app);
    return { page, locators: buildCommonLocators(page).responseLocalTime };
  };

  test('shows UTC timestamps in local time while on, and as sent when switched off', async ({ launchElectronApp, createTmpDir }) => {
    const { page, locators } = await launchWithRequests({ launchElectronApp, createTmpDir }, { 'with-times': '/with-times' });

    await openRequest(page, COLLECTION_NAME, 'with-times');
    await sendRequest(page, 200);

    await test.step('Shown as sent by default', async () => {
      await expect(locators.responseBody()).toContainText('2026-10-26T06:30:00Z');
    });

    await test.step('Switching on converts every timestamp and leaves other text alone', async () => {
      await locators.toggle().click();
      await expect(locators.responseBody()).toContainText('2026-10-26T12:00:00+05:30');
      await expect(locators.responseBody()).toContainText('2026-10-27T01:30:00.250+05:30');
      await expect(locators.responseBody()).toContainText('due 2026-10-26');
      await expect(locators.responseBody()).not.toContainText('06:30:00Z');
    });

    await test.step('Switching off restores the original text', async () => {
      await locators.toggle().click();
      await expect(locators.responseBody()).toContainText('2026-10-26T06:30:00Z');
    });
  });

  test('offers no toggle when the response has no UTC timestamps', async ({ launchElectronApp, createTmpDir }) => {
    const { page, locators } = await launchWithRequests({ launchElectronApp, createTmpDir }, { 'without-times': '/without-times' });

    await openRequest(page, COLLECTION_NAME, 'without-times');
    await sendRequest(page, 200);

    await expect(locators.responseBody()).toBeVisible();
    await expect(locators.toggle()).toHaveCount(0);
  });
});
