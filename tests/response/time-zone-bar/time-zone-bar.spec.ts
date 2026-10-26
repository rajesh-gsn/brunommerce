import * as http from 'http';
import path from 'path';
import { AddressInfo } from 'net';
import { test, expect } from '../../../playwright';
import { buildCommonLocators, openRequest, sendRequest, waitForReadyPage } from '../../utils/page';
import { initBruCollection, writeBruRequest } from '../../utils/fixtures/bru-collection';

const COLLECTION_NAME = 'time-zone-collection';

const RESPONSES: Record<string, string> = {
  '/with-times': JSON.stringify({ orderId: 'A-1042', createdAt: '2026-10-26T06:30:00Z', deliveredAt: '2026-10-26T20:00:00.250+00:00' }, null, 2),
  '/without-times': JSON.stringify({ id: 1, due: '2026-10-26', at: '2026-10-26T06:30:00' }, null, 2)
};

test.describe('Response time zone bar', () => {
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
    const collectionDir = path.join(await createTmpDir('time-zone'), COLLECTION_NAME);
    initBruCollection(collectionDir, COLLECTION_NAME);
    Object.entries(requests).forEach(([name, endpoint], index) => {
      writeBruRequest(collectionDir, name, { seq: index + 1, url: `${apiUrl}${endpoint}` });
    });

    const app = await launchElectronApp({
      initUserDataPath: path.join(__dirname, 'init-user-data'),
      templateVars: { collectionPath: collectionDir.split(path.sep).join('/') },
      // The system zone is the bar's default, so pin it to get a fixed expectation
      dotEnv: { TZ: 'Asia/Kolkata' }
    });
    const page = await waitForReadyPage(app);
    return { page, locators: buildCommonLocators(page).responseTimeZone };
  };

  test('shows a selected timestamp in the system time zone without changing the response', async ({ launchElectronApp, createTmpDir }) => {
    const { page, locators } = await launchWithRequests({ launchElectronApp, createTmpDir }, { 'with-times': '/with-times' });

    await openRequest(page, COLLECTION_NAME, 'with-times');
    await sendRequest(page, 200);

    await test.step('The bar invites a selection and shows the response date', async () => {
      await expect(locators.bar()).toBeVisible();
      await expect(locators.selected()).toContainText('Select a timestamp');
      await expect(locators.responseDate()).toContainText('(UTC+05:30)');
    });

    await test.step('Selecting a line with a timestamp shows it in local time', async () => {
      await locators.editorLine('createdAt').click({ clickCount: 3 });
      await expect(locators.selected()).toContainText('Mon 26 Oct 2026, 12:00:00 (UTC+05:30)');
    });

    await test.step('A timestamp with an offset and fraction works too', async () => {
      await locators.editorLine('deliveredAt').click({ clickCount: 3 });
      await expect(locators.selected()).toContainText('Tue 27 Oct 2026, 01:30:00 (UTC+05:30)');
    });

    await test.step('The response text keeps its original UTC values', async () => {
      await expect(locators.responseBody()).toContainText('2026-10-26T06:30:00Z');
      await expect(locators.responseBody()).not.toContainText('12:00:00');
    });
  });

  test('offers no bar when the response has no timestamps with an offset', async ({ launchElectronApp, createTmpDir }) => {
    const { page, locators } = await launchWithRequests({ launchElectronApp, createTmpDir }, { 'without-times': '/without-times' });

    await openRequest(page, COLLECTION_NAME, 'without-times');
    await sendRequest(page, 200);

    await expect(locators.responseBody()).toBeVisible();
    await expect(locators.bar()).toHaveCount(0);
  });

  test('converts to the zone chosen in the bar', async ({ launchElectronApp, createTmpDir }) => {
    const { page, locators } = await launchWithRequests({ launchElectronApp, createTmpDir }, { 'with-times': '/with-times' });

    await openRequest(page, COLLECTION_NAME, 'with-times');
    await sendRequest(page, 200);
    await locators.editorLine('createdAt').click({ clickCount: 3 });
    await expect(locators.selected()).toContainText('(UTC+05:30)');

    await locators.zoneSelect().click();
    await page.getByRole('option', { name: 'America/New_York', exact: true }).click();

    await expect(locators.selected()).toContainText('Mon 26 Oct 2026, 02:30:00 (UTC-04:00)');
  });
});
