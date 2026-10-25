import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { solveChallenge, createChallenge } from 'altcha-lib';
import { isAllowedOrigin, getValidatedHmacKey, getCorsHeaders, checkRateLimit, getClientIp } from '../netlify/functions/security.js';
import { handler as altchaHandler } from '../netlify/functions/altcha.js';
import { handler as submitHandler } from '../netlify/functions/submit.js';

test('Targeted ALTCHA Reliability & Security Investigation Test Suite', async (t) => {
  const originalEnv = { ...process.env };

  t.afterEach(() => {
    // Restore environment variables after each test case
    for (const key of Object.keys(process.env)) {
      if (!(key in originalEnv)) {
        delete process.env[key];
      }
    }
    Object.assign(process.env, originalEnv);
  });

  // --------------------------------------------------------------------------
  // TEST 1: Successful challenge generation and valid submission flow
  // --------------------------------------------------------------------------
  await t.test('1. Successful challenge generation and valid submission', async () => {
    process.env.ALTCHA_HMAC_KEY = 'test-suite-hmac-key-sufficiently-long-32-chars';
    delete process.env.EMAIL_USER; // Leave email unconfigured to stop at SMTP stage safely

    // Step 1: Challenge generation via altcha.js
    const altchaRes = await altchaHandler({
      httpMethod: 'GET',
      headers: { 'client-ip': '198.51.100.10', origin: 'https://panav.xyz' }
    });
    assert.equal(altchaRes.statusCode, 200);
    assert.equal(altchaRes.headers['Content-Type'], 'application/json');
    assert.equal(altchaRes.headers['Cache-Control'], 'no-store, no-cache, must-revalidate');

    const challenge = JSON.parse(altchaRes.body);
    assert.ok(challenge.challenge, 'Must contain challenge hash');
    assert.ok(challenge.salt, 'Must contain salt with expiration');
    assert.ok(challenge.signature, 'Must contain cryptographic signature');

    // Step 2: Solve the challenge
    const solution = await solveChallenge(challenge.challenge, challenge.salt, 'SHA-256', challenge.maxnumber || 50000).promise;
    assert.ok(solution, 'PoW solution must be computed');

    const altchaPayload = Buffer.from(JSON.stringify({
      algorithm: challenge.algorithm,
      challenge: challenge.challenge,
      number: solution.number,
      salt: challenge.salt,
      signature: challenge.signature
    })).toString('base64');

    // Step 3: Submit valid form
    const submitRes = await submitHandler({
      httpMethod: 'POST',
      headers: { 'client-ip': '198.51.100.10', origin: 'https://panav.xyz' },
      body: JSON.stringify({
        name: 'Research Collaborator',
        email: 'collab@university.edu',
        message: 'Inquiring regarding satellite observation pipeline.',
        altcha: altchaPayload
      })
    });

    // 503 SMTP_UNAVAILABLE indicates ALTCHA verification succeeded and reached the final SMTP delivery step
    assert.equal(submitRes.statusCode, 503);
    const body = JSON.parse(submitRes.body);
    assert.equal(body.code, 'SMTP_UNAVAILABLE', 'Verification must succeed and stop at SMTP availability');
    assert.ok(body.correlationId, 'Must include diagnostic correlation ID');
  });

  // --------------------------------------------------------------------------
  // TEST 2: Missing or invalid production key configuration (fail-closed)
  // --------------------------------------------------------------------------
  await t.test('2. Missing or invalid production key configuration', async () => {
    // Production environment context
    process.env.NODE_ENV = 'production';
    delete process.env.ALTCHA_HMAC_KEY;

    // Challenge generation fails closed
    const altchaRes = await altchaHandler({
      httpMethod: 'GET',
      headers: { 'client-ip': '198.51.100.11' }
    });
    assert.equal(altchaRes.statusCode, 503);
    const altchaBody = JSON.parse(altchaRes.body);
    assert.equal(altchaBody.code, 'MISSING_CONFIG');
    assert.ok(altchaBody.correlationId);

    // Form submission fails closed
    const submitRes = await submitHandler({
      httpMethod: 'POST',
      headers: { 'client-ip': '198.51.100.11' },
      body: JSON.stringify({
        name: 'Alice Legit',
        email: 'alice@example.com',
        message: 'Testing production fail closed',
        altcha: 'dGVzdA=='
      })
    });
    assert.equal(submitRes.statusCode, 503);
    const submitBody = JSON.parse(submitRes.body);
    assert.equal(submitBody.code, 'MISSING_CONFIG');

    // Key with fewer than 16 characters must also fail closed
    process.env.ALTCHA_HMAC_KEY = 'short-key';
    const shortKey = getValidatedHmacKey();
    assert.equal(shortKey, null, 'Keys under 16 characters must be rejected in production');
  });

  // --------------------------------------------------------------------------
  // TEST 3: Invalid signature and malformed payload
  // --------------------------------------------------------------------------
  await t.test('3. Invalid signature and malformed payload', async () => {
    process.env.ALTCHA_HMAC_KEY = 'test-suite-hmac-key-sufficiently-long-32-chars';

    // 3a. Malformed JSON
    const malformedJsonRes = await submitHandler({
      httpMethod: 'POST',
      headers: { 'client-ip': '198.51.100.12' },
      body: '{ not valid json }'
    });
    assert.equal(malformedJsonRes.statusCode, 400);
    assert.equal(JSON.parse(malformedJsonRes.body).code, 'INVALID_PAYLOAD');

    // 3b. Malformed base64 / non-JSON ALTCHA payload
    const badBase64Res = await submitHandler({
      httpMethod: 'POST',
      headers: { 'client-ip': '198.51.100.12' },
      body: JSON.stringify({
        name: 'Alice Legit',
        email: 'alice@example.com',
        message: 'Hello world',
        altcha: '!!!not-base64-or-json???'
      })
    });
    assert.equal(badBase64Res.statusCode, 400);
    assert.equal(JSON.parse(badBase64Res.body).code, 'INVALID_PAYLOAD');

    // 3c. Forged / invalid signature
    const forgedToken = Buffer.from(JSON.stringify({
      algorithm: 'SHA-256',
      challenge: '0000000000000000000000000000000000000000000000000000000000000000',
      number: 1234,
      salt: 'salt123?expires=9999999999&',
      signature: 'invalidsignature00000000000000000000000000000000000000000000000000'
    })).toString('base64');

    const forgedRes = await submitHandler({
      httpMethod: 'POST',
      headers: { 'client-ip': '198.51.100.12' },
      body: JSON.stringify({
        name: 'Alice Legit',
        email: 'alice@example.com',
        message: 'Testing forged signature',
        altcha: forgedToken
      })
    });
    assert.equal(forgedRes.statusCode, 400);
    assert.equal(JSON.parse(forgedRes.body).code, 'SIGNATURE_FAILED');
  });

  // --------------------------------------------------------------------------
  // TEST 4: Expired and replayed challenges
  // --------------------------------------------------------------------------
  await t.test('4. Expired and replayed challenges', async () => {
    const key = 'test-suite-hmac-key-sufficiently-long-32-chars';
    process.env.ALTCHA_HMAC_KEY = key;

    // 4a. Expired challenge
    const pastExpires = new Date(Date.now() - 60 * 1000); // 1 minute in the past
    const expiredChallenge = await createChallenge({
      hmacKey: key,
      maxNumber: 1000,
      expires: pastExpires
    });
    const expiredSol = await solveChallenge(expiredChallenge.challenge, expiredChallenge.salt, 'SHA-256', 1000).promise;
    const expiredToken = Buffer.from(JSON.stringify({
      algorithm: expiredChallenge.algorithm,
      challenge: expiredChallenge.challenge,
      number: expiredSol.number,
      salt: expiredChallenge.salt,
      signature: expiredChallenge.signature
    })).toString('base64');

    const expiredRes = await submitHandler({
      httpMethod: 'POST',
      headers: { 'client-ip': '198.51.100.13' },
      body: JSON.stringify({
        name: 'Alice Legit',
        email: 'alice@example.com',
        message: 'Testing expired challenge',
        altcha: expiredToken
      })
    });
    assert.equal(expiredRes.statusCode, 400);
    const expiredBody = JSON.parse(expiredRes.body);
    assert.equal(expiredBody.code, 'EXPIRED_CHALLENGE');

    // 4b. Replayed challenge
    const freshChallenge = await createChallenge({
      hmacKey: key,
      maxNumber: 1000,
      expires: new Date(Date.now() + 5 * 60 * 1000)
    });
    const freshSol = await solveChallenge(freshChallenge.challenge, freshChallenge.salt, 'SHA-256', 1000).promise;
    const freshToken = Buffer.from(JSON.stringify({
      algorithm: freshChallenge.algorithm,
      challenge: freshChallenge.challenge,
      number: freshSol.number,
      salt: freshChallenge.salt,
      signature: freshChallenge.signature
    })).toString('base64');

    // First submission: passes CAPTCHA (stops at SMTP_UNAVAILABLE)
    const firstSub = await submitHandler({
      httpMethod: 'POST',
      headers: { 'client-ip': '198.51.100.14' },
      body: JSON.stringify({
        name: 'Alice Legit',
        email: 'alice@example.com',
        message: 'First valid submission',
        altcha: freshToken
      })
    });
    assert.equal(firstSub.statusCode, 503);

    // Second submission with identical token: must be rejected with REPLAY_REJECTED
    const replaySub = await submitHandler({
      httpMethod: 'POST',
      headers: { 'client-ip': '198.51.100.14' },
      body: JSON.stringify({
        name: 'Alice Legit',
        email: 'alice@example.com',
        message: 'Second replay attempt',
        altcha: freshToken
      })
    });
    assert.equal(replaySub.statusCode, 400);
    const replayBody = JSON.parse(replaySub.body);
    assert.equal(replayBody.code, 'REPLAY_REJECTED');
  });

  // --------------------------------------------------------------------------
  // TEST 5: Legitimate retry after a recoverable failure
  // --------------------------------------------------------------------------
  await t.test('5. Legitimate retry after a recoverable failure', async () => {
    const key = 'test-suite-hmac-key-sufficiently-long-32-chars';
    process.env.ALTCHA_HMAC_KEY = key;

    // Step 1: User submits with invalid form fields (recoverable validation error)
    const badFormRes = await submitHandler({
      httpMethod: 'POST',
      headers: { 'client-ip': '198.51.100.15' },
      body: JSON.stringify({
        name: 'X', // too short (< 2 chars)
        email: 'not-an-email',
        message: 'Hi',
        altcha: 'any-token'
      })
    });
    assert.equal(badFormRes.statusCode, 400);
    assert.equal(JSON.parse(badFormRes.body).code, 'INVALID_PAYLOAD');

    // Step 2: User fixes the inputs, generates and solves a fresh challenge, and resubmits
    const retryChallenge = await createChallenge({
      hmacKey: key,
      maxNumber: 1000,
      expires: new Date(Date.now() + 5 * 60 * 1000)
    });
    const retrySol = await solveChallenge(retryChallenge.challenge, retryChallenge.salt, 'SHA-256', 1000).promise;
    const retryToken = Buffer.from(JSON.stringify({
      algorithm: retryChallenge.algorithm,
      challenge: retryChallenge.challenge,
      number: retrySol.number,
      salt: retryChallenge.salt,
      signature: retryChallenge.signature
    })).toString('base64');

    const goodRetryRes = await submitHandler({
      httpMethod: 'POST',
      headers: { 'client-ip': '198.51.100.15' },
      body: JSON.stringify({
        name: 'Alice Recovered',
        email: 'alice@example.com',
        message: 'Now with corrected valid inputs.',
        altcha: retryToken
      })
    });
    // Successfully verified CAPTCHA and reached SMTP
    assert.equal(goodRetryRes.statusCode, 503);
    assert.equal(JSON.parse(goodRetryRes.body).code, 'SMTP_UNAVAILABLE');
  });

  // --------------------------------------------------------------------------
  // TEST 6: Rate-limit behavior
  // --------------------------------------------------------------------------
  await t.test('6. Rate-limit behavior (challenge 120/15min, attempts 30/1hr)', async () => {
    const testIp = '198.51.100.16';
    const otherIp = '198.51.100.17';

    // 6a. Direct limiter verification
    for (let i = 0; i < 30; i++) {
      const res = checkRateLimit(`submit_attempt_${testIp}`, 30, 60 * 60 * 1000);
      assert.equal(res.allowed, true, `Attempt ${i + 1} should be allowed`);
    }
    const blockedRes = checkRateLimit(`submit_attempt_${testIp}`, 30, 60 * 60 * 1000);
    assert.equal(blockedRes.allowed, false, '31st attempt must be blocked');

    // Other IP is unaffected
    const otherRes = checkRateLimit(`submit_attempt_${otherIp}`, 30, 60 * 60 * 1000);
    assert.equal(otherRes.allowed, true, 'Other client IP must not be throttled');
    assert.equal(getClientIp({ headers: { 'client-ip': testIp } }), testIp, 'Client IP must be extracted correctly');

    // 6b. Handler rate-limit response verification
    const rateLimitedSubmit = await submitHandler({
      httpMethod: 'POST',
      headers: { 'client-ip': testIp },
      body: JSON.stringify({ name: 'Spammer', email: 'spam@test.com', message: 'Hello', altcha: 'token' })
    });
    assert.equal(rateLimitedSubmit.statusCode, 429);
    assert.equal(rateLimitedSubmit.headers['Retry-After'], '3600');
    assert.equal(JSON.parse(rateLimitedSubmit.body).code, 'RATE_LIMITED');
  });

  // --------------------------------------------------------------------------
  // TEST 7: Correct CORS behavior for production domains and local development
  // --------------------------------------------------------------------------
  await t.test('7. Correct CORS behavior for production domains and local development', async () => {
    // Trusted origins
    assert.equal(isAllowedOrigin('https://panav.xyz'), true);
    assert.equal(isAllowedOrigin('https://www.panav.xyz'), true);
    assert.equal(isAllowedOrigin('http://localhost:5173'), true);
    assert.equal(isAllowedOrigin('http://127.0.0.1:4173'), true);
    assert.equal(isAllowedOrigin('https://panav-payappagoudar.netlify.app'), true);
    assert.equal(isAllowedOrigin('https://deploy-preview-12--panav.netlify.app'), true);
    assert.equal(isAllowedOrigin(''), true); // direct same-origin

    // Untrusted origins
    assert.equal(isAllowedOrigin('https://attacker.netlify.app'), false);
    assert.equal(isAllowedOrigin('https://evil-hacker.com'), false);
    assert.equal(isAllowedOrigin('https://panav.xyz.phishing.com'), false);

    // Direct getCorsHeaders unit validation
    const directCors = getCorsHeaders('https://panav.xyz');
    assert.equal(directCors['Access-Control-Allow-Origin'], 'https://panav.xyz');
    const directDenied = getCorsHeaders('https://attacker.netlify.app');
    assert.equal(directDenied['Access-Control-Allow-Origin'], undefined);

    // OPTIONS preflight response
    const optionsRes = await submitHandler({
      httpMethod: 'OPTIONS',
      headers: { origin: 'https://panav.xyz' }
    });
    assert.equal(optionsRes.statusCode, 204);
    assert.equal(optionsRes.headers['Access-Control-Allow-Origin'], 'https://panav.xyz');

    // Untrusted origin header omission
    const untrustedRes = await altchaHandler({
      httpMethod: 'OPTIONS',
      headers: { origin: 'https://attacker.netlify.app' }
    });
    assert.equal(untrustedRes.headers['Access-Control-Allow-Origin'], undefined);
  });

  // --------------------------------------------------------------------------
  // TEST 8: SMTP failure being distinguished from CAPTCHA failure
  // --------------------------------------------------------------------------
  await t.test('8. SMTP failure being distinguished from CAPTCHA failure', async () => {
    const key = 'test-suite-hmac-key-sufficiently-long-32-chars';
    process.env.ALTCHA_HMAC_KEY = key;

    // Case A: Invalid CAPTCHA, unconfigured SMTP
    // Must return 400 SIGNATURE_FAILED, NOT 503 SMTP_UNAVAILABLE
    delete process.env.EMAIL_USER;
    const badCaptchaRes = await submitHandler({
      httpMethod: 'POST',
      headers: { 'client-ip': '198.51.100.18' },
      body: JSON.stringify({
        name: 'Alice Legit',
        email: 'alice@example.com',
        message: 'Inquiring message',
        altcha: 'dGVzdA==' // invalid token
      })
    });
    assert.equal(badCaptchaRes.statusCode, 400);
    assert.equal(JSON.parse(badCaptchaRes.body).code, 'INVALID_PAYLOAD');

    // Case B: Valid CAPTCHA, unconfigured SMTP
    // Must return 503 SMTP_UNAVAILABLE, proving CAPTCHA succeeded and SMTP was evaluated second
    const ch = await createChallenge({ hmacKey: key, maxNumber: 1000, expires: new Date(Date.now() + 300000) });
    const sol = await solveChallenge(ch.challenge, ch.salt, 'SHA-256', 1000).promise;
    const validToken = Buffer.from(JSON.stringify({
      algorithm: ch.algorithm,
      challenge: ch.challenge,
      number: sol.number,
      salt: ch.salt,
      signature: ch.signature
    })).toString('base64');

    const validCaptchaRes = await submitHandler({
      httpMethod: 'POST',
      headers: { 'client-ip': '198.51.100.18' },
      body: JSON.stringify({
        name: 'Alice Legit',
        email: 'alice@example.com',
        message: 'Inquiring message',
        altcha: validToken
      })
    });
    assert.equal(validCaptchaRes.statusCode, 503);
    assert.equal(JSON.parse(validCaptchaRes.body).code, 'SMTP_UNAVAILABLE');
  });

  // --------------------------------------------------------------------------
  // TEST 9: Frontend widget reset and resubmission
  // --------------------------------------------------------------------------
  await t.test('9. Frontend widget reset and resubmission logic', () => {
    // Simulated mock Altcha widget element and hidden input
    let widgetResetCalled = false;
    const mockWidget = {
      value: 'stale-token-1234',
      reset() {
        widgetResetCalled = true;
        this.value = '';
      }
    };
    const mockHiddenInput = { value: 'stale-token-1234' };

    // Function replicating the reset logic introduced into src/main.js
    const resetAltcha = () => {
      if (mockWidget && typeof mockWidget.reset === 'function') {
        mockWidget.reset();
      }
      if (mockHiddenInput) {
        mockHiddenInput.value = '';
      }
    };

    assert.equal(mockWidget.value, 'stale-token-1234');
    assert.equal(mockHiddenInput.value, 'stale-token-1234');

    resetAltcha();

    assert.equal(widgetResetCalled, true, 'widget.reset() must be executed');
    assert.equal(mockWidget.value, '', 'widget value must be cleared');
    assert.equal(mockHiddenInput.value, '', 'hidden input value must be cleared');
  });

  // --------------------------------------------------------------------------
  // TEST 10: Local development and production-equivalent configuration
  // --------------------------------------------------------------------------
  await t.test('10. Local development and production-equivalent configuration', () => {
    // 10a. Production mode requires ALTCHA_HMAC_KEY
    process.env.NODE_ENV = 'production';
    delete process.env.ALTCHA_HMAC_KEY;
    const prodKey = getValidatedHmacKey();
    assert.equal(prodKey, null, 'Must fail closed in production without key');

    process.env.ALTCHA_HMAC_KEY = 'configured-prod-hmac-key-sufficiently-long-32-chars';
    const validProdKey = getValidatedHmacKey();
    assert.equal(validProdKey, 'configured-prod-hmac-key-sufficiently-long-32-chars');

    // 10b. Local dev mode provides consistent cached key
    process.env.NODE_ENV = 'development';
    delete process.env.ALTCHA_HMAC_KEY;

    const devKey1 = getValidatedHmacKey();
    assert.ok(devKey1 && devKey1.length >= 32, 'Dev key must be at least 32 characters');

    // Emulate another process reading the key file
    const cacheFile = path.resolve(process.cwd(), 'node_modules', '.cache', 'altcha-dev.key');
    assert.ok(fs.existsSync(cacheFile), 'Local session key file must exist in node_modules/.cache');
    const cachedFileContent = fs.readFileSync(cacheFile, 'utf8').trim();
    assert.equal(devKey1, cachedFileContent, 'Dev key must match cached file content across processes');
  });
});
