import { Page } from '@playwright/test';

// Stub the reCAPTCHA script so the widget resolves with 'test-bypass'.
// verifyRecaptchaToken() accepts this token in dev/preview without
// calling Google's siteverify API.
//
// react-google-recaptcha doesn't use execute()'s return value — it passes
// a `callback` to render() and waits for that to be called with a token.
// Our mock captures that callback and invokes it inside execute().
const RECAPTCHA_MOCK_SCRIPT = `
  window.grecaptcha = {
    ready: function(cb) { setTimeout(cb, 0); },
    render: function(container, params) {
      window.__rcCallback = params && params.callback;
      return 0;
    },
    execute: function() {
      if (window.__rcCallback) window.__rcCallback('test-bypass');
    },
    reset: function() {},
    getResponse: function() { return 'test-bypass'; }
  };
`;


export async function mockRecaptcha(page: Page) {
  await page.route('https://www.google.com/recaptcha/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/javascript',
      body: RECAPTCHA_MOCK_SCRIPT,
    })
  );
}