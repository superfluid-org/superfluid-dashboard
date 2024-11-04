import { object, string, number, date, InferType, array } from 'yup';
import * as yup from 'yup';
import { testAddress, testEtherAmount } from '../../../utils/yupUtils';

export const headerSchema = yup.array().of(
  yup.mixed().oneOf([
    'receiver',
    'allocation'
  ])
).length(2).required().strict();

export const csvSchema = array(object({
  'receiver': string().required().test(testAddress()),
  'allocation': string().required().test(testEtherAmount({
    notNegative: true,
    notZero: true,
  }))
})).min(1).max(500).required().strict();

export type CsvData = InferType<typeof csvSchema>;
