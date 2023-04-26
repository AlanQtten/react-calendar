import solarlunar from 'solarlunar'
import * as $dayjs from "dayjs";
import zh from 'dayjs/locale/zh-cn'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'

$dayjs.locale('zh-cn', zh)
$dayjs.extend(isSameOrBefore)

export const dayjs = $dayjs

export const dayJs2Solar = djs => solarlunar.solar2lunar(djs.year(), djs.month() + 1, djs.date())

export const getDateOrder = (month, day, weekOfDay) => {
  return `${month}.${day % 7 === 0 ? day / 7 : Math.floor(day / 7) + 1}.${weekOfDay}`
}
