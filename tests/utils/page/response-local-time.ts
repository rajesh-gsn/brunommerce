import { Page } from '../../../playwright';

/**
 * Locators for the response pane's "show UTC times in local timezone" toggle.
 */
export const buildResponseLocalTimeLocators = (page: Page) => ({
  toggle: () => page.getByTestId('response-local-time-toggle'),
  responseBody: () => page.getByTestId('response-preview-container')
});
