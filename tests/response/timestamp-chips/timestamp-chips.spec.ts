import * as http from 'http';
import path from 'path';
import { AddressInfo } from 'net';
import { test, expect } from '../../../playwright';
import { buildCommonLocators, openRequest, sendRequest, waitForReadyPage } from '../../utils/page';
import { initBruCollection, writeBruRequest } from '../../utils/fixtures/bru-collection';

const COLLECTION_NAME = 'timestamp-chips-collection';

const RESPONSES: Record<string, string> = {
  '/with-times': JSON.stringify({ orderId: 'A-1042', createdAt: '2026-10-26T06:30:00Z', deliveredAt: '2026-10-26T20:00:00.250+00:00', note: 'due 2026-10-27' }, null, 2),
  '/without-times': JSON.stringify({ id: 1, due: '2026-10-26', at: '2026-10-26T06:30:00' }, null, 2)
};

test.describe('Response timestamp chips', () => {
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
    const collectionDir = path.join(await createTmpDir('timestamp-chips'), COLLECTION_NAME);
    initBruCollection(collectionDir, COLLECTION_NAME);
    Object.entries(requests).forEach(([name, endpoint], index) => {
      writeBruRequest(collectionDir, name, { seq: index + 1, url: `${apiUrl}${endpoint}` });
    });

    const app = await launchElectronApp({
      initUserDataPath: path.join(__dirname, 'init-user-data'),
      templateVars: { collectionPath: collectionDir.split(path.sep).join('/') },
      // The chips use the system zone, so pin it to get a fixed expectation
      dotEnv: { TZ: 'Asia/Kolkata' }
    });
    const page = await waitForReadyPage(app);
    return { page, locators: buildCommonLocators(page).responseTimestampChips };
  };

  test('shows the local time after each timestamp without changing the response', async ({ launchElectronApp, createTmpDir }) => {
    const { page, locators } = await launchWithRequests({ launchElectronApp, createTmpDir }, { 'with-times': '/with-times' });

    await openRequest(page, COLLECTION_NAME, 'with-times');
    await sendRequest(page, 200);

    await test.step('One chip per timestamp, in the system zone', async () => {
      await expect(locators.chips()).toHaveCount(2);
      await expect(locators.chips().nth(0)).toContainText('26 Oct 12:00:00 +05:30');
      await expect(locators.chips().nth(1)).toContainText('27 Oct 01:30:00 +05:30');
    });

    await test.step('The response text keeps its original values', async () => {
      const text = await locators.editorText();
      expect(text).toContain('"createdAt": "2026-10-26T06:30:00Z"');
      expect(text).toContain('"deliveredAt": "2026-10-26T20:00:00.250+00:00"');
      expect(text).not.toContain('12:00:00');
    });
  });

  test('can be hidden and shown again', async ({ launchElectronApp, createTmpDir }) => {
    const { page, locators } = await launchWithRequests({ launchElectronApp, createTmpDir }, { 'with-times': '/with-times' });

    await openRequest(page, COLLECTION_NAME, 'with-times');
    await sendRequest(page, 200);
    await expect(locators.chips()).toHaveCount(2);

    await locators.toggle().click();
    await expect(locators.chips()).toHaveCount(0);

    await locators.toggle().click();
    await expect(locators.chips()).toHaveCount(2);
  });

  test('offers no chips or toggle when the response has no timestamps with an offset', async ({ launchElectronApp, createTmpDir }) => {
    const { page, locators } = await launchWithRequests({ launchElectronApp, createTmpDir }, { 'without-times': '/without-times' });

    await openRequest(page, COLLECTION_NAME, 'without-times');
    await sendRequest(page, 200);

    await expect(locators.responseBody()).toBeVisible();
    await expect(locators.chips()).toHaveCount(0);
    await expect(locators.toggle()).toHaveCount(0);
  });
});
