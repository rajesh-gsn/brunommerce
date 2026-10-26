import { Page } from '../../../playwright';

/**
 * Locators for the local-time chips shown after timestamps in the response editor.
 */
export const buildResponseTimestampChipsLocators = (page: Page) => {
  const responseBody = () => page.getByTestId('response-preview-container');

  return {
    toggle: () => page.getByTestId('response-timestamp-chips-toggle'),
    chips: () => responseBody().locator('.timestamp-chip'),
    responseBody,
    /** The response text as the editor holds it, without the chips drawn beside it */
    editorText: () => responseBody().locator('.CodeMirror').evaluate((element: any) => element.CodeMirror.getValue() as string)
  };
};
