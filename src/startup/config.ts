import config from 'config';

export default function checkJwtPrivateKey() {
  if (!config.has('jwtprivatekey')) {
    throw new Error('FATAL ERROR: jwtPrivateKey is not defined.');
  }
}
