//asides slide onclick in or out
const settingsButton = document.querySelector('#settingsSVG');
const settingsSection = document.querySelector('.settings');
const mainSection = document.querySelector('main');
const inSixteenDaysButton = document.querySelector('.sechzehn-tage-btn');
const outSixteenDaysButton = document.querySelector('.zurück-pfeil');
const sixteenDaysSection = document.querySelector('.sechzehn-tage-aside');
const clickEvent = new Event('click');

settingsButton.addEventListener('animationend', () => {
  settingsButton.style.animation = 'none';
});

let i = 1;
settingsButton.addEventListener('click', (e) => {
  if (i % 2 !== 0) {
    settingsSection.style.animation = 'slide-in 400ms ease-in-out forwards';
    settingsButton.style.animation = 'icon-rotate 400ms ease-out forwards';

    setTimeout(() => {
      settingsSection.style.transform = 'none';
    }, 400);

    if (!sixteenDaysSection.classList.contains('.active')) {
      mainSection.style.transform = 'translateX(100vw)';
    } else {
      outSixteenDaysButton.dispatchEvent(clickEvent);
      mainSection.style.transform = 'translateX(200vw)';
    }
  } else {
    settingsSection.style.animation = 'slide-out 400ms ease-in-out forwards';
    settingsButton.style.animation =
      'icon-rotate 400ms ease-out forwards reverse';
    mainSection.style.transform = 'translateX(0)';

    setTimeout(() => {
      settingsSection.style.transform = 'translateX(-100vw)';
    }, 400);
  }
  i++;
});

inSixteenDaysButton.addEventListener('click', (e) => {
  mainSection.style.transform = 'translateX(100vw)';
  sixteenDaysSection.style.transform = 'translateX(0)';
  sixteenDaysSection.classList.add('.active');
});

outSixteenDaysButton.addEventListener('click', (e) => {
  mainSection.style.transform = 'translateX(0)';
  sixteenDaysSection.style.transform = 'translateX(-100vw)';
  sixteenDaysSection.classList.remove('.active');
});

//Geocoding api for changing weather-location
const locationInput = document.querySelector('#location-input');
const suggestionsDiv = document.querySelector('.suggestions-div');

const debouncedFetch = debounce(geocodingFetch, 380);

locationInput.addEventListener('input', (e) => {
  if (locationInput.value.length < 2) {
    suggestionsDiv.style.border = 'none';
  } else {
    suggestionsDiv.style.border = '1px solid var(--line-color)';
  }
  debouncedFetch();
});

function debounce(func, delay) {
  let timer;

  return function () {
    clearTimeout(timer);

    timer = setTimeout(() => {
      func();
    }, delay);
  };
}

let latitude;
let longitude;
let clickedSuggestion;
const checkedTemperatureUnit = document.querySelector(
  `.temperatur-einheit-section input[value = "${localStorage.getItem('temperatureUnit')}"]`,
);
const CheckedWindspeedUnit = document.querySelector(
  `.windgeschwindigkeit-einheit-section input[value = "${localStorage.getItem('windspeedUnit')}"]`,
);

if (localStorage.hasOwnProperty('weatherLocation')) {
  latitude = localStorage.getItem('weatherLatitude');
  longitude = localStorage.getItem('weatherLongitude');
  checkedTemperatureUnit.checked = true;
  CheckedWindspeedUnit.checked = true;
  locationInput.value = localStorage.getItem('weatherLocation');
} else {
  latitude = '52.52437';
  longitude = '13.41053';
  locationInput.value = 'Berlin, Land Berlin, Deutschland';
}

async function geocodingFetch() {
  const locationInputValue = locationInput.value.trim();

  const fetchData = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${locationInputValue}&count=10&language=de&format=json`,
  );
  const JSONdata = await fetchData.json();
  const JSONresults = JSONdata.results;

  const suggestionsBox = document.querySelector('.suggestions-div');
  suggestionsBox.innerHTML = ``;

  for (const location of JSONresults) {
    const suggestionButton = document.createElement('button');
    suggestionButton.classList.add('suggestion');
    suggestionButton.dataset.longitude = location.longitude;
    suggestionButton.dataset.latitude = location.latitude;

    const locationSpan = document.createElement('span');
    locationSpan.classList.add('location');
    locationSpan.innerText = location.name + ', ';

    const adminOneSpan = document.createElement('span');
    adminOneSpan.classList.add('adminOne');
    adminOneSpan.innerText = location.admin1 + ', ';

    const countrySpan = document.createElement('span');
    countrySpan.classList.add('country');
    countrySpan.innerText = location.country;

    if (!location.admin1) {
      adminOneSpan.innerText = ``;
    }
    if (!location.country) {
      countrySpan.innerText = ``;
    }

    //
    const lineBreak = document.createElement('br');

    suggestionButton.append(
      locationSpan,
      lineBreak,
      adminOneSpan,
      lineBreak,
      countrySpan,
    );
    suggestionsBox.append(suggestionButton);

    suggestionButton.addEventListener('mousedown', (e) => {
      e.preventDefault();
      latitude = suggestionButton.dataset.latitude;
      longitude = suggestionButton.dataset.longitude;
      locationInput.value = suggestionButton.textContent;
      locationInput.blur();
      clickedSuggestion = suggestionButton.innerText;
      locationErrorMessage.style.display = 'none';
    });
  }
}

//settings logic

const submitSettingsButton = document.querySelector('.submit-settings');
const locationErrorMessage = document.querySelector('.error');

submitSettingsButton.addEventListener('click', (e) => {
  const temperatureUnit = document.querySelector(
    '.temperatur-einheit-section input:checked',
  );
  const windspeedUnit = document.querySelector(
    '.windgeschwindigkeit-einheit-section input:checked',
  );
  const successAlert = document.querySelector('.success-card');
  const savedLocation = localStorage.getItem('weatherLocation') || '';

  successAlert.style.animation = 'none';
  void successAlert.offsetWidth;

  if (
    (locationInput.value !== 'Berlin, Land Berlin, Deutschland' &&
      !clickedSuggestion &&
      locationInput.value.toLowerCase() !== savedLocation.toLowerCase()) ||
    (clickedSuggestion !== undefined &&
      locationInput.value !== clickedSuggestion &&
      locationInput.value !== savedLocation)
  ) {
    locationErrorMessage.style.display = 'block';
  } else if (
    locationInput.value === 'Berlin, Land Berlin, Deutschland' &&
    !clickedSuggestion
  ) {
    clickedSuggestion = 'Berlin, Land Berlin, Deutschland';
    locationErrorMessage.style.display = 'none';
    localStorage.setItem('weatherLocation', clickedSuggestion.split(',')[0]);
    localStorage.setItem('weatherLatitude', '52.52437');
    localStorage.setItem('weatherLongitude', '13.41053');
    localStorage.setItem('temperatureUnit', temperatureUnit.value);
    localStorage.setItem('windspeedUnit', windspeedUnit.value);

    successAlert.style.animation = 'view-success 2s ease-in-out forwards';
    fetchWeather();
    settingsButton.dispatchEvent(new Event('click'));
  } else if (
    locationInput.value.toLowerCase() === savedLocation.toLowerCase()
  ) {
    locationErrorMessage.style.display = 'none';
    localStorage.setItem('weatherLatitude', latitude);
    localStorage.setItem('weatherLongitude', longitude);
    localStorage.setItem('temperatureUnit', temperatureUnit.value);
    localStorage.setItem('windspeedUnit', windspeedUnit.value);

    successAlert.style.animation = 'view-success 2s ease-in-out forwards';
    fetchWeather();
    settingsButton.dispatchEvent(new Event('click'));
  } else {
    locationErrorMessage.style.display = 'none';
    localStorage.setItem('weatherLocation', clickedSuggestion.split(',')[0]);
    localStorage.setItem('weatherLatitude', latitude);
    localStorage.setItem('weatherLongitude', longitude);
    localStorage.setItem('temperatureUnit', temperatureUnit.value);
    localStorage.setItem('windspeedUnit', windspeedUnit.value);

    successAlert.style.animation = 'view-success 2s ease-in-out forwards';
    fetchWeather();
    settingsButton.dispatchEvent(new Event('click'));
  }
});

//fetch weather-data

fetchWeather();
async function fetchWeather() {
  try {
    const temperatureUnit = document.querySelector(
      '.temperatur-einheit-section input:checked',
    );
    const windspeedUnit = document.querySelector(
      '.windgeschwindigkeit-einheit-section input:checked',
    );

    const fetchData = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${parseFloat(latitude)}&longitude=${parseFloat(longitude)}&daily=temperature_2m_max,temperature_2m_min,weather_code&hourly=temperature_2m,is_day,weather_code,wind_speed_10m&current=temperature_2m,weather_code,is_day,apparent_temperature,relative_humidity_2m,wind_speed_10m,wind_direction_10m&timezone=auto&forecast_days=16&temperature_unit=${temperatureUnit.value}&wind_speed_unit=${windspeedUnit.value}`,
    );
    const JSONdata = await fetchData.json();
    console.log(JSONdata);

    //loading-screen

    setTimeout(() => {
      loadingCircle.forEach((el) => {
        el.style.animation = 'loading-out 1s ease forwards';
      });

      loadingLogo.style.animation =
        'logo-in 1s ease forwards, zoom-in 0.7s ease-out 1.2s forwards';

      loadingSection.style.animation = 'fade-away 0.7s ease 1.3s forwards';
    }, 930);

    setTimeout(() => {
      loadingSection.style.display = 'none';
    }, 3030);

    insertWeatherdata(JSONdata);
  } catch {
    const errorAlertPage = document.querySelector('.custom-alert');
    const reloadButton = document.querySelector('.alert-button');

    errorAlertPage.style.display = 'flex';
    errorAlertPage.style.position = 'fixed';
    reloadButton.addEventListener('click', (e) => {
      window.location.reload();
    });
  }
}

//insert the weatherdata

function insertWeatherdata(allData) {
  const body = document.body;
  const currentLocation = document.querySelector('.location');
  const currentTemperature = document.querySelector('.current-temperature');
  const currentWeather = document.querySelector('.current-weather');
  const minMaxTemperature = document.querySelector('.min-max-temperature');
  const dailyWeather = document.querySelector('.tage');
  const sixteenDaysBox = document.querySelector('.sechzehn-tage-box');
  const hourlyWeather = document.querySelector('.stunden');
  const currentPerceivedTemperature = document.querySelector(
    '.gefühlte-temperatur',
  );
  const currentHumidity = document.querySelector('.luftfeuchtigkeit');
  const currentWindspeed = document.querySelector(
    '.wind-geschwindigkeit-richtung',
  );

  function setBackground() {
    const windowWidth = window.innerWidth;
    let device;
    let dayOrNight;

    if (windowWidth > 1024) {
      device = 'desktop';
    } else {
      device = 'smartphone-tablet';
    }

    if (allData.current.is_day === 1) {
      dayOrNight = 'tag';
    } else {
      dayOrNight = 'nacht';
    }

    switch (allData.current.weather_code) {
      case 0:
        body.style.background = `url(/backgrounds/${device}/${dayOrNight}/klar.jpg) center/cover fixed no-repeat`;
        currentWeather.innerText = 'Klarer Himmel';
        break;
      case 1:
      case 2:
      case 3:
        body.style.background = `url(/backgrounds/${device}/${dayOrNight}/bewölkt.jpg) center/cover fixed no-repeat`;
        currentWeather.innerText = 'Bewölkt/leicht bewölkt';
        break;
      case 45:
      case 48:
        body.style.background = `url(/backgrounds/${device}/${dayOrNight}/nebel.jpg) center/cover fixed no-repeat`;
        currentWeather.innerText = 'Neblig';
        break;
      case 51:
      case 53:
      case 55:
      case 56:
      case 57:
      case 61:
      case 63:
      case 65:
      case 66:
      case 67:
      case 80:
      case 81:
      case 82:
        body.style.background = `url(/backgrounds/${device}/${dayOrNight}/regen.jpg) center/cover fixed no-repeat`;
        currentWeather.innerText = 'Regen/-Nieselregen';
        break;
      case 71:
      case 73:
      case 75:
      case 77:
      case 85:
      case 86:
        body.style.background = `url(/backgrounds/${device}/${dayOrNight}/schnee.jpg) center/cover fixed no-repeat`;
        currentWeather.innerText = 'Schneefall';
        break;
      case 95:
      case 96:
      case 99:
        body.style.background = `url(/backgrounds/${device}/${dayOrNight}/gewitter.jpg) center/cover fixed no-repeat`;
        currentWeather.innerText = 'Gewitter';
        break;
    }
  }

  setBackground();
  window.removeEventListener('resize', setBackground);
  window.addEventListener('resize', setBackground);

  //
  currentTemperature.innerText =
    Math.round(allData.current.temperature_2m) + '°';

  if (localStorage.hasOwnProperty('weatherLocation')) {
    currentLocation.innerText = localStorage.getItem('weatherLocation');
  } else {
    currentLocation.innerText = 'Berlin';
  }

  minMaxTemperature.innerText =
    Math.round(allData.daily.temperature_2m_min[0]) +
    '°/' +
    Math.round(allData.daily.temperature_2m_max[0]) +
    '°';

  const dailyMaxTemperatures = allData.daily.temperature_2m_max;
  const dailyMinTemperatures = allData.daily.temperature_2m_min;
  const dailyWeathercodes = allData.daily.weather_code;
  dailyMaxTemperatures.shift();
  dailyMinTemperatures.shift();
  dailyWeathercodes.shift();
  const daysOfWeek = ['Mo.', 'Di.', 'Mi.', 'Do.', 'Fr.', 'Sa.', 'So.'];
  let weekIndex = new Date().getDay();
  dailyWeather.innerHTML = ``;
  sixteenDaysBox.innerHTML = ``;

  const weatherIcon = (weathercodeSrc, hourlyIsDay) => {
    switch (weathercodeSrc) {
      case 0:
        if (hourlyIsDay === 0) {
          return `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" fill="none">
              <defs>
                <linearGradient id="moon_grad_clear" x1="20" y1="20" x2="45" y2="45" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stop-color="#F5DEB3"/>
                  <stop offset="100%" stop-color="#FFD700"/>
                </linearGradient>
                <mask id="moon_mask_clear">
                  <circle cx="31.2453" cy="33.051" r="20.4885" fill="white" />
                  <circle cx="45" cy="22" r="20.4885" fill="black" />
                </mask>
              </defs>
              <circle cx="31.2453" cy="33.051" r="20.4885" fill="url(#moon_grad_clear)" mask="url(#moon_mask_clear)"/>
            </svg>`;
        } else {
          return `<svg xmlns="http://www.w3.org/2000/svg" class="weather-icon" width="64" height="64" viewBox="0 0 64 64" fill="none">
          <circle cx="31.2453" cy="33.051" r="20.4885" fill="url(#paint0_radial_0_7)"/>
          <path d="M29.5898 3.87042C29.5898 2.83742 30.4273 2 31.4603 2C32.4933 2 33.3307 2.83742 33.3307 3.87042V8.25742C33.3307 9.29043 32.4933 10.1278 31.4603 10.1278C30.4273 10.1278 29.5898 9.29043 29.5898 8.25742V3.87042Z" fill="url(#paint1_linear_0_7)"/>
          <rect x="9.78125" y="9.6355" width="3.90257" height="7.80515" rx="1.95129" transform="rotate(-39.4382 9.78125 9.6355)" fill="url(#paint2_linear_0_7)"/>
          <rect x="1" y="29.1484" width="3.90257" height="7.80515" rx="1.95129" transform="rotate(-80.0345 1 29.1484)" fill="url(#paint3_linear_0_7)"/>
          <rect width="3.90257" height="7.80515" rx="1.95129" transform="matrix(-0.494664 -0.869084 -0.869084 0.494664 12.708 45.7344)" fill="url(#paint4_linear_0_7)"/>
          <rect width="3.90257" height="7.80515" rx="1.95129" transform="matrix(-0.936692 -0.350155 -0.350155 0.936692 25.3916 54.5151)" fill="url(#paint5_linear_0_7)"/>
          <path d="M52.5118 11.5233C53.1619 10.733 53.0561 9.56699 52.2744 8.9065C51.478 8.23354 50.2851 8.34173 49.6227 9.14701L46.8361 12.5349C46.186 13.3252 46.2918 14.4913 47.0734 15.1517C47.8699 15.8247 49.0628 15.7165 49.7252 14.9112L52.5118 11.5233Z" fill="url(#paint6_linear_0_7)"/>
          <path d="M61.426 29.7513C62.5086 29.5611 63.1946 28.4829 62.9081 27.4217C62.6558 26.4871 61.7321 25.8994 60.7786 26.0669L56.4727 26.8235C55.3901 27.0137 54.7042 28.092 54.9906 29.1532C55.2429 30.0878 56.1666 30.6754 57.1201 30.5079L61.426 29.7513Z" fill="url(#paint7_linear_0_7)"/>
          <path d="M51.6198 47.3113C50.6819 46.7774 50.3891 45.5627 50.9809 44.6601C51.5222 43.8344 52.6122 43.5717 53.4703 44.0601L57.2765 46.2266C58.2145 46.7604 58.5072 47.9751 57.9155 48.8777C57.3741 49.7034 56.2841 49.9661 55.426 49.4777L51.6198 47.3113Z" fill="url(#paint8_linear_0_7)"/>
          <rect x="38.0742" y="54.5151" width="3.90257" height="7.80515" rx="1.95129" transform="rotate(-20.4968 38.0742 54.5151)" fill="url(#paint9_linear_0_7)"/>
          <defs>
          <radialGradient id="paint0_radial_0_7" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(26.4542 20.6697) rotate(13.1231) scale(30.1634)">
          <stop offset="0.1937" stop-color="#F5BE6B"/>
          <stop offset="0.5293" stop-color="#FFB029"/>
          <stop offset="0.7805" stop-color="#FF9100"/>
          </radialGradient>
          <linearGradient id="paint1_linear_0_7" x1="30.1106" y1="3.23914" x2="33.9833" y2="4.83558" gradientUnits="userSpaceOnUse">
          <stop offset="0.1667" stop-color="#FFE475"/>
          <stop offset="0.7986" stop-color="#FFBF29"/>
          </linearGradient>
          <linearGradient id="paint2_linear_0_7" x1="10.3998" y1="10.8254" x2="14.6709" y2="13.0032" gradientUnits="userSpaceOnUse">
          <stop offset="0.1667" stop-color="#FFE475"/>
          <stop offset="0.7986" stop-color="#FFBF29"/>
          </linearGradient>
          <linearGradient id="paint3_linear_0_7" x1="1.61858" y1="30.3384" x2="5.88964" y2="32.5161" gradientUnits="userSpaceOnUse">
          <stop offset="0.1667" stop-color="#FFE475"/>
          <stop offset="0.7986" stop-color="#FFBF29"/>
          </linearGradient>
          <linearGradient id="paint4_linear_0_7" x1="0.618583" y1="1.18994" x2="4.88964" y2="3.36771" gradientUnits="userSpaceOnUse">
          <stop offset="0.1667" stop-color="#FFE475"/>
          <stop offset="0.7986" stop-color="#FFBF29"/>
          </linearGradient>
          <linearGradient id="paint5_linear_0_7" x1="0.618583" y1="1.18994" x2="4.88964" y2="3.36771" gradientUnits="userSpaceOnUse">
          <stop offset="0.1667" stop-color="#FFE475"/>
          <stop offset="0.7986" stop-color="#FFBF29"/>
          </linearGradient>
          <linearGradient id="paint6_linear_0_7" x1="52.0084" y1="10.2594" x2="48.3083" y2="9.0122" gradientUnits="userSpaceOnUse">
          <stop offset="0.1667" stop-color="#FFE475"/>
          <stop offset="0.7986" stop-color="#FFBF29"/>
          </linearGradient>
          <linearGradient id="paint7_linear_0_7" x1="61.7073" y1="28.6333" x2="59.5523" y2="25.1585" gradientUnits="userSpaceOnUse">
          <stop offset="0.1667" stop-color="#FFE475"/>
          <stop offset="0.7986" stop-color="#FFBF29"/>
          </linearGradient>
          <linearGradient id="paint8_linear_0_7" x1="51.8284" y1="45.8994" x2="54.6514" y2="43.4811" gradientUnits="userSpaceOnUse">
          <stop offset="0.1667" stop-color="#FFE475"/>
          <stop offset="0.7986" stop-color="#FFBF29"/>
          </linearGradient>
          <linearGradient id="paint9_linear_0_7" x1="38.6928" y1="55.7051" x2="42.9639" y2="57.8828" gradientUnits="userSpaceOnUse">
          <stop offset="0.1667" stop-color="#FFE475"/>
          <stop offset="0.7986" stop-color="#FFBF29"/>
          </linearGradient>
          </defs>
          </svg>`;
        }
        break;
      case 1:
        if (hourlyIsDay === 0) {
          return `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" fill="none">
              <defs>
                <linearGradient id="moon_grad_2" x1="15" y1="15" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stop-color="#F5DEB3"/>
                  <stop offset="100%" stop-color="#FFD700"/>
                </linearGradient>
                <linearGradient id="cloud_grad_2" x1="34.5" y1="30.9" x2="38" y2="58.9" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#EEFAFE"/>
                  <stop offset="1" stop-color="#BACFDB"/>
                </linearGradient>
                <mask id="moon_mask_2">
                  <circle cx="26.9" cy="27.9" r="17.9" fill="white" />
                  <circle cx="38" cy="18" r="17.9" fill="black" />
                </mask>
              </defs>
              <circle cx="26.9" cy="27.9" r="17.9" fill="url(#moon_grad_2)" mask="url(#moon_mask_2)"/>
              <path d="M21.451 41.0625C22.356 33.1285 28.9086 27.0118 36.6541 27.0118C43.5057 27.0118 49.4522 31.6872 51.3536 38.4726C51.3951 38.4654 51.4408 38.4683 51.4837 38.4625C51.8725 38.415 52.2656 38.3804 52.6669 38.3804C58.1013 38.3804 62.52 42.9851 62.52 48.6435C62.52 54.3018 58.1013 58.9051 52.6669 58.9051H22.0986C17.3686 58.9051 13.52 54.897 13.52 49.9694C13.52 45.2825 17.0032 41.4257 21.451 41.0625Z" fill="url(#cloud_grad_2)"/>
            </svg>`;
        } else {
          return `<svg xmlns="http://www.w3.org/2000/svg" class="weather-icon" width="64" height="64" viewBox="0 0 64 64" fill="none">
            <circle cx="26.9167" cy="27.9137" r="17.9445" fill="url(#paint0_radial_0_32)"/>
            <path d="M25.1829 2.65628C25.1829 1.74638 25.9205 1.00876 26.8304 1.00876C27.7403 1.00876 28.4779 1.74638 28.4779 2.65628V6.52048C28.4779 7.43038 27.7403 8.168 26.8304 8.168C25.9205 8.168 25.1829 7.43038 25.1829 6.52048V2.65628Z" fill="url(#paint1_linear_0_32)"/>
            <rect x="7.97534" y="7.97535" width="2.99076" height="6.97843" rx="1.49538" transform="rotate(-39.4382 7.97534 7.97535)" fill="url(#paint2_linear_0_32)"/>
            <rect y="24.923" width="2.99076" height="6.97843" rx="1.49538" transform="rotate(-80.0345 0 24.923)" fill="url(#paint3_linear_0_32)"/>
            <rect width="2.99076" height="6.97843" rx="1.49538" transform="matrix(-0.494664 -0.869084 -0.869084 0.494664 9.96924 39.8767)" fill="url(#paint4_linear_0_32)"/>
            <rect width="2.99076" height="6.97843" rx="1.49538" transform="matrix(-0.936692 -0.350155 -0.350155 0.936692 20.9353 47.8521)" fill="url(#paint5_linear_0_32)"/>
            <path d="M45.3733 9.39717C45.9459 8.70102 45.8527 7.67395 45.1642 7.09218C44.4627 6.49941 43.4119 6.59471 42.8285 7.30402L40.374 10.2882C39.8014 10.9843 39.8945 12.0114 40.583 12.5932C41.2845 13.1859 42.3353 13.0906 42.9187 12.3813L45.3733 9.39717Z" fill="url(#paint6_linear_0_32)"/>
            <path d="M53.2248 25.4528C54.1784 25.2853 54.7826 24.3355 54.5303 23.4008C54.308 22.5776 53.4944 22.0599 52.6546 22.2075L48.8618 22.8739C47.9082 23.0415 47.304 23.9912 47.5563 24.926C47.7785 25.7492 48.5922 26.2668 49.432 26.1192L53.2248 25.4528Z" fill="url(#paint7_linear_0_32)"/>
            <path d="M44.5876 40.9203C43.7614 40.4501 43.5035 39.3801 44.0248 38.5851C44.5016 37.8578 45.4617 37.6264 46.2175 38.0566L49.5702 39.9649C50.3963 40.4351 50.6542 41.5051 50.133 42.3001C49.6561 43.0274 48.6961 43.2588 47.9402 42.8286L44.5876 40.9203Z" fill="url(#paint8_linear_0_32)"/>
            <rect x="32.8982" y="47.8521" width="2.99076" height="6.97843" rx="1.49538" transform="rotate(-20.4968 32.8982 47.8521)" fill="url(#paint9_linear_0_32)"/>
            <path d="M21.451 41.0625C22.356 33.1285 28.9086 27.0118 36.6541 27.0118C43.5057 27.0118 49.4522 31.6872 51.3536 38.4726C51.3951 38.4654 51.4408 38.4683 51.4837 38.4625C51.8725 38.415 52.2656 38.3804 52.6669 38.3804C58.1013 38.3804 62.52 42.9851 62.52 48.6435C62.52 54.3018 58.1013 58.9051 52.6669 58.9051H22.0986C17.3686 58.9051 13.52 54.897 13.52 49.9694C13.52 45.2825 17.0032 41.4257 21.451 41.0625Z" fill="url(#paint10_linear_0_32)"/>
            <defs>
            <radialGradient id="paint0_radial_0_32" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(22.7205 17.0697) rotate(13.1231) scale(26.4181)">
            <stop offset="0.1937" stop-color="#F5BE6B"/>
            <stop offset="0.5293" stop-color="#FFB029"/>
            <stop offset="0.7805" stop-color="#FF9100"/>
            </radialGradient>
            <linearGradient id="paint1_linear_0_32" x1="25.6416" y1="2.10023" x2="29.0527" y2="3.50642" gradientUnits="userSpaceOnUse">
            <stop offset="0.1667" stop-color="#FFE475"/>
            <stop offset="0.7986" stop-color="#FFBF29"/>
            </linearGradient>
            <linearGradient id="paint2_linear_0_32" x1="8.4494" y1="9.03925" x2="11.9121" y2="10.5526" gradientUnits="userSpaceOnUse">
            <stop offset="0.1667" stop-color="#FFE475"/>
            <stop offset="0.7986" stop-color="#FFBF29"/>
            </linearGradient>
            <linearGradient id="paint3_linear_0_32" x1="0.474054" y1="25.9869" x2="3.93676" y2="27.5002" gradientUnits="userSpaceOnUse">
            <stop offset="0.1667" stop-color="#FFE475"/>
            <stop offset="0.7986" stop-color="#FFBF29"/>
            </linearGradient>
            <linearGradient id="paint4_linear_0_32" x1="0.474054" y1="1.0639" x2="3.93676" y2="2.57727" gradientUnits="userSpaceOnUse">
            <stop offset="0.1667" stop-color="#FFE475"/>
            <stop offset="0.7986" stop-color="#FFBF29"/>
            </linearGradient>
            <linearGradient id="paint5_linear_0_32" x1="0.474054" y1="1.0639" x2="3.93676" y2="2.57727" gradientUnits="userSpaceOnUse">
            <stop offset="0.1667" stop-color="#FFE475"/>
            <stop offset="0.7986" stop-color="#FFBF29"/>
            </linearGradient>
            <linearGradient id="paint6_linear_0_32" x1="44.9299" y1="8.28389" x2="41.6707" y2="7.18528" gradientUnits="userSpaceOnUse">
            <stop offset="0.1667" stop-color="#FFE475"/>
            <stop offset="0.7986" stop-color="#FFBF29"/>
            </linearGradient>
            <linearGradient id="paint7_linear_0_32" x1="53.4725" y1="24.468" x2="51.5743" y2="21.4073" gradientUnits="userSpaceOnUse">
            <stop offset="0.1667" stop-color="#FFE475"/>
            <stop offset="0.7986" stop-color="#FFBF29"/>
            </linearGradient>
            <linearGradient id="paint8_linear_0_32" x1="44.7713" y1="39.6767" x2="47.2579" y2="37.5466" gradientUnits="userSpaceOnUse">
            <stop offset="0.1667" stop-color="#FFE475"/>
            <stop offset="0.7986" stop-color="#FFBF29"/>
            </linearGradient>
            <linearGradient id="paint9_linear_0_32" x1="33.3722" y1="48.916" x2="36.835" y2="50.4294" gradientUnits="userSpaceOnUse">
            <stop offset="0.1667" stop-color="#FFE475"/>
            <stop offset="0.7986" stop-color="#FFBF29"/>
            </linearGradient>
            <linearGradient id="paint10_linear_0_32" x1="34.5044" y1="30.9352" x2="38.02" y2="58.9051" gradientUnits="userSpaceOnUse">
            <stop stop-color="#EEFAFE"/>
            <stop offset="1" stop-color="#BACFDB"/>
            </linearGradient>
            </defs>
            </svg>`;
        }
        break;
      case 2:
        if (hourlyIsDay === 0) {
          return `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" fill="none">
                <defs>
                  <linearGradient id="moon_grad_1" x1="10" y1="20" x2="30" y2="40" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stop-color="#F5DEB3"/>
                    <stop offset="100%" stop-color="#FFD700"/>
                  </linearGradient>
                  <linearGradient id="cloud_grad_1" x1="32.5" y1="22.9" x2="36" y2="50.9" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#EEFAFE"/>
                    <stop offset="1" stop-color="#BACFDB"/>
                  </linearGradient>
                  <mask id="moon_mask_1">
                    <circle cx="20.5" cy="30.5" r="12.5" fill="white" />
                    <circle cx="28" cy="24" r="12.5" fill="black" />
                  </mask>
                </defs>
                <circle cx="20.5" cy="30.5" r="12.5" fill="url(#moon_grad_1)" mask="url(#moon_mask_1)"/>
                <path d="M19.451 33.0625C20.356 25.1285 26.9086 19.0118 34.6541 19.0118C41.5057 19.0118 47.4522 23.6872 49.3536 30.4726C49.3951 30.4654 49.4408 30.4683 49.4837 30.4625C49.8725 30.415 50.2656 30.3804 50.6669 30.3804C56.1013 30.3804 60.52 34.9851 60.52 40.6435C60.52 46.3018 56.1013 50.9051 50.6669 50.9051H20.0986C15.3686 50.9051 11.52 46.897 11.52 41.9694C11.52 37.2825 15.0032 33.4257 19.451 33.0625Z" fill="url(#cloud_grad_1)"/>
              </svg>`;
        } else {
          return `<svg xmlns="http://www.w3.org/2000/svg" class="weather-icon" width="64" height="64" viewBox="0 0 64 64" fill="none">
            <circle cx="20.5" cy="30.5" r="12.5" fill="url(#paint0_radial_0_73)"/>
            <path d="M19.3992 12.8352C19.3992 12.2066 19.9088 11.697 20.5375 11.697C21.1661 11.697 21.6757 12.2066 21.6757 12.8352V15.5051C21.6757 16.1337 21.1661 16.6433 20.5375 16.6433C19.9088 16.6433 19.3992 16.1337 19.3992 15.5051V12.8352Z" fill="url(#paint1_linear_0_73)"/>
            <rect x="7" y="16" width="2" height="5" rx="1" transform="rotate(-39.4382 7 16)" fill="url(#paint2_linear_0_73)"/>
            <rect x="2" y="28" width="2" height="5" rx="1" transform="rotate(-80.0345 2 28)" fill="url(#paint3_linear_0_73)"/>
            <rect width="2" height="5" rx="1" transform="matrix(-0.494664 -0.869084 -0.869084 0.494664 9 38)" fill="url(#paint4_linear_0_73)"/>
            <path d="M19.451 33.0625C20.356 25.1285 26.9086 19.0118 34.6541 19.0118C41.5057 19.0118 47.4522 23.6872 49.3536 30.4726C49.3951 30.4654 49.4408 30.4683 49.4837 30.4625C49.8725 30.415 50.2656 30.3804 50.6669 30.3804C56.1013 30.3804 60.52 34.9851 60.52 40.6435C60.52 46.3018 56.1013 50.9051 50.6669 50.9051H20.0986C15.3686 50.9051 11.52 46.897 11.52 41.9694C11.52 37.2825 15.0032 33.4257 19.451 33.0625Z" fill="url(#paint5_linear_0_73)"/>
            <defs>
            <radialGradient id="paint0_radial_0_73" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(17.577 22.9462) rotate(13.1231) scale(18.4026)">
            <stop offset="0.1937" stop-color="#F5BE6B"/>
            <stop offset="0.5293" stop-color="#FFB029"/>
            <stop offset="0.7805" stop-color="#FF9100"/>
            </radialGradient>
            <linearGradient id="paint1_linear_0_73" x1="19.7161" y1="12.4511" x2="22.0729" y2="13.4226" gradientUnits="userSpaceOnUse">
            <stop offset="0.1667" stop-color="#FFE475"/>
            <stop offset="0.7986" stop-color="#FFBF29"/>
            </linearGradient>
            <linearGradient id="paint2_linear_0_73" x1="7.31701" y1="16.7623" x2="9.6815" y2="17.7268" gradientUnits="userSpaceOnUse">
            <stop offset="0.1667" stop-color="#FFE475"/>
            <stop offset="0.7986" stop-color="#FFBF29"/>
            </linearGradient>
            <linearGradient id="paint3_linear_0_73" x1="2.31701" y1="28.7623" x2="4.6815" y2="29.7268" gradientUnits="userSpaceOnUse">
            <stop offset="0.1667" stop-color="#FFE475"/>
            <stop offset="0.7986" stop-color="#FFBF29"/>
            </linearGradient>
            <linearGradient id="paint4_linear_0_73" x1="0.317013" y1="0.762279" x2="2.6815" y2="1.72678" gradientUnits="userSpaceOnUse">
            <stop offset="0.1667" stop-color="#FFE475"/>
            <stop offset="0.7986" stop-color="#FFBF29"/>
            </linearGradient>
            <linearGradient id="paint5_linear_0_73" x1="32.5044" y1="22.9352" x2="36.02" y2="50.9051" gradientUnits="userSpaceOnUse">
            <stop stop-color="#EEFAFE"/>
            <stop offset="1" stop-color="#BACFDB"/>
            </linearGradient>
            </defs>
            </svg>`;
        }
        break;
      case 3:
        return `<svg xmlns="http://www.w3.org/2000/svg" class="weather-icon" width="64" height="64" viewBox="0 0 64 64" fill="none">
            <path d="M10.717 29.5208C11.8806 19.3199 20.3054 11.4557 30.2639 11.4557C39.073 11.4557 46.7185 17.4669 49.1632 26.1909C49.2166 26.1817 49.2753 26.1854 49.3304 26.178C49.8304 26.1168 50.3357 26.0723 50.8517 26.0723C57.8389 26.0723 63.52 31.9928 63.52 39.2678C63.52 46.5427 57.8389 52.4613 50.8517 52.4613H11.5497C5.46815 52.4613 0.52002 47.308 0.52002 40.9725C0.52002 34.9465 4.99842 29.9878 10.717 29.5208Z" fill="url(#paint0_linear_0_80)"/>
            <defs>
            <linearGradient id="paint0_linear_0_80" x1="27.5" y1="16.5" x2="32.02" y2="52.4613" gradientUnits="userSpaceOnUse">
            <stop stop-color="#EEFAFE"/>
            <stop offset="1" stop-color="#BACFDB"/>
            </linearGradient>
            </defs>
            </svg>`;
        break;
      case 45:
      case 48:
        return `<svg xmlns="http://www.w3.org/2000/svg" class="weather-icon" width="64" height="64" viewBox="0 0 64 64" fill="none">
              <path d="M11.7314 18.6369C12.8396 8.92174 20.8632 1.43198 30.3475 1.43198C38.7372 1.43198 46.0186 7.15696 48.3469 15.4656C48.3977 15.4568 48.4536 15.4603 48.5061 15.4532C48.9823 15.395 49.4635 15.3526 49.955 15.3526C56.6094 15.3526 62.02 20.9911 62.02 27.9197C62.02 34.8483 56.6094 40.485 49.955 40.485H12.5244C6.73252 40.485 2.02002 35.5771 2.02002 29.5433C2.02002 23.8042 6.28516 19.0816 11.7314 18.6369Z" fill="url(#paint3_linear_0_93)"/>
              <rect x="12" y="44" width="30" height="4" rx="2" fill="url(#paint3_linear_0_93)" fill-opacity="0.7"/>
              <rect x="22" y="52" width="30" height="4" rx="2" fill="url(#paint3_linear_0_93)" fill-opacity="0.5"/>
              <defs>
                <linearGradient id="paint3_linear_0_93" x1="27.7152" y1="6.23612" x2="32.02" y2="40.485" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#EEFAFE"/>
                  <stop offset="1" stop-color="#BACFDB"/>
                </linearGradient>
              </defs>
            </svg>`;
        break;
      case 51:
      case 53:
      case 55:
        return `<svg xmlns="http://www.w3.org/2000/svg" class="weather-icon" width="64" height="64" viewBox="0 0 64 64" fill="none">
            <rect width="4" height="10" rx="2" transform="matrix(0.987743 0.15609 -0.156766 0.987636 40 44)" fill="url(#paint0_radial_0_93)" fill-opacity="0.9"/>
            <rect width="4" height="16" rx="2" transform="matrix(0.987743 0.15609 -0.156766 0.987636 30 43)" fill="url(#paint1_radial_0_93)" fill-opacity="0.9"/>
            <rect width="4" height="11" rx="2" transform="matrix(0.987743 0.15609 -0.156766 0.987636 19 44)" fill="url(#paint2_radial_0_93)" fill-opacity="0.9"/>
            <path d="M11.7314 18.6369C12.8396 8.92174 20.8632 1.43198 30.3475 1.43198C38.7372 1.43198 46.0186 7.15696 48.3469 15.4656C48.3977 15.4568 48.4536 15.4603 48.5061 15.4532C48.9823 15.395 49.4635 15.3526 49.955 15.3526C56.6094 15.3526 62.02 20.9911 62.02 27.9197C62.02 34.8483 56.6094 40.485 49.955 40.485H12.5244C6.73252 40.485 2.02002 35.5771 2.02002 29.5433C2.02002 23.8042 6.28516 19.0816 11.7314 18.6369Z" fill="url(#paint3_linear_0_93)"/>
            <defs>
            <radialGradient id="paint0_radial_0_93" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(2.014 -0.282296) rotate(89.2794) scale(13.612 4.41853)">
            <stop offset="0.239583" stop-color="#B7E9FE"/>
            <stop offset="1" stop-color="#5ECFFF"/>
            </radialGradient>
            <radialGradient id="paint1_radial_0_93" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(2.014 -0.451673) rotate(89.5496) scale(21.7781 4.41875)">
            <stop offset="0.239583" stop-color="#B7E9FE"/>
            <stop offset="1" stop-color="#5ECFFF"/>
            </radialGradient>
            <radialGradient id="paint2_radial_0_93" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(2.014 -0.310525) rotate(89.3449) scale(14.973 4.41859)">
            <stop offset="0.239583" stop-color="#B7E9FE"/>
            <stop offset="1" stop-color="#5ECFFF"/>
            </radialGradient>
            <linearGradient id="paint3_linear_0_93" x1="27.7152" y1="6.23612" x2="32.02" y2="40.485" gradientUnits="userSpaceOnUse">
            <stop stop-color="#EEFAFE"/>
            <stop offset="1" stop-color="#BACFDB"/>
            </linearGradient>
            </defs>
            </svg>`;
        break;
      case 56:
      case 57:
        return `<svg xmlns="http://www.w3.org/2000/svg" class="weather-icon" width="64" height="64" viewBox="0 0 64 64" fill="none">
              <rect width="4" height="11" rx="2" transform="matrix(0.987743 0.15609 -0.156766 0.987636 19 44)" fill="url(#paint2_radial_0_93)" fill-opacity="0.9"/>
              <rect width="4" height="10" rx="2" transform="matrix(0.987743 0.15609 -0.156766 0.987636 40 44)" fill="url(#paint0_radial_0_93)" fill-opacity="0.9"/>
              <g transform="translate(32, 51) rotate(9)" stroke="#B7E9FE" stroke-width="2.5" stroke-linecap="round">
                <line x1="-5" y1="0" x2="5" y2="0" />
                <line x1="0" y1="-5" x2="0" y2="5" />
                <line x1="-3.5" y1="-3.5" x2="3.5" y2="3.5" />
                <line x1="-3.5" y1="3.5" x2="3.5" y2="-3.5" />
              </g>
              <path d="M11.7314 18.6369C12.8396 8.92174 20.8632 1.43198 30.3475 1.43198C38.7372 1.43198 46.0186 7.15696 48.3469 15.4656C48.3977 15.4568 48.4536 15.4603 48.5061 15.4532C48.9823 15.395 49.4635 15.3526 49.955 15.3526C56.6094 15.3526 62.02 20.9911 62.02 27.9197C62.02 34.8483 56.6094 40.485 49.955 40.485H12.5244C6.73252 40.485 2.02002 35.5771 2.02002 29.5433C2.02002 23.8042 6.28516 19.0816 11.7314 18.6369Z" fill="url(#paint3_linear_0_93)"/>
              <defs>
                <radialGradient id="paint0_radial_0_93" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(2.014 -0.282296) rotate(89.2794) scale(13.612 4.41853)">
                  <stop offset="0.239583" stop-color="#B7E9FE"/>
                  <stop offset="1" stop-color="#5ECFFF"/>
                </radialGradient>
                <radialGradient id="paint2_radial_0_93" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(2.014 -0.310525) rotate(89.3449) scale(14.973 4.41859)">
                  <stop offset="0.239583" stop-color="#B7E9FE"/>
                  <stop offset="1" stop-color="#5ECFFF"/>
                </radialGradient>
                <linearGradient id="paint3_linear_0_93" x1="27.7152" y1="6.23612" x2="32.02" y2="40.485" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#EEFAFE"/>
                  <stop offset="1" stop-color="#BACFDB"/>
                </linearGradient>
              </defs>
            </svg>`;
        break;
      case 61:
      case 63:
      case 65:
      case 80:
      case 81:
      case 82:
        return `<svg xmlns="http://www.w3.org/2000/svg" class="weather-icon" width="64" height="64" viewBox="0 0 64 64" fill="none">
            <rect width="4" height="16" rx="2" transform="matrix(0.987743 0.15609 -0.156766 0.987636 46 43)" fill="url(#paint0_radial_0_176)" fill-opacity="0.9"/>
            <rect width="4" height="10" rx="2" transform="matrix(0.987743 0.15609 -0.156766 0.987636 35 44)" fill="url(#paint1_radial_0_176)" fill-opacity="0.9"/>
            <rect width="4" height="16" rx="2" transform="matrix(0.987743 0.15609 -0.156766 0.987636 25 43)" fill="url(#paint2_radial_0_176)" fill-opacity="0.9"/>
            <rect width="4" height="11" rx="2" transform="matrix(0.987743 0.15609 -0.156766 0.987636 13 44)" fill="url(#paint3_radial_0_176)" fill-opacity="0.9"/>
            <path d="M11.7314 18.6369C12.8396 8.92174 20.8632 1.43198 30.3475 1.43198C38.7372 1.43198 46.0186 7.15696 48.3469 15.4656C48.3977 15.4568 48.4536 15.4603 48.5061 15.4532C48.9823 15.395 49.4635 15.3526 49.955 15.3526C56.6094 15.3526 62.02 20.9911 62.02 27.9197C62.02 34.8483 56.6094 40.485 49.955 40.485H12.5244C6.73252 40.485 2.02002 35.5771 2.02002 29.5433C2.02002 23.8042 6.28516 19.0816 11.7314 18.6369Z" fill="url(#paint4_linear_0_176)"/>
            <defs>
            <radialGradient id="paint0_radial_0_176" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(2.014 -0.451673) rotate(89.5496) scale(21.7781 4.41875)">
            <stop offset="0.239583" stop-color="#B7E9FE"/>
            <stop offset="1" stop-color="#5ECFFF"/>
            </radialGradient>
            <radialGradient id="paint1_radial_0_176" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(2.014 -0.282296) rotate(89.2794) scale(13.612 4.41853)">
            <stop offset="0.239583" stop-color="#B7E9FE"/>
            <stop offset="1" stop-color="#5ECFFF"/>
            </radialGradient>
            <radialGradient id="paint2_radial_0_176" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(2.014 -0.451673) rotate(89.5496) scale(21.7781 4.41875)">
            <stop offset="0.239583" stop-color="#B7E9FE"/>
            <stop offset="1" stop-color="#5ECFFF"/>
            </radialGradient>
            <radialGradient id="paint3_radial_0_176" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(2.014 -0.310525) rotate(89.3449) scale(14.973 4.41859)">
            <stop offset="0.239583" stop-color="#B7E9FE"/>
            <stop offset="1" stop-color="#5ECFFF"/>
            </radialGradient>
            <linearGradient id="paint4_linear_0_176" x1="27.7152" y1="6.23612" x2="32.02" y2="40.485" gradientUnits="userSpaceOnUse">
            <stop stop-color="#EEFAFE"/>
            <stop offset="1" stop-color="#BACFDB"/>
            </linearGradient>
            </defs>
            </svg>`;
        break;
      case 66:
      case 67:
        return `<svg xmlns="http://www.w3.org/2000/svg" class="weather-icon" width="64" height="64" viewBox="0 0 64 64" fill="none">
            <rect width="4" height="16" rx="2" transform="matrix(0.987743 0.15609 -0.156766 0.987636 46 43)" fill="url(#paint0_radial_0_176)" fill-opacity="0.9"/>
            <g transform="translate(37, 51) rotate(9)" stroke="#B7E9FE" stroke-width="2.5" stroke-linecap="round">
            <line x1="-5" y1="0" x2="5" y2="0" />
            <line x1="0" y1="-5" x2="0" y2="5" />
            <line x1="-3.5" y1="-3.5" x2="3.5" y2="3.5" />
            <line x1="-3.5" y1="3.5" x2="3.5" y2="-3.5" />
            </g>
            <rect width="4" height="16" rx="2" transform="matrix(0.987743 0.15609 -0.156766 0.987636 25 43)" fill="url(#paint2_radial_0_176)" fill-opacity="0.9"/>
            <rect width="4" height="11" rx="2" transform="matrix(0.987743 0.15609 -0.156766 0.987636 13 44)" fill="url(#paint3_radial_0_176)" fill-opacity="0.9"/>
            <path d="M11.7314 18.6369C12.8396 8.92174 20.8632 1.43198 30.3475 1.43198C38.7372 1.43198 46.0186 7.15696 48.3469 15.4656C48.3977 15.4568 48.4536 15.4603 48.5061 15.4532C48.9823 15.395 49.4635 15.3526 49.955 15.3526C56.6094 15.3526 62.02 20.9911 62.02 27.9197C62.02 34.8483 56.6094 40.485 49.955 40.485H12.5244C6.73252 40.485 2.02002 35.5771 2.02002 29.5433C2.02002 23.8042 6.28516 19.0816 11.7314 18.6369Z" fill="url(#paint4_linear_0_176)"/>
            <defs>
            <radialGradient id="paint0_radial_0_176" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(2.014 -0.451673) rotate(89.5496) scale(21.7781 4.41875)">
            <stop offset="0.239583" stop-color="#B7E9FE"/>
            <stop offset="1" stop-color="#5ECFFF"/>
            </radialGradient>
            <radialGradient id="paint2_radial_0_176" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(2.014 -0.451673) rotate(89.5496) scale(21.7781 4.41875)">
            <stop offset="0.239583" stop-color="#B7E9FE"/>
            <stop offset="1" stop-color="#5ECFFF"/>
            </radialGradient>
            <radialGradient id="paint3_radial_0_176" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(2.014 -0.310525) rotate(89.3449) scale(14.973 4.41859)">
            <stop offset="0.239583" stop-color="#B7E9FE"/>
            <stop offset="1" stop-color="#5ECFFF"/>
            </radialGradient>
            <linearGradient id="paint4_linear_0_176" x1="27.7152" y1="6.23612" x2="32.02" y2="40.485" gradientUnits="userSpaceOnUse">
            <stop stop-color="#EEFAFE"/>
            <stop offset="1" stop-color="#BACFDB"/>
            </linearGradient>
            </defs>
            </svg>`;
        break;
      case 71:
      case 85:
        return `<svg xmlns="http://www.w3.org/2000/svg" class="weather-icon" width="64" height="64" viewBox="0 0 64 64" fill="none">
            <g transform="translate(18, 48) rotate(9)" stroke="#B7E9FE" stroke-width="2.5" stroke-linecap="round">
            <line x1="-4" y1="0" x2="4" y2="0" /><line x1="0" y1="-4" x2="0" y2="4" /><line x1="-2.8" y1="-2.8" x2="2.8" y2="2.8" /><line x1="-2.8" y1="2.8" x2="2.8" y2="-2.8" />
            </g>
            <g transform="translate(32, 53) rotate(9)" stroke="#B7E9FE" stroke-width="2.5" stroke-linecap="round">
            <line x1="-5" y1="0" x2="5" y2="0" /><line x1="0" y1="-5" x2="0" y2="5" /><line x1="-3.5" y1="-3.5" x2="3.5" y2="3.5" /><line x1="-3.5" y1="3.5" x2="3.5" y2="-3.5" />
            </g>
            <g transform="translate(46, 48) rotate(9)" stroke="#B7E9FE" stroke-width="2.5" stroke-linecap="round">
            <line x1="-4" y1="0" x2="4" y2="0" /><line x1="0" y1="-4" x2="0" y2="4" /><line x1="-2.8" y1="-2.8" x2="2.8" y2="2.8" /><line x1="-2.8" y1="2.8" x2="2.8" y2="-2.8" />
            </g>
            <path d="M11.7314 18.6369C12.8396 8.92174 20.8632 1.43198 30.3475 1.43198C38.7372 1.43198 46.0186 7.15696 48.3469 15.4656C48.3977 15.4568 48.4536 15.4603 48.5061 15.4532C48.9823 15.395 49.4635 15.3526 49.955 15.3526C56.6094 15.3526 62.02 20.9911 62.02 27.9197C62.02 34.8483 56.6094 40.485 49.955 40.485H12.5244C6.73252 40.485 2.02002 35.5771 2.02002 29.5433C2.02002 23.8042 6.28516 19.0816 11.7314 18.6369Z" fill="url(#paint4_linear_0_176)"/>
            <defs>
            <linearGradient id="paint4_linear_0_176" x1="27.7152" y1="6.23612" x2="32.02" y2="40.485" gradientUnits="userSpaceOnUse">
            <stop stop-color="#EEFAFE"/><stop offset="1" stop-color="#BACFDB"/>
            </linearGradient>
            </defs>
            </svg>`;
        break;
      case 73:
      case 75:
      case 86:
        return `<svg xmlns="http://www.w3.org/2000/svg" class="weather-icon" width="64" height="64" viewBox="0 0 64 64" fill="none">
            <g transform="translate(16, 46) rotate(9)" stroke="#B7E9FE" stroke-width="2.2" stroke-linecap="round">
            <line x1="-4" y1="0" x2="4" y2="0" /><line x1="0" y1="-4" x2="0" y2="4" /><line x1="-2.8" y1="-2.8" x2="2.8" y2="2.8" /><line x1="-2.8" y1="2.8" x2="2.8" y2="-2.8" />
            </g>
            <g transform="translate(28, 54) rotate(9)" stroke="#B7E9FE" stroke-width="2.2" stroke-linecap="round">
            <line x1="-4" y1="0" x2="4" y2="0" /><line x1="0" y1="-4" x2="0" y2="4" /><line x1="-2.8" y1="-2.8" x2="2.8" y2="2.8" /><line x1="-2.8" y1="2.8" x2="2.8" y2="-2.8" />
            </g>
            <g transform="translate(40, 46) rotate(9)" stroke="#B7E9FE" stroke-width="2.2" stroke-linecap="round">
            <line x1="-4" y1="0" x2="4" y2="0" /><line x1="0" y1="-4" x2="0" y2="4" /><line x1="-2.8" y1="-2.8" x2="2.8" y2="2.8" /><line x1="-2.8" y1="2.8" x2="2.8" y2="-2.8" />
            </g>
            <g transform="translate(52, 54) rotate(9)" stroke="#B7E9FE" stroke-width="2.2" stroke-linecap="round">
            <line x1="-4" y1="0" x2="4" y2="0" /><line x1="0" y1="-4" x2="0" y2="4" /><line x1="-2.8" y1="-2.8" x2="2.8" y2="2.8" /><line x1="-2.8" y1="2.8" x2="2.8" y2="-2.8" />
            </g>
            <path d="M11.7314 18.6369C12.8396 8.92174 20.8632 1.43198 30.3475 1.43198C38.7372 1.43198 46.0186 7.15696 48.3469 15.4656C48.3977 15.4568 48.4536 15.4603 48.5061 15.4532C48.9823 15.395 49.4635 15.3526 49.955 15.3526C56.6094 15.3526 62.02 20.9911 62.02 27.9197C62.02 34.8483 56.6094 40.485 49.955 40.485H12.5244C6.73252 40.485 2.02002 35.5771 2.02002 29.5433C2.02002 23.8042 6.28516 19.0816 11.7314 18.6369Z" fill="url(#paint4_linear_0_176)"/>
            <defs>
            <linearGradient id="paint4_linear_0_176" x1="27.7152" y1="6.23612" x2="32.02" y2="40.485" gradientUnits="userSpaceOnUse">
            <stop stop-color="#EEFAFE"/><stop offset="1" stop-color="#BACFDB"/>
            </linearGradient>
            </defs>
            </svg>`;
        break;
      case 77:
        return `<svg xmlns="http://www.w3.org/2000/svg" class="weather-icon" width="64" height="64" viewBox="0 0 64 64" fill="none">
              <circle cx="16" cy="48" r="2.5" fill="url(#paint2_radial_0_176)" fill-opacity="0.9"/>
              <circle cx="28" cy="54" r="2.5" fill="url(#paint1_radial_0_176)" fill-opacity="0.9"/>
              <circle cx="40" cy="48" r="2.5" fill="url(#paint0_radial_0_176)" fill-opacity="0.9"/>
              <circle cx="52" cy="54" r="2.5" fill="url(#paint2_radial_0_176)" fill-opacity="0.9"/>
              <path d="M11.7314 18.6369C12.8396 8.92174 20.8632 1.43198 30.3475 1.43198C38.7372 1.43198 46.0186 7.15696 48.3469 15.4656C48.3977 15.4568 48.4536 15.4603 48.5061 15.4532C48.9823 15.395 49.4635 15.3526 49.955 15.3526C56.6094 15.3526 62.02 20.9911 62.02 27.9197C62.02 34.8483 56.6094 40.485 49.955 40.485H12.5244C6.73252 40.485 2.02002 35.5771 2.02002 29.5433C2.02002 23.8042 6.28516 19.0816 11.7314 18.6369Z" fill="url(#paint4_linear_0_176)"/>
              <defs>
                <radialGradient id="paint0_radial_0_176" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(2.014 -0.451673) rotate(89.5496) scale(21.7781 4.41875)">
                  <stop offset="0.239583" stop-color="#B7E9FE"/>
                  <stop offset="1" stop-color="#5ECFFF"/>
                </radialGradient>
                <radialGradient id="paint1_radial_0_176" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(2.014 -0.451673) rotate(89.5496) scale(21.7781 4.41875)">
                  <stop offset="0.239583" stop-color="#B7E9FE"/>
                  <stop offset="1" stop-color="#5ECFFF"/>
                </radialGradient>
                <radialGradient id="paint2_radial_0_176" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(2.014 -0.451673) rotate(89.5496) scale(21.7781 4.41875)">
                  <stop offset="0.239583" stop-color="#B7E9FE"/>
                  <stop offset="1" stop-color="#5ECFFF"/>
                </radialGradient>
                <linearGradient id="paint4_linear_0_176" x1="27.7152" y1="6.23612" x2="32.02" y2="40.485" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#EEFAFE"/>
                  <stop offset="1" stop-color="#BACFDB"/>
                </linearGradient>
              </defs>
            </svg>`;
        break;
      case 95:
        return `<svg xmlns="http://www.w3.org/2000/svg" class="weather-icon" width="64" height="64" viewBox="0 -5 70 70" fill="none">
            <defs>
            <linearGradient id="cloudRear1" x1="27.7" y1="6.2" x2="32" y2="40.5" gradientUnits="userSpaceOnUse">
            <stop stop-color="#455A64"/>
            <stop offset="1" stop-color="#263238"/>
            </linearGradient>
            <linearGradient id="cloudFront1" x1="27.7" y1="6.2" x2="32" y2="40.5" gradientUnits="userSpaceOnUse">
            <stop stop-color="#78909C"/>
            <stop offset="1" stop-color="#455A64"/>
            </linearGradient>
            <radialGradient id="rain1" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(2 -0.3) rotate(89) scale(15 4.5)">
            <stop offset="0.2" stop-color="#B7E9FE"/>
            <stop offset="1" stop-color="#5ECFFF"/>
            </radialGradient>
            </defs>
            <path d="M16.7 13.6C17.8 3.9 25.8 -3.5 35.3 -3.5C43.7 -3.5 51 2.1 53.3 10.4C55 10.3 67 15.9 67 22.9C67 29.8 61.6 35.4 54.9 35.4H17.5C11.7 35.4 7 30.5 7 24.5C7 18.8 11.2 14 16.7 13.6Z" fill="url(#cloudRear1)" opacity="0.6"/>
            <rect width="3.5" height="10" rx="1.7" transform="matrix(0.98 0.15 -0.15 0.98 12 44)" fill="url(#rain1)"/>
            <rect width="3.5" height="10" rx="1.7" transform="matrix(0.98 0.15 -0.15 0.98 24 48)" fill="url(#rain1)"/>
            <rect width="3.5" height="10" rx="1.7" transform="matrix(0.98 0.15 -0.15 0.98 40 48)" fill="url(#rain1)"/>
            <rect width="3.5" height="10" rx="1.7" transform="matrix(0.98 0.15 -0.15 0.98 52 44)" fill="url(#rain1)"/>
            <path d="M32 30L26 44H34L28 60L42 40H34L40 30H32Z" fill="#FFD700" stroke="#F1C40F" stroke-width="1" stroke-linejoin="round"/>
            <path d="M11.7 18.6C12.8 8.9 20.8 1.4 30.3 1.4C38.7 1.4 46 7.1 48.3 15.4C48.5 15.4 49.9 15.3 49.9 15.3C56.6 15.3 62 20.9 62 27.9C62 34.8 56.6 40.4 49.9 40.4H12.5C6.7 40.4 2 35.5 2 29.5C2 23.8 6.2 19 11.7 18.6Z" fill="url(#cloudFront1)"/>
            </svg>`;
        break;
      case 96:
      case 99:
        return `<svg xmlns="http://www.w3.org/2000/svg" class="weather-icon" width="64" height="64" viewBox="0 -5 70 70" fill="none">
            <defs>
            <linearGradient id="cloudRear2" x1="27.7" y1="6.2" x2="32" y2="40.5" gradientUnits="userSpaceOnUse">
            <stop stop-color="#455A64"/>
            <stop offset="1" stop-color="#263238"/>
            </linearGradient>
            <linearGradient id="cloudFront2" x1="27.7" y1="6.2" x2="32" y2="40.5" gradientUnits="userSpaceOnUse">
            <stop stop-color="#78909C"/>
            <stop offset="1" stop-color="#455A64"/>
            </linearGradient>
            <radialGradient id="hail2" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(2 -0.3) rotate(89) scale(15 4.5)">
            <stop offset="0.2" stop-color="#FFFFFF"/>
            <stop offset="1" stop-color="#B7E9FE"/>
            </radialGradient>
            </defs>
            <path d="M16.7 13.6C17.8 3.9 25.8 -3.5 35.3 -3.5C43.7 -3.5 51 2.1 53.3 10.4C55 10.3 67 15.9 67 22.9C67 29.8 61.6 35.4 54.9 35.4H17.5C11.7 35.4 7 30.5 7 24.5C7 18.8 11.2 14 16.7 13.6Z" fill="url(#cloudRear2)" opacity="0.6"/>
            <circle cx="12" cy="48" r="2.5" fill="url(#hail2)"/>
            <circle cx="22" cy="54" r="3" fill="url(#hail2)"/>
            <circle cx="32" cy="50" r="2.2" fill="url(#hail2)"/>
            <circle cx="42" cy="56" r="3.2" fill="url(#hail2)"/>
            <circle cx="54" cy="48" r="2.5" fill="url(#hail2)"/>
            <path d="M32 30L26 44H34L28 60L42 40H34L40 30H32Z" fill="#FFD700" stroke="#F1C40F" stroke-width="1" stroke-linejoin="round"/>
            <path d="M11.7 18.6C12.8 8.9 20.8 1.4 30.3 1.4C38.7 1.4 46 7.1 48.3 15.4C48.5 15.4 49.9 15.3 49.9 15.3C56.6 15.3 62 20.9 62 27.9C62 34.8 56.6 40.4 49.9 40.4H12.5C6.7 40.4 2 35.5 2 29.5C2 23.8 6.2 19 11.7 18.6Z" fill="url(#cloudFront2)"/>
            </svg>`;
        break;
      default:
        return '';
    }
  };
  for (let i = 0; i < 15; i++) {
    let weatherDay;
    const dateCounterOne = new Date();
    dateCounterOne.setDate(dateCounterOne.getDate() + i + 1);
    const tagFormatiertOne = String(dateCounterOne.getDate()).padStart(2, '0');
    const monatFormatiertOne = String(dateCounterOne.getMonth() + 1).padStart(
      2,
      '0',
    );
    if (i < 7) {
      weatherDay = `<div class="tag">
            <div class="tag-content">
              <div class="wochentag">${daysOfWeek[weekIndex]}</div>
              <div class="daily-content">
                <span class="max-temperature">${Math.round(dailyMaxTemperatures[i])}°</span>
                <div class="weather-icon-box">${weatherIcon(dailyWeathercodes[i], 1)}</div>
                <span class="min-temperature">${Math.round(dailyMinTemperatures[i])}°</span>
              </div>
            </div>
          </div>`;
    } else if (window.innerWidth > 955) {
      weatherDay = `<div class="tag">
            <div class="tag-content">
              <div class="datum">${tagFormatiertOne}.${monatFormatiertOne}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>
              <div class="daily-content">
                <span class="max-temperature">${Math.round(dailyMaxTemperatures[i])}°</span>
                <div class="weather-icon-box">${weatherIcon(dailyWeathercodes[i], 1)}</div>
                <span class="min-temperature">${Math.round(dailyMinTemperatures[i])}°</span>
              </div>
            </div>
          </div>`;
    } else {
      weatherDay = `<div class="tag">
            <div class="tag-content">
              <div class="datum">${tagFormatiertOne}.${monatFormatiertOne}</div>
              <div class="daily-content">
                <span class="max-temperature">${Math.round(dailyMaxTemperatures[i])}°</span>
                <div class="weather-icon-box">${weatherIcon(dailyWeathercodes[i], 1)}</div>
                <span class="min-temperature">${Math.round(dailyMinTemperatures[i])}°</span>
              </div>
            </div>
          </div>`;
    }
    dailyWeather.innerHTML += weatherDay;

    const dateCounterTwo = new Date();
    dateCounterTwo.setDate(dateCounterTwo.getDate() + i + 1);
    const tagFormatiertTwo = String(dateCounterTwo.getDate()).padStart(2, '0');
    const monatFormatiertTwo = String(dateCounterTwo.getMonth() + 1).padStart(
      2,
      '0',
    );

    const sixteenWeatherDay = `<div class="tag-sechzehn">
            <div class="datum-sechzehn">${tagFormatiertTwo}.${monatFormatiertTwo}</div>
            <div class="daily-content-sechzehn">
              <span class="max-temperature">${Math.round(dailyMaxTemperatures[i])}°</span>
              ${weatherIcon(dailyWeathercodes[i], 1)}
              <span class="min-temperature">${Math.round(dailyMinTemperatures[i])}°</span>
            </div>
          </div>`;
    sixteenDaysBox.innerHTML += sixteenWeatherDay;

    weekIndex++;
    if (weekIndex === 7) {
      weekIndex = 0;
    }
  }

  //24h forecast

  const currentDateString = allData.current.time;
  const currentHour = new Date(currentDateString).getHours();
  hourlyWeather.innerHTML = ``;
  let hourlyWindspeedIcon;

  switch (localStorage.getItem('windspeedUnit') || 'kmh') {
    case 'kmh':
      hourlyWindspeedIcon = `<svg viewBox="0 0 53 42" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6.625 18H20.9792C22.0711 18 23.1385 17.6701 24.0463 17.052C24.9542 16.4339 25.6619 15.5554 26.0798 14.5276C26.4976 13.4998 26.6069 12.3688 26.394 11.2776C26.1809 10.1865 25.6551 9.18421 24.8831 8.39752C24.1108 7.61085 23.1272 7.07513 22.0562 6.85809C20.9853 6.64103 19.8752 6.75243 18.8664 7.17818C17.8576 7.60392 16.9954 8.32489 16.3888 9.24993C15.7821 10.175 15.4583 11.2625 15.4583 12.375V13.1783" stroke="#B4B4B4" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M4.41667 24.75H40.8542C42.3828 24.75 43.8772 24.2881 45.1483 23.4227C46.4194 22.5576 47.41 21.3276 47.995 19.8886C48.58 18.4497 48.7331 16.8663 48.4347 15.3387C48.1366 13.8111 47.4005 12.4079 46.3196 11.3065C45.2386 10.2052 43.8613 9.45517 42.362 9.15131C40.8628 8.84745 39.3086 9.00342 37.8963 9.59944C36.4841 10.1955 35.2768 11.2048 34.4277 12.4999C33.5784 13.7949 33.125 15.3175 33.125 16.875V18" stroke="#B4B4B4" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M5.59446 36.8182L5.57173 35.1591H5.84446L9.66264 31.2727H11.3217L7.25355 35.3864H7.13991L5.59446 36.8182ZM4.34446 40V28.3636H5.68537V40H4.34446ZM9.88991 40L6.48082 35.6818L7.43537 34.75L11.5945 40H9.88991ZM13.0476 40V31.2727H14.343V32.6364H14.4567C14.6385 32.1705 14.9321 31.8087 15.3374 31.5511C15.7427 31.2898 16.2294 31.1591 16.7976 31.1591C17.3733 31.1591 17.8525 31.2898 18.2351 31.5511C18.6214 31.8087 18.9226 32.1705 19.1385 32.6364H19.2294C19.4529 32.1856 19.7881 31.8277 20.2351 31.5625C20.6821 31.2936 21.218 31.1591 21.843 31.1591C22.6233 31.1591 23.2616 31.4034 23.7578 31.892C24.254 32.3769 24.5021 33.1326 24.5021 34.1591V40H23.1612V34.1591C23.1612 33.5152 22.9851 33.0549 22.6328 32.7784C22.2805 32.5019 21.8658 32.3636 21.3885 32.3636C20.7749 32.3636 20.2995 32.5492 19.9624 32.9205C19.6252 33.2879 19.4567 33.7538 19.4567 34.3182V40H18.093V34.0227C18.093 33.5265 17.9321 33.1269 17.6101 32.8239C17.2881 32.517 16.8733 32.3636 16.3658 32.3636C16.0173 32.3636 15.6915 32.4564 15.3885 32.642C15.0893 32.8277 14.8468 33.0852 14.6612 33.4148C14.4794 33.7405 14.3885 34.1174 14.3885 34.5455V40H13.0476ZM31.0675 27.8182L27.3175 41.75H26.0902L29.8402 27.8182H31.0675ZM33.9979 34.75V40H32.657V28.3636H33.9979V32.6364H34.1115C34.3161 32.1856 34.6229 31.8277 35.032 31.5625C35.4448 31.2936 35.9941 31.1591 36.6797 31.1591C37.2744 31.1591 37.7952 31.2784 38.2422 31.517C38.6892 31.7519 39.0357 32.1136 39.282 32.6023C39.532 33.0871 39.657 33.7045 39.657 34.4545V40H38.3161V34.5455C38.3161 33.8523 38.1361 33.3163 37.7763 32.9375C37.4202 32.5549 36.9259 32.3636 36.2933 32.3636C35.8539 32.3636 35.46 32.4564 35.1115 32.642C34.7668 32.8277 34.4941 33.0985 34.2933 33.4545C34.0964 33.8106 33.9979 34.2424 33.9979 34.75Z" fill="#B4B4B4"/>
        </svg>`;
      break;
    case 'mph':
      hourlyWindspeedIcon = `<svg viewBox="0 0 53 44" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6.625 18H20.9792C22.0711 18 23.1385 17.6701 24.0463 17.052C24.9542 16.4339 25.6619 15.5554 26.0798 14.5276C26.4976 13.4997 26.6069 12.3688 26.394 11.2776C26.1809 10.1865 25.6551 9.18421 24.8831 8.39752C24.1108 7.61085 23.1272 7.07512 22.0562 6.85809C20.9853 6.64103 19.8752 6.75243 18.8664 7.17817C17.8576 7.60392 16.9954 8.32489 16.3888 9.24993C15.7821 10.1749 15.4583 11.2625 15.4583 12.375V13.1782" stroke="#B4B4B4" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M4.41667 24.75H40.8542C42.3828 24.75 43.8772 24.2881 45.1483 23.4227C46.4194 22.5576 47.41 21.3276 47.995 19.8886C48.58 18.4497 48.7331 16.8663 48.4347 15.3387C48.1366 13.8111 47.4005 12.4079 46.3196 11.3065C45.2386 10.2052 43.8613 9.45517 42.362 9.15131C40.8628 8.84745 39.3086 9.00342 37.8963 9.59944C36.4841 10.1955 35.2768 11.2048 34.4277 12.4999C33.5784 13.7949 33.125 15.3175 33.125 16.875V18" stroke="#B4B4B4" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M4.17259 40V31.2727H5.46804V32.6364H5.58168C5.76349 32.1705 6.05705 31.8087 6.46236 31.5511C6.86766 31.2898 7.3544 31.1591 7.92259 31.1591C8.49834 31.1591 8.97751 31.2898 9.36009 31.5511C9.74645 31.8087 10.0476 32.1705 10.2635 32.6364H10.3544C10.5779 32.1856 10.9131 31.8277 11.3601 31.5625C11.8071 31.2936 12.343 31.1591 12.968 31.1591C13.7483 31.1591 14.3866 31.4034 14.8828 31.892C15.379 32.3769 15.6271 33.1326 15.6271 34.1591V40H14.2862V34.1591C14.2862 33.5152 14.1101 33.0549 13.7578 32.7784C13.4055 32.5019 12.9908 32.3636 12.5135 32.3636C11.8999 32.3636 11.4245 32.5492 11.0874 32.9205C10.7502 33.2879 10.5817 33.7538 10.5817 34.3182V40H9.21804V34.0227C9.21804 33.5265 9.05706 33.1269 8.73509 32.8239C8.41312 32.517 7.99834 32.3636 7.49077 32.3636C7.14228 32.3636 6.81652 32.4564 6.51349 32.642C6.21425 32.8277 5.97183 33.0852 5.78622 33.4148C5.6044 33.7405 5.51349 34.1174 5.51349 34.5455V40H4.17259ZM18.0788 43.2727V31.2727H19.3743V32.6591H19.5334C19.6319 32.5076 19.7682 32.3144 19.9425 32.0795C20.1205 31.8409 20.3743 31.6288 20.7038 31.4432C21.0372 31.2538 21.4879 31.1591 22.0561 31.1591C22.791 31.1591 23.4387 31.3428 23.9993 31.7102C24.5599 32.0777 24.9974 32.5985 25.3118 33.2727C25.6262 33.947 25.7834 34.7424 25.7834 35.6591C25.7834 36.5833 25.6262 37.3845 25.3118 38.0625C24.9974 38.7367 24.5618 39.2595 24.005 39.6307C23.4482 39.9981 22.8061 40.1818 22.0788 40.1818C21.5182 40.1818 21.0694 40.089 20.7322 39.9034C20.3951 39.714 20.1357 39.5 19.9538 39.2614C19.772 39.0189 19.6319 38.8182 19.5334 38.6591H19.4197V43.2727H18.0788ZM19.397 35.6364C19.397 36.2955 19.4936 36.8769 19.6868 37.3807C19.88 37.8807 20.1622 38.2727 20.5334 38.5568C20.9046 38.8371 21.3591 38.9773 21.897 38.9773C22.4576 38.9773 22.9254 38.8295 23.3004 38.5341C23.6792 38.2348 23.9633 37.8333 24.1527 37.3295C24.3459 36.822 24.4425 36.2576 24.4425 35.6364C24.4425 35.0227 24.3478 34.4697 24.1584 33.9773C23.9728 33.4811 23.6906 33.089 23.3118 32.8011C22.9368 32.5095 22.4652 32.3636 21.897 32.3636C21.3516 32.3636 20.8932 32.5019 20.522 32.7784C20.1508 33.0511 19.8705 33.4337 19.6811 33.9261C19.4917 34.4148 19.397 34.9848 19.397 35.6364ZM29.1697 34.75V40H27.8288V28.3636H29.1697V32.6364H29.2834C29.4879 32.1856 29.7947 31.8277 30.2038 31.5625C30.6167 31.2936 31.166 31.1591 31.8516 31.1591C32.4463 31.1591 32.9671 31.2784 33.4141 31.517C33.861 31.7519 34.2076 32.1136 34.4538 32.6023C34.7038 33.0871 34.8288 33.7045 34.8288 34.4545V40H33.4879V34.5455C33.4879 33.8523 33.308 33.3163 32.9482 32.9375C32.5921 32.5549 32.0978 32.3636 31.4652 32.3636C31.0258 32.3636 30.6319 32.4564 30.2834 32.642C29.9387 32.8277 29.666 33.0985 29.4652 33.4545C29.2682 33.8106 29.1697 34.2424 29.1697 34.75Z" fill="#B4B4B4"/>
        </svg>`;
      break;
    case 'kn':
      hourlyWindspeedIcon = `<svg viewBox="0 0 53 42" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6.625 18H20.9792C22.0711 18 23.1385 17.6701 24.0463 17.052C24.9542 16.4339 25.6619 15.5554 26.0798 14.5276C26.4976 13.4997 26.6069 12.3688 26.394 11.2776C26.1809 10.1865 25.6551 9.18421 24.8831 8.39752C24.1108 7.61085 23.1272 7.07512 22.0562 6.85809C20.9853 6.64103 19.8752 6.75243 18.8664 7.17817C17.8576 7.60392 16.9954 8.32489 16.3888 9.24993C15.7821 10.1749 15.4583 11.2625 15.4583 12.375V13.1782" stroke="#B4B4B4" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M4.41667 24.75H40.8542C42.3828 24.75 43.8772 24.2881 45.1483 23.4227C46.4194 22.5576 47.41 21.3276 47.995 19.8886C48.58 18.4497 48.7331 16.8663 48.4347 15.3387C48.1366 13.8111 47.4005 12.4079 46.3196 11.3065C45.2386 10.2052 43.8613 9.45517 42.362 9.15131C40.8628 8.84745 39.3086 9.00342 37.8963 9.59944C36.4841 10.1955 35.2768 11.2048 34.4277 12.4999C33.5784 13.7949 33.125 15.3175 33.125 16.875V18" stroke="#B4B4B4" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M5.16477 36.8182L5.14205 35.1591H5.41477L9.23295 31.2727H10.892L6.82386 35.3864H6.71023L5.16477 36.8182ZM3.91477 40V28.3636H5.25568V40H3.91477ZM9.46023 40L6.05114 35.6818L7.00568 34.75L11.1648 40H9.46023ZM13.9588 34.75V40H12.6179V31.2727H13.9134V32.6364H14.027C14.2315 32.1932 14.5421 31.8371 14.9588 31.5682C15.3755 31.2955 15.9134 31.1591 16.5724 31.1591C17.1634 31.1591 17.6804 31.2803 18.1236 31.5227C18.5668 31.7614 18.9115 32.125 19.1577 32.6136C19.4039 33.0985 19.527 33.7121 19.527 34.4545V40H18.1861V34.5455C18.1861 33.8598 18.008 33.3258 17.652 32.9432C17.2959 32.5568 16.8073 32.3636 16.1861 32.3636C15.758 32.3636 15.3755 32.4564 15.0384 32.642C14.705 32.8277 14.4418 33.0985 14.2486 33.4545C14.0554 33.8106 13.9588 34.2424 13.9588 34.75ZM25.5227 40.1818C24.7348 40.1818 24.0436 39.9943 23.4489 39.6193C22.858 39.2443 22.3958 38.7197 22.0625 38.0455C21.733 37.3712 21.5682 36.5833 21.5682 35.6818C21.5682 34.7727 21.733 33.9792 22.0625 33.3011C22.3958 32.6231 22.858 32.0966 23.4489 31.7216C24.0436 31.3466 24.7348 31.1591 25.5227 31.1591C26.3106 31.1591 27 31.3466 27.5909 31.7216C28.1856 32.0966 28.6477 32.6231 28.9773 33.3011C29.3106 33.9792 29.4773 34.7727 29.4773 35.6818C29.4773 36.5833 29.3106 37.3712 28.9773 38.0455C28.6477 38.7197 28.1856 39.2443 27.5909 39.6193C27 39.9943 26.3106 40.1818 25.5227 40.1818ZM25.5227 38.9773C26.1212 38.9773 26.6136 38.8239 27 38.517C27.3864 38.2102 27.6723 37.8068 27.858 37.3068C28.0436 36.8068 28.1364 36.2652 28.1364 35.6818C28.1364 35.0985 28.0436 34.5549 27.858 34.0511C27.6723 33.5473 27.3864 33.1402 27 32.8295C26.6136 32.5189 26.1212 32.3636 25.5227 32.3636C24.9242 32.3636 24.4318 32.5189 24.0455 32.8295C23.6591 33.1402 23.3731 33.5473 23.1875 34.0511C23.0019 34.5549 22.9091 35.0985 22.9091 35.6818C22.9091 36.2652 23.0019 36.8068 23.1875 37.3068C23.3731 37.8068 23.6591 38.2102 24.0455 38.517C24.4318 38.8239 24.9242 38.9773 25.5227 38.9773ZM35.3196 31.2727V32.4091H30.7969V31.2727H35.3196ZM32.1151 29.1818H33.456V37.5C33.456 37.8788 33.5109 38.1629 33.6207 38.3523C33.7344 38.5379 33.8783 38.6629 34.0526 38.7273C34.2306 38.7879 34.4181 38.8182 34.6151 38.8182C34.7628 38.8182 34.884 38.8106 34.9787 38.7955C35.0734 38.7765 35.1491 38.7614 35.206 38.75L35.4787 39.9545C35.3878 39.9886 35.2609 40.0227 35.098 40.0568C34.9351 40.0947 34.7287 40.1136 34.4787 40.1136C34.0999 40.1136 33.7287 40.0322 33.3651 39.8693C33.0052 39.7064 32.706 39.4583 32.4673 39.125C32.2325 38.7917 32.1151 38.3712 32.1151 37.8636V29.1818ZM43.3622 33.2273L42.1577 33.5682C42.0819 33.3674 41.9702 33.1723 41.8224 32.983C41.6785 32.7898 41.4815 32.6307 41.2315 32.5057C40.9815 32.3807 40.6615 32.3182 40.2713 32.3182C39.7372 32.3182 39.2921 32.4413 38.9361 32.6875C38.5838 32.9299 38.4077 33.2386 38.4077 33.6136C38.4077 33.947 38.5289 34.2102 38.7713 34.4034C39.0137 34.5966 39.3925 34.7576 39.9077 34.8864L41.2031 35.2045C41.9834 35.3939 42.5649 35.6837 42.9474 36.0739C43.33 36.4602 43.5213 36.9583 43.5213 37.5682C43.5213 38.0682 43.3774 38.5152 43.0895 38.9091C42.8054 39.303 42.4077 39.6136 41.8963 39.8409C41.3849 40.0682 40.7902 40.1818 40.1122 40.1818C39.2221 40.1818 38.4853 39.9886 37.902 39.6023C37.3187 39.2159 36.9493 38.6515 36.794 37.9091L38.0668 37.5909C38.188 38.0606 38.4171 38.4129 38.7543 38.6477C39.0952 38.8826 39.5402 39 40.0895 39C40.7145 39 41.2107 38.8674 41.5781 38.6023C41.9493 38.3333 42.1349 38.0114 42.1349 37.6364C42.1349 37.3333 42.0289 37.0795 41.8168 36.875C41.6046 36.6667 41.2789 36.5114 40.8395 36.4091L39.3849 36.0682C38.5857 35.8788 37.9986 35.5852 37.6236 35.1875C37.2524 34.786 37.0668 34.2841 37.0668 33.6818C37.0668 33.1894 37.205 32.7538 37.4815 32.375C37.7618 31.9962 38.1425 31.6989 38.6236 31.483C39.1084 31.267 39.6577 31.1591 40.2713 31.1591C41.1349 31.1591 41.813 31.3485 42.3054 31.7273C42.8016 32.1061 43.1539 32.6061 43.3622 33.2273Z" fill="#B4B4B4"/>
        </svg>`;
      break;
    case 'ms':
      hourlyWindspeedIcon = `<svg viewBox="0 0 53 42" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M6.625 18H20.9792C22.0711 18 23.1385 17.6701 24.0463 17.052C24.9542 16.4339 25.6619 15.5554 26.0798 14.5276C26.4976 13.4998 26.6069 12.3688 26.394 11.2776C26.1809 10.1865 25.6551 9.18421 24.8831 8.39752C24.1108 7.61085 23.1272 7.07513 22.0562 6.85809C20.9853 6.64103 19.8752 6.75243 18.8664 7.17818C17.8576 7.60392 16.9954 8.32489 16.3888 9.24993C15.7821 10.175 15.4583 11.2625 15.4583 12.375V13.1783" stroke="#B4B4B4" stroke-width="1.5" stroke-linecap="round"/> <path d="M4.41667 24.75H40.8542C42.3828 24.75 43.8772 24.2881 45.1483 23.4227C46.4194 22.5576 47.41 21.3276 47.995 19.8886C48.58 18.4497 48.7331 16.8663 48.4347 15.3387C48.1366 13.8111 47.4005 12.4079 46.3196 11.3065C45.2386 10.2052 43.8613 9.45517 42.362 9.15131C40.8628 8.84745 39.3086 9.00342 37.8963 9.59944C36.4841 10.1955 35.2768 11.2048 34.4277 12.4999C33.5784 13.7949 33.125 15.3175 33.125 16.875V18" stroke="#B4B4B4" stroke-width="1.5" stroke-linecap="round"/> <path d="M5.2429 40V31.2727H6.53835V32.6364H6.65199C6.83381 32.1705 7.12737 31.8087 7.53267 31.5511C7.93797 31.2898 8.42472 31.1591 8.9929 31.1591C9.56866 31.1591 10.0478 31.2898 10.4304 31.5511C10.8168 31.8087 11.1179 32.1705 11.3338 32.6364H11.4247C11.6482 32.1856 11.9834 31.8277 12.4304 31.5625C12.8774 31.2936 13.4134 31.1591 14.0384 31.1591C14.8187 31.1591 15.4569 31.4034 15.9531 31.892C16.4493 32.3769 16.6974 33.1326 16.6974 34.1591V40H15.3565V34.1591C15.3565 33.5152 15.1804 33.0549 14.8281 32.7784C14.4759 32.5019 14.0611 32.3636 13.5838 32.3636C12.9702 32.3636 12.4948 32.5492 12.1577 32.9205C11.8205 33.2879 11.652 33.7538 11.652 34.3182V40H10.2884V34.0227C10.2884 33.5265 10.1274 33.1269 9.8054 32.8239C9.48343 32.517 9.06866 32.3636 8.56108 32.3636C8.21259 32.3636 7.88684 32.4564 7.58381 32.642C7.28456 32.8277 7.04214 33.0852 6.85653 33.4148C6.67472 33.7405 6.58381 34.1174 6.58381 34.5455V40H5.2429ZM23.2628 27.8182L19.5128 41.75H18.2855L22.0355 27.8182H23.2628ZM31.0341 33.2273L29.8295 33.5682C29.7538 33.3674 29.642 33.1723 29.4943 32.983C29.3504 32.7898 29.1534 32.6307 28.9034 32.5057C28.6534 32.3807 28.3333 32.3182 27.9432 32.3182C27.4091 32.3182 26.964 32.4413 26.608 32.6875C26.2557 32.9299 26.0795 33.2386 26.0795 33.6136C26.0795 33.947 26.2008 34.2102 26.4432 34.4034C26.6856 34.5966 27.0644 34.7576 27.5795 34.8864L28.875 35.2045C29.6553 35.3939 30.2367 35.6837 30.6193 36.0739C31.0019 36.4602 31.1932 36.9583 31.1932 37.5682C31.1932 38.0682 31.0492 38.5152 30.7614 38.9091C30.4773 39.303 30.0795 39.6136 29.5682 39.8409C29.0568 40.0682 28.4621 40.1818 27.7841 40.1818C26.8939 40.1818 26.1572 39.9886 25.5739 39.6023C24.9905 39.2159 24.6212 38.6515 24.4659 37.9091L25.7386 37.5909C25.8598 38.0606 26.089 38.4129 26.4261 38.6477C26.767 38.8826 27.2121 39 27.7614 39C28.3864 39 28.8826 38.8674 29.25 38.6023C29.6212 38.3333 29.8068 38.0114 29.8068 37.6364C29.8068 37.3333 29.7008 37.0795 29.4886 36.875C29.2765 36.6667 28.9508 36.5114 28.5114 36.4091L27.0568 36.0682C26.2576 35.8788 25.6705 35.5852 25.2955 35.1875C24.9242 34.786 24.7386 34.2841 24.7386 33.6818C24.7386 33.1894 24.8769 32.7538 25.1534 32.375C25.4337 31.9962 25.8144 31.6989 26.2955 31.483C26.7803 31.267 27.3295 31.1591 27.9432 31.1591C28.8068 31.1591 29.4848 31.3485 29.9773 31.7273C30.4735 32.1061 30.8258 32.6061 31.0341 33.2273Z" fill="#B4B4B4"/> </svg>`;
      break;
  }

  let counter = currentHour + 1;

  for (let i = 1; i < 25; i++) {
    if (counter === 24) {
      counter = 0;
    }

    const hourlyWeathercodePath = allData.hourly.weather_code[currentHour + i];
    const hourlyIsDay = allData.hourly.is_day;

    hourlyWeather.innerHTML += `<div class="stunde">
              <div class="uhrzeit">${counter + ':00'}</div>
              <div class="stunde-content">
                ${weatherIcon(hourlyWeathercodePath, hourlyIsDay[currentHour + i])}
                <span class="stündliche-temperatur">${Math.round(allData.hourly.temperature_2m[currentHour + i])}°</span>
                <span class="stündliche-windgeschwindigkeit">
                  ${Math.round(allData.hourly.wind_speed_10m[currentHour + i])}
                  ${hourlyWindspeedIcon}
                </span>
              </div>
            </div>`;

    counter++;
  }
  const allHours = Array.from(document.querySelectorAll('.stunde'));
  const allHoursWidth = allHours.map((el) => el.offsetWidth);
  const hourMaxWidth = Math.max(...allHoursWidth);
  allHours.forEach((el) => {
    el.style.flex = '0 0 auto';
    el.style.flexBasis = `${hourMaxWidth}px`;
  });

  //Perceived temperature
  currentPerceivedTemperature.innerText =
    Math.round(allData.current.apparent_temperature) + '°';

  //humidity
  const smallerSpanOne = document.createElement('span');
  smallerSpanOne.classList.add('smaller');
  smallerSpanOne.innerText = '%';

  currentHumidity.innerText = allData.current.relative_humidity_2m;
  currentHumidity.append(smallerSpanOne);

  //windspeed
  currentWindspeed.innerText = Math.round(allData.current.wind_speed_10m);

  const smallerSpanTwo = document.createElement('span');
  smallerSpanTwo.classList.add('smaller');
  if (localStorage.getItem('windspeedUnit') === 'ms') {
    smallerSpanTwo.innerText = 'm/s';
  } else {
    smallerSpanTwo.innerText = localStorage.getItem('windspeedUnit') || 'km/h';
  }
  currentWindspeed.append(smallerSpanTwo);

  //wind direction
  const compassSvg = document.querySelector(
    '.wind-geschwindigkeit-richtung-svg',
  );
  const windDirection = allData.current.wind_direction_10m;
  let compassSvgContent;

  switch (true) {
    case windDirection >= 337.5 || windDirection < 22.5:
      compassSvgContent = `<circle cx="12" cy="12" r="10" stroke="#FFFFFF" stroke-width="1.2"/>
        <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" stroke="#FFFFFF" stroke-width="0.8" opacity="0.5"/>
        <text x="12" y="7" text-anchor="middle" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="3.2" font-weight="bold">N</text>
        <text x="12" y="19.2" text-anchor="middle" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="3.2" font-weight="bold">S</text>
        <text x="17.8" y="13.1" text-anchor="middle" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="3.2" font-weight="bold">O</text>
        <text x="6.2" y="13.1" text-anchor="middle" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="3.2" font-weight="bold">W</text>
        <g transform="rotate(0, 12, 12)">
          <path d="M12 8L10.5 12L12 11L13.5 12L12 8Z" fill="#FF4D4D"/>
          <path d="M12 16L10.5 12L12 13L13.5 12L12 16Z" fill="#FFFFFF"/>
        </g>`;
      break;
    case windDirection >= 22.5 && windDirection < 67.5:
      compassSvgContent = `<circle cx="12" cy="12" r="10" stroke="#FFFFFF" stroke-width="1.2"/>
        <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" stroke="#FFFFFF" stroke-width="0.8" opacity="0.5"/>
        <text x="12" y="7" text-anchor="middle" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="3.2" font-weight="bold">N</text>
        <text x="12" y="19.2" text-anchor="middle" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="3.2" font-weight="bold">S</text>
        <text x="17.8" y="13.1" text-anchor="middle" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="3.2" font-weight="bold">O</text>
        <text x="6.2" y="13.1" text-anchor="middle" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="3.2" font-weight="bold">W</text>
        <g transform="rotate(45, 12, 12)">
          <path d="M12 8L10.5 12L12 11L13.5 12L12 8Z" fill="#FF4D4D"/>
          <path d="M12 16L10.5 12L12 13L13.5 12L12 16Z" fill="#FFFFFF"/>
        </g>`;
      break;
    case windDirection >= 67.5 && windDirection < 112.5:
      compassSvgContent = `<circle cx="12" cy="12" r="10" stroke="#FFFFFF" stroke-width="1.2"/>
        <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" stroke="#FFFFFF" stroke-width="0.8" opacity="0.5"/>
        <text x="12" y="7" text-anchor="middle" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="3.2" font-weight="bold">N</text>
        <text x="12" y="19.2" text-anchor="middle" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="3.2" font-weight="bold">S</text>
        <text x="17.8" y="13.1" text-anchor="middle" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="3.2" font-weight="bold">O</text>
        <text x="6.2" y="13.1" text-anchor="middle" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="3.2" font-weight="bold">W</text>
        <g transform="rotate(90, 12, 12)">
          <path d="M12 8L10.5 12L12 11L13.5 12L12 8Z" fill="#FF4D4D"/>
          <path d="M12 16L10.5 12L12 13L13.5 12L12 16Z" fill="#FFFFFF"/>
        </g>`;
      break;
    case windDirection >= 112.5 && windDirection < 157.5:
      compassSvgContent = `<circle cx="12" cy="12" r="10" stroke="#FFFFFF" stroke-width="1.2"/>
        <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" stroke="#FFFFFF" stroke-width="0.8" opacity="0.5"/>
        <text x="12" y="7" text-anchor="middle" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="3.2" font-weight="bold">N</text>
        <text x="12" y="19.2" text-anchor="middle" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="3.2" font-weight="bold">S</text>
        <text x="17.8" y="13.1" text-anchor="middle" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="3.2" font-weight="bold">O</text>
        <text x="6.2" y="13.1" text-anchor="middle" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="3.2" font-weight="bold">W</text>
        <g transform="rotate(135, 12, 12)">
          <path d="M12 8L10.5 12L12 11L13.5 12L12 8Z" fill="#FF4D4D"/>
          <path d="M12 16L10.5 12L12 13L13.5 12L12 16Z" fill="#FFFFFF"/>
        </g>`;
      break;
    case windDirection >= 157.5 && windDirection < 202.5:
      compassSvgContent = `<circle cx="12" cy="12" r="10" stroke="#FFFFFF" stroke-width="1.2"/>
        <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" stroke="#FFFFFF" stroke-width="0.8" opacity="0.5"/>
        <text x="12" y="7" text-anchor="middle" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="3.2" font-weight="bold">N</text>
        <text x="12" y="19.2" text-anchor="middle" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="3.2" font-weight="bold">S</text>
        <text x="17.8" y="13.1" text-anchor="middle" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="3.2" font-weight="bold">O</text>
        <text x="6.2" y="13.1" text-anchor="middle" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="3.2" font-weight="bold">W</text>
        <g transform="rotate(180, 12, 12)">
          <path d="M12 8L10.5 12L12 11L13.5 12L12 8Z" fill="#FF4D4D"/>
          <path d="M12 16L10.5 12L12 13L13.5 12L12 16Z" fill="#FFFFFF"/>
        </g>`;
      break;
    case windDirection >= 202.5 && windDirection < 247.5:
      compassSvgContent = `<circle cx="12" cy="12" r="10" stroke="#FFFFFF" stroke-width="1.2"/>
        <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" stroke="#FFFFFF" stroke-width="0.8" opacity="0.5"/>
        <text x="12" y="7" text-anchor="middle" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="3.2" font-weight="bold">N</text>
        <text x="12" y="19.2" text-anchor="middle" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="3.2" font-weight="bold">S</text>
        <text x="17.8" y="13.1" text-anchor="middle" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="3.2" font-weight="bold">O</text>
        <text x="6.2" y="13.1" text-anchor="middle" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="3.2" font-weight="bold">W</text>
        <g transform="rotate(225, 12, 12)">
          <path d="M12 8L10.5 12L12 11L13.5 12L12 8Z" fill="#FF4D4D"/>
          <path d="M12 16L10.5 12L12 13L13.5 12L12 16Z" fill="#FFFFFF"/>
        </g>`;
      break;
    case windDirection >= 247.5 && windDirection < 292.5:
      compassSvgContent = `<circle cx="12" cy="12" r="10" stroke="#FFFFFF" stroke-width="1.2"/>
        <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" stroke="#FFFFFF" stroke-width="0.8" opacity="0.5"/>
        <text x="12" y="7" text-anchor="middle" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="3.2" font-weight="bold">N</text>
        <text x="12" y="19.2" text-anchor="middle" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="3.2" font-weight="bold">S</text>
        <text x="17.8" y="13.1" text-anchor="middle" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="3.2" font-weight="bold">O</text>
        <text x="6.2" y="13.1" text-anchor="middle" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="3.2" font-weight="bold">W</text>
        <g transform="rotate(270, 12, 12)">
          <path d="M12 8L10.5 12L12 11L13.5 12L12 8Z" fill="#FF4D4D"/>
          <path d="M12 16L10.5 12L12 13L13.5 12L12 16Z" fill="#FFFFFF"/>
        </g>`;
      break;
    case windDirection >= 292.5 && windDirection < 337.5:
      compassSvgContent = `<circle cx="12" cy="12" r="10" stroke="#FFFFFF" stroke-width="1.2"/>
        <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" stroke="#FFFFFF" stroke-width="0.8" opacity="0.5"/>
        <text x="12" y="7" text-anchor="middle" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="3.2" font-weight="bold">N</text>
        <text x="12" y="19.2" text-anchor="middle" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="3.2" font-weight="bold">S</text>
        <text x="17.8" y="13.1" text-anchor="middle" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="3.2" font-weight="bold">O</text>
        <text x="6.2" y="13.1" text-anchor="middle" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="3.2" font-weight="bold">W</text>
        <g transform="rotate(315, 12, 12)">
          <path d="M12 8L10.5 12L12 11L13.5 12L12 8Z" fill="#FF4D4D"/>
          <path d="M12 16L10.5 12L12 13L13.5 12L12 16Z" fill="#FFFFFF"/>
        </g>`;
      break;
  }

  compassSvg.innerHTML = compassSvgContent;
}

//loading screen

const loadingSection = document.querySelector('.loading-screen');
const loadingCircle = document.querySelectorAll('.loading');
const loadingLogo = document.querySelector('.logo-box');
