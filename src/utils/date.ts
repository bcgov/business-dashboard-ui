import type { ApiDateTimeUtc, IsoDatePacific, FormattedDateTimeGmt } from '@bcrs-shared-components/interfaces'
import moment from 'moment'
import isDate from 'lodash.isdate'

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

export function daysBetweenTwoDates (initialDate: Date, d: Date) {
  // safety check
  if (!isDate(initialDate) || isNaN(initialDate.getTime())) return NaN
  if (!isDate(d) || isNaN(d.getTime())) return NaN

  // set "date" to 12:00 am Pacific
  d.setHours(0, 0, 0, 0)

  // compute "initialDate" at 12:00 am Pacific
  initialDate.setHours(0, 0, 0, 0)

  // calculate difference between "date" and "initialDate"
  // (result should be a whole number)
  const diff = (d.valueOf() - initialDate.valueOf()) / MS_IN_A_DAY

  return Math.round(diff)
}

/**
 * Converts an API datetime string (in UTC) to a Date object.
 * @example 2021-08-05T16:56:50.783101+00:00 -> 2021-08-05T16:56:50Z
 */
export function apiToDate (dateTimeString: ApiDateTimeUtc): Date {
  if (!dateTimeString) {
    return null
  }

  // chop off the milliseconds and UTC offset and append "Zulu" timezone abbreviation
  // eg, 2020-08-28T21:53:58Z
  dateTimeString = dateTimeString.slice(0, 19) + 'Z'

  return new Date(dateTimeString)
}

/**
 * Converts a date string (YYYY-MM-DD) to the format of "Month Day, Year".
 * @example "2020-01-01" -> "Jan 1, 2020"
 */
export function formatToMonthDayYear (dateStr: IsoDatePacific): string {
  // safety checks
  if (!dateStr) {
    return null
  }
  if (dateStr.length !== 10) {
    return null
  }

  // create a Date object
  const date = dateStringToDate(dateStr)
  // invalid date check
  if (isNaN(date.getTime())) {
    return null
  }
  ;

  return dateToString(date, 'MMM D, YYYY')
}

/** Whether the subject date string is in the future. */
export function isDateFuture (date: FormattedDateTimeGmt): boolean {
  return (new Date(date) > new Date())
}

/**
 * Converts a Date object to a date string (Month Day, Year) in Pacific timezone.
 * @param date
 * @param longMonth whether to show long month name (eg, December vs Dec)
 * @param showWeekday whether to show the weekday name (eg, Thursday)
 * @example "2021-01-01 07:00:00 GMT" -> "Dec 31, 2020"
 * @example "2021-01-01 08:00:00 GMT" -> "Jan 1, 2021"
 */
export const dateToPacificDate = (date: Date, longMonth = false, showWeekday = false): string => {
  // safety check
  if (!isDate(date) || isNaN(date.getTime())) {
    return null
  }

  // NB: some versions of Node have only en-US locale
  // so use that and convert results accordingly
  let dateStr = date.toLocaleDateString('en-US', {
    timeZone: 'America/Vancouver',
    weekday: showWeekday ? 'long' : undefined, // Thursday or nothing
    month: longMonth ? 'long' : 'short', // December or Dec
    day: 'numeric', // 31
    year: 'numeric' // 2020
  })

  // remove period after month
  dateStr = dateStr.replace('.', '')

  return dateStr
}
/**
 * Converts a Date object to a time string (HH:MM am/pm) in Pacific timezone.
 * @example "2021-01-01 07:00:00 GMT" -> "11:00 pm"
 * @example "2021-01-01 08:00:00 GMT" -> "12:00 am"
 */
export const dateToPacificTime = (date: Date): string => {
  // safety check
  if (!isDate(date) || isNaN(date.getTime())) {
    return null
  }

  // NB: some versions of Node have only en-US locale
  // so use that and convert results accordingly
  let timeStr = date.toLocaleTimeString('en-US', {
    timeZone: 'America/Vancouver',
    hour: 'numeric', // 11
    minute: '2-digit', // 00
    hour12: true // AM/PM
  })

  // replace AM with am and PM with pm
  timeStr = timeStr.replace('AM', 'am').replace('PM', 'pm')

  return timeStr
}

/**
 * Converts a Date object to a date and time string (Month Day, Year at HH:MM am/pm
 * Pacific time).
 * @example "2021-01-01 07:00:00 GMT" -> "December 31, 2020 at 11:00 pm Pacific time"
 * @example "2021-01-01 08:00:00 GMT" -> "January 1, 2021 at 12:00 pm Pacific time"
 */
export const dateToPacificDateTime = (date: Date): string => {
  // safety check
  if (!isDate(date) || isNaN(date.getTime())) {
    return null
  }

  const dateStr = dateToPacificDate(date, true)
  const timeStr = dateToPacificTime(date)

  return `${dateStr} at ${timeStr} Pacific time`
}

/**
 * Creates and returns a new Date object in UTC, given parameters in Pacific timezone.
 * (This works regardless of user's local clock/timezone.)
 * @example "2021, 0, 1, 0, 0" -> "2021-01-01T08:00:00.000Z"
 * @example "2021, 6, 1, 0, 0" -> "2021-07-01T07:00:00.000Z"
 */
export const createUtcDate =
  (year: number, month: number, day: number, hours = 0, minutes = 0): Date => {
    // 1. create the new date in UTC
    // 2. compute the offset between UTC and Pacific timezone
    // 3. add the offset to convert the date to Pacific timezone
    // Ref: https://stackoverflow.com/questions/15141762/
    const date = new Date(Date.UTC(year, month, day, hours, minutes))
    const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }))
    const tzDate = new Date(date.toLocaleString('en-US', { timeZone: 'America/Vancouver' }))
    const offset = utcDate.getTime() - tzDate.getTime()
    date.setTime(date.getTime() + offset)

    return date
  }

/**
 * Converts a date string (YYYY-MM-DD) to a Date object at 12:00:00 am Pacific time.
 * @example 2021-11-22 -> 2021-11-22T08:00:00.00Z
 */
export const yyyyMmDdToDate = (dateStr: IsoDatePacific): Date => {
  // safety checks
  if (!dateStr) {
    return null
  }
  if (dateStr.length !== 10) {
    return null
  }

  const split = dateStr.split('-')
  const year = +split[0]
  const month = +split[1]
  const day = +split[2]

  return createUtcDate(year, (month - 1), day)
}

/**
 * Converts a Date object to a date string (YYYY-MM-DD) in Pacific timezone.
 * @example "2021-01-01 07:00:00 GMT" -> "2020-12-31"
 * @example "2021-01-01 08:00:00 GMT" -> "2021-01-01"
 */
export const dateToYyyyMmDd = (date: Date): IsoDatePacific => {
  // safety check
  if (!isDate(date) || isNaN(date.getTime())) {
    return null
  }

  // NB: some versions of Node have only en-US locale
  // so use that and convert results accordingly
  const dateStr = date.toLocaleDateString('en-US', {
    timeZone: 'America/Vancouver',
    month: 'numeric', // 12
    day: 'numeric', // 31
    year: 'numeric' // 2020
  })

  // convert mm/dd/yyyy to yyyy-mm-dd
  // and make sure month and day are 2 digits (eg, 03)
  const [mm, dd, yyyy] = dateStr.split('/')
  return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`
}

/**
 * Converts an API datetime string (in UTC) to a date string (Month Day, Year).
 * @example "2021-01-01T00:00:00.000000+00:00" -> "Dec 31, 2020" (PST example)
 * @example "2021-07-01T00:00:00.000000+00:00" -> "Jun 30, 2021" (PDT example)
 */
export const apiToPacificDate = (dateTimeString: ApiDateTimeUtc, longMonth = false): string => {
  if (!dateTimeString) {
    return null
  } // safety check
  const date = apiToDate(dateTimeString)
  return dateToPacificDate(date, longMonth)
}

/**
 * Converts an API datetime string (in UTC) to a date and time string (Month Day, Year at HH:MM am/pm
 * Pacific time).
 * @example "2021-01-01T00:00:00.000000+00:00" -> "Dec 31, 2020 at 04:00 pm Pacific time" (PST example)
 * @example "2021-07-01T00:00:00.000000+00:00" -> "Jun 30, 2021 at 05:00 pm Pacific time" (PDT example)
 */
export const apiToPacificDateTime = (dateTimeString: ApiDateTimeUtc, longMonth = false): string => {
  if (!dateTimeString) {
    return null
  } // safety check

  const date = apiToDate(dateTimeString)
  const dateStr = dateToPacificDate(date, longMonth)
  const timeStr = dateToPacificTime(date)

  return `${dateStr} at ${timeStr} Pacific time`
}
