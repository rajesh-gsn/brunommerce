import { Page } from '../../../playwright';

/**
 * Locators for the time zone bar shown under a response that contains timestamps.
 */
export const buildResponseTimeZoneLocators = (page: Page) => ({
  bar: () => page.getByTestId('time-zone-bar'),
  zoneSelect: () => page.getByTestId('time-zone-select'),
  selected: () => page.getByTestId('time-zone-selected'),
  responseDate: () => page.getByTestId('time-zone-response-date'),
  responseBody: () => page.getByTestId('response-preview-container'),
  // A line of the response editor, found by its text
  editorLine: (text: string) => page.getByTestId('response-preview-container').locator('.CodeMirror-line').filter({ hasText: text })
});
