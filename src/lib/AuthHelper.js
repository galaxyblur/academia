import { isFunction } from 'lodash';
import { Base64 } from 'js-base64';
import decode from 'jwt-decode';
import auth0 from 'auth0-js';
import sha256 from 'crypto-js/sha256';
import axios from 'axios';

const ID_TOKEN_KEY = 'id_token';
const CLIENT_ID = 'P8s0A2fYfC3MtSuhqiN2GlNASO4FUwrB';
const CLIENT_DOMAIN = 'capoeira-online.auth0.com';
// const API_IDENTIFIER = 'https://co-academia.com';
const REDIRECT = process.env.AUTH_CALLBACK_URL;
const SCOPE = 'openid email profile';
// const AUDIENCE = `https://${CLIENT_DOMAIN}/userinfo`;

const vBytes = new Uint8Array(32);
const vRandom = window.crypto.getRandomValues(vBytes);
const verifier = Base64.encode(vRandom);

function getChallenge() {
  return Base64.encode(sha256(verifier));
}

export function exchangeCode(code) {
  window.console.warn(code);
  return axios.post(`https://${CLIENT_DOMAIN}/oauth/token`, {
    grant_type: 'authorization_code',
    client_id: CLIENT_ID,
    code_verifier: verifier,
    code,
    redirect_uri: REDIRECT,
  });
}

const auth = new auth0.WebAuth({
  clientID: CLIENT_ID,
  domain: CLIENT_DOMAIN,
});

let onUserIdCallback;

function clearIdToken() {
  window.localStorage.removeItem(ID_TOKEN_KEY);
}

function clearProfile() {
  window.localStorage.removeItem('profile');
  window.localStorage.removeItem('userId');
}

function clearNonce() {
  window.localStorage.removeItem('nonce');
}

function getTokenExpirationDate(encodedToken) {
  const token = decode(encodedToken);
  if (!token.exp) { return null; }

  const date = new Date(0);
  date.setUTCSeconds(token.exp);

  return date;
}

function isTokenExpired(token) {
  const expirationDate = getTokenExpirationDate(token);
  return expirationDate < new Date();
}

// Get and store id_token in local storage
function setIdToken(idToken) {
  window.localStorage.setItem(ID_TOKEN_KEY, idToken);
}

export function getRandomString(length) {
  const bytes = new Uint8Array(length);
  const random = window.crypto.getRandomValues(bytes);
  const result = [];
  const charset = '0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz-._~';

  random.forEach((c) => {
    result.push(charset[c % charset.length]);
  });

  return result.join('');
}

export function getStoredNonce() {
  return window.localStorage.getItem('nonce');
}

export function setStoredNonce(val) {
  window.localStorage.setItem('nonce', val);
}

export function setUserId(id) {
  window.localStorage.setItem('userId', id);

  if (onUserIdCallback) {
    onUserIdCallback(id);
  }
}

export function getUserId() {
  return window.localStorage.getItem('userId');
}

export function onUserId(cb) {
  if (isFunction(cb)) {
    onUserIdCallback = cb;

    const id = getUserId();

    if (id) {
      onUserIdCallback(id);
    }
  }
}

export function getIdToken() {
  return window.localStorage.getItem(ID_TOKEN_KEY);
}

export function login() {
  window.location.href = `https://${CLIENT_DOMAIN}/authorize?scope=${SCOPE}&response_type=code&client_id=${CLIENT_ID}&code_challenge=${getChallenge()}&code_challenge_method=S256&redirect_uri=${REDIRECT}`;

  /*
  const nonce = getRandomString(16);
  setStoredNonce(nonce);

  auth.authorize({
    responseType: 'token id_token',
    redirectUri: REDIRECT,
    audience: AUDIENCE,
    scope: SCOPE,
    nonce,
    state: Base64.encode(nonce),
  });
  */
}

export function hasIdToken() {
  const idToken = getIdToken();
  return !!idToken && !isTokenExpired(idToken);
}

export function isLoggedIn() {
  const userId = getUserId();
  return hasIdToken() && userId;
}

export function logout() {
  clearIdToken();
  clearProfile();
  clearNonce();
}

export function getAndStoreParameters() {
  return new Promise((res, rej) => {
    const nonce = getStoredNonce();
    const opts = {
      hash: unescape(window.location.hash),
      nonce,
      state: Base64.encode(nonce),
    };

    auth.parseHash(opts, (errParse, authResult) => {
      if (errParse) {
        rej(errParse);
      } else {
        setIdToken(authResult.idToken);
        auth.client.userInfo(authResult.accessToken, (errInfo, user) => {
          if (errInfo) {
            rej(errInfo);
          } else {
            res(user);
          }
        });
      }
    });
  });
}

export function getProfile() {
  return decode(getIdToken());
}

export function getAuthId() {
  return getProfile().sub;
}

export function getEmail() {
  return getProfile().email;
}

export function getName() {
  return getProfile().name;
}
