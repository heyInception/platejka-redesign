const PRELOADER_COOKIE_NAME = 'platejka-preloader-viewed';
const PRELOADER_COOKIE_MAX_AGE = 60 * 60 * 24;

const consumePreloaderCookie = (cookieString, writeCookie) => {
  try {
    const hasCookie = cookieString
      .split(';')
      .map((cookie) => cookie.trim())
      .some((cookie) => cookie.startsWith(`${PRELOADER_COOKIE_NAME}=`));

    if (hasCookie) return false;

    writeCookie(
      `${PRELOADER_COOKIE_NAME}=true; Max-Age=${PRELOADER_COOKIE_MAX_AGE}; Path=/; SameSite=Lax`,
    );
    return true;
  } catch (error) {
    return true;
  }
};

module.exports = { consumePreloaderCookie };
