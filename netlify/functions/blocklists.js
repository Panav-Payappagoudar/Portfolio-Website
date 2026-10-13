// Bundled offline blocklists to eliminate runtime cold-start dependencies on external URLs

export const DISPOSABLE_DOMAINS = new Set([
  '0-mail.com', '10minutemail.com', '10minutemail.net', '20minutemail.com', '33mail.com',
  'anonaddy.com', 'anonymbox.com', 'bouncr.com', 'burnermail.io', 'cachedot.net',
  'crazymailing.com', 'curryrasen.de', 'dispostable.com', 'dropmail.me', 'fakemailgenerator.com',
  'generator.email', 'getairmail.com', 'getnada.com', 'gishpuppy.com', 'guerrillamail.biz',
  'guerrillamail.block', 'guerrillamail.com', 'guerrillamail.de', 'guerrillamail.info',
  'guerrillamail.net', 'guerrillamail.org', 'harakirimail.com', 'inboxkitten.com',
  'incognitoid.com', 'instantemailaddress.com', 'maildrop.cc', 'mailforspam.com',
  'mailinator.com', 'mailinator.net', 'mailinator2.com', 'mailnesia.com', 'mailnull.com',
  'mohmal.com', 'mytemp.email', 'nada.ltd', 'nada.email', 'nowmymail.com',
  'sharklasers.com', 'spam4.me', 'spambog.com', 'spambox.us', 'spamfree24.org',
  'spamgourmet.com', 'temp-mail.org', 'temp-mail.ru', 'tempail.com', 'tempinbox.com',
  'tempmail.com', 'tempmail.net', 'tempmailaddress.com', 'throwawaymail.com',
  'trashmail.com', 'trashmail.net', 'trashmail.org', 'yopmail.com', 'yopmail.fr',
  'yopmail.net', 'zippymail.info'
]);

export const BAD_WORDS = new Set([
  'fuck', 'shit', 'bitch', 'asshole', 'cunt', 'slut', 'dick', 'pussy',
  'faggot', 'nigger', 'nigga', 'whore', 'bastard', 'motherfucker'
]);

export function isDisposableDomain(domain) {
  if (!domain || typeof domain !== 'string') return false;
  return DISPOSABLE_DOMAINS.has(domain.toLowerCase().trim());
}

export function isProfaneText(text) {
  if (!text || typeof text !== 'string') return false;
  const words = text.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/);
  return words.some(word => BAD_WORDS.has(word));
}
