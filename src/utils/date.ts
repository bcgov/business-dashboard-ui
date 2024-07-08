import moment from 'moment'

const MS_IN_A_DAY = (1000 * 60 * 60 * 24)

/** Return the date string as a date
 * @param dateString expected dateString format: YYYY-MM-DD
 */
export function dateStringToDate (dateString: string) {
  // convert to date
  const date = new Date(dateString)
  // @ts-ignore
  if (isNaN(date)) {
    return null
  }
  // return date offsetted by local timezone (otherwise it defaults to UTC at 12am)
  const localOffset = date.getTimezoneOffset()
  return moment(date).add(localOffset, 'm').toDate()
}

/** Return the date as a string in the desired format
 * @param date js Date
 * @param format default: YYYY-MM-DDT:HH:mm:ss+-HH:mm
 */
export function dateToString (date: Date, format?: string) {
  return (date) ? moment(date).local().format(format) : ''
}

/** Convert the date to pacific time and return as a string in the desired format
 * @param date js Date
 * @param format default: YYYY-MM-DDT:HH:mm:ss+-HH:mm
 */
export function dateToStringPacific (date: Date, format?: string) {
  date = new Date(date.toLocaleString('en-US', { timeZone: 'America/Vancouver' }))
  return moment(date).format(format)
}

/** Return the date string in date format from datetime string format
 * @param datetimeString expected format: YYYY-MM-DDT:HH:mm:ss+-HH:mm
 */
export function datetimeStringToDateString (datetimeString: string) {
  const date = new Date(datetimeString)
  // convert to date and back so that it returns correctly for the timezone
  return (date) ? moment(date).local().format('YYYY-MM-DD') : ''
}

export const todayIsoDateString = () => dateToString(new Date(), 'YYYY-MM-DD')

export function daysBetweenTwoDates (initialDate: Date, d: Date){
  // safety check
  if (initialDate !== new Date(initialDate)) {
    return NaN
  }
  if (d !== new Date(d)){
    return NaN
  }

  // set "date" to 12:00 am Pacific
  d.setHours(0, 0, 0, 0)

  // compute "initialDate" at 12:00 am Pacific
  initialDate.setHours(0, 0, 0, 0)

  // calculate difference between "date" and "initialDate"
  // (result should be a whole number)
  const diff = (d.valueOf() - initialDate.valueOf()) / MS_IN_A_DAY;

  return Math.round(diff)
}