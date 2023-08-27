import confirmation from './confirmation';

test('renders email correctly with one payment', () => {
  // when we render the email
  const email = confirmation('Adam').string.replace(/\s+/g, ' ');

  // then we have expected data filled in
  expect(email).toContain('Dear Adam,');
});
