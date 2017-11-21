import { ToasterConfig } from 'angular2-toaster';

export const toasterConfig: ToasterConfig =
  new ToasterConfig({
    tapToDismiss: true,
    timeout: 5000
});

export const bsdatepickerConfig = {
    containerClass: 'theme-dark-blue',
    minDate : null,
    showWeekNumbers: false,
    locale: 'es',
    dateInputFormat: 'DD-MM-YYYY'
};


