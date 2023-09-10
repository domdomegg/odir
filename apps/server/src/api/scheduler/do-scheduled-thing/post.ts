import createHttpError from 'http-errors';
import { middyfy } from '../../../helpers/wrapper';

export const main = middyfy(null, null, true, async (event) => {
  if (event.auth.payload.subject !== 'scheduler') {
    throw new createHttpError.Forbidden('Only scheduler can call /scheduler endpoints');
  }

  // TODO: something here
  console.log('This could do something someday');
});
