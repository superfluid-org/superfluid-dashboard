import { object, string, number, date, InferType, array } from 'yup';
import * as yup from 'yup';

export const headerSchema = yup.array().of(
  yup.mixed().oneOf([
    'receiver',
    'total-vested-amount'
  ])
).length(2);

export const csvSchema = array(object({
  'receiver': string().required(),
  'total-vested-amount': number().required().positive()
})).min(1);

export type CsvData = InferType<typeof csvSchema>;
