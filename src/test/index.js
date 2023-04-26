import dayjs from 'dayjs'
import solarlunar from 'solarlunar'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore.js'
dayjs.extend(isSameOrBefore)

export const dayJs2Solar = djs => solarlunar.solar2lunar(djs.year(), djs.month() + 1, djs.date())

export const fuResolver = ({
   djs,
   gzDay,
 }) => {
  if(gzDay.startsWith('庚')) {
    let dayBefore29 = djs.subtract(29, 'day')
    const dayBefore20 = djs.subtract(20, 'day')
    console.log(dayBefore20.format('YYYY-MM-DD'));

    while(dayBefore29.isSameOrBefore(dayBefore20)) {
      const { term } = dayJs2Solar(dayBefore29)

      if(term === '夏至') {
        return '初伏'
      }

      dayBefore29 = dayBefore29.add(1, 'day')
    }
  }

  return ''
}
const d = dayjs('2023-07-11')
const { gzDay } = dayJs2Solar(d)

console.log(fuResolver({
  djs: d,
  gzDay: gzDay
}));
