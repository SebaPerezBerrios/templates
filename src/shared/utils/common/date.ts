import { addMilliseconds, format, startOfDay, subMilliseconds } from 'date-fns';
import { getTimezoneOffset } from 'date-fns-tz';
import { es } from 'date-fns/locale';

export const startOfDayChile = () => {
  const offset = getTimezoneOffset('America/Santiago', new Date());
  const date = subMilliseconds(startOfDay(addMilliseconds(new Date(), offset)), offset);
  return date;
};

export const formatDateChile = (formatString: string) => {
  const date = new Date();
  return format(addMilliseconds(date, getTimezoneOffset('America/Santiago', date)), formatString, {
    locale: es,
  });
};
