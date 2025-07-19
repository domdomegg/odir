import { test, expect, beforeEach, vi } from 'vitest';
import { SendEmailCommand } from '@aws-sdk/client-sesv2';
import { sendEmail } from './email';
import renderHtml from './email/renderHtml';

vi.unmock('./email');

const send = vi.fn();
vi.mock('@aws-sdk/client-sesv2', () => ({
  SESv2Client: vi.fn().mockImplementation(() => ({ get send() { return send; } })),
  SendEmailCommand: vi.fn(),
}));

beforeEach(() => {
  (SendEmailCommand as unknown as vi.Mock).mockImplementation((input) => ({ _input: input }));
});

test('sendEmail calls SES correctly', async () => {
  // given no calls to the send endpoint
  expect(send).not.toHaveBeenCalled();

  // when we send an email
  await sendEmail(
    'This is the subject',
    renderHtml`<!doctype html><html><body>Hello</body></html>`,
    'test@adamjones.me',
  );

  // then the command is built and sent
  expect(send).toHaveBeenCalledWith({
    _input: {
      Content: {
        Simple: {
          Body: {
            Html: {
              Charset: 'UTF-8',
              Data: '<!doctype html><html><body>Hello</body></html>',
            },
          },
          Subject: {
            Data: 'This is the subject',
          },
        },
      },
      Destination: {
        ToAddresses: ['test@adamjones.me'],
      },
      FromEmailAddress: '"Directory Navigator" <hi@directory.adamjones.me>',
    },
  });
});
