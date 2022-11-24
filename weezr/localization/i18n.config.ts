import i18n, { LanguageDetectorModule } from "i18next";
import { initReactI18next } from "react-i18next";
import { getLocales } from 'react-native-localize';
import { en, fr } from "./translations";
import { checkIsValidLanguage } from "../toolbox/toolbox";
import { ILanguage } from "../entities";

const locales = getLocales();
const systemLanguage = (locales?.length && locales[0]?.languageCode) || '';
const defaultLang = 'en';

let lng = defaultLang;
if (checkIsValidLanguage(systemLanguage as ILanguage)) {
    lng = systemLanguage;
}

console.log('INIT - Used system language ===> ', lng);

const resources = {
    en: {
        translation: en
    },
    fr: {
        translation: fr
    }
};

const languageDetector: LanguageDetectorModule = {
    type: 'languageDetector',
    init: () => {},
    cacheUserLanguage: () => {},
    detect: () => lng
};

i18n
    .use(initReactI18next)
    .use(languageDetector)
    .init({
        compatibilityJSON: 'v3', // For fix Android bug
        resources,
        // lng, // if you're using a language detector, do not define the lng option
        fallbackLng: defaultLang,
        interpolation: {
            escapeValue: false, // not needed for react
        }
    });

export default i18n;
