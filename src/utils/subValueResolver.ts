import { dayJs2Solar } from "@/utils/dateTransform";

export const normalCnHoliday = {
  '正月.初一': '春节',
  '正月.十五': '元宵节',
  '五月.初五': '端午节',
  '七月.初七': '七夕节',
  '八月.十五': '中秋节',
  '九月.初九': '重阳节',
  '腊月.廿三': '北小年',
  '腊月.廿四': '南小年',
  '腊月.三十': '除夕'
}
// 解析常规中国节日
export const normalCnHolidayResolver = ({
  monthCn,
  dayCn
}, NCH = normalCnHoliday) => {
  return NCH[`${monthCn}.${dayCn}`] || ''
}

export const normalHoliday = {
  '1.1': '元旦',
  '2.14': '情人节',
  '3.8': '妇女节',
  '4.1': '愚人节',
  '5.1': '劳动节',
  '5.4': '青年节',
  '5.2.7': '母亲节',
  '6.1': '儿童节',
  '6.3.7': '父亲节',
  '7.1': '建党节',
  '8.1': '建军节',
  '9.10': '教师节',
  '10.1': '国庆节',
  '10.31': '万圣夜',
  '11.1': '万圣节',
  '11.4.4': '感恩节',
  '12.24': '平安夜',
  '12.25': '圣诞节'
}
// 解析常规节日
export const normalHolidayResolver = ({
  month,
  day,
  dateOrder
}, NH = normalHoliday) => {
  return NH[`${month}.${day}`]
    || NH[dateOrder]
    || ''
}

// 解析节气和阴历
export const termOrDayCnResolver = ({
  term,
  dayCn
}) => {
  return term || dayCn || ''
}

// 解析"冬二九"和"冬三九"
// 冬二九的定义：冬至后的第九天
// 冬三九的定义：冬至后的第二个九天（十八天）
export const winter29And39Resolver = ({
  djs,
  gzDay,
}) => {
  const dayBefore9day = djs.subtract(9, 'day')
  const { term: term9 } = dayJs2Solar(dayBefore9day)
  if(term9 === '冬至') {
    return '冬二九'
  }
  const dayBefore18day = djs.subtract(18, 'day')
  const { term: term18 } = dayJs2Solar(dayBefore18day)
  if(term18 === '冬至') {
    return '冬三九'
  }

  return ''
}

// 解析初伏、中伏、末伏、出伏
// 初伏：夏至后的第二个庚日
// 中伏：夏至后的第三个庚日
// 末伏：立秋后的第一个庚日
// 出伏：立秋后的第二个庚日
export const fuResolver = ({
  djs,
  gzDay,
}) => {
  if(gzDay.startsWith('庚')) {
    let dayBefore29 = djs.subtract(29, 'day')
    const dayBefore20 = djs.subtract(20, 'day')

    while(dayBefore29.isSameOrBefore(dayBefore20)) {
      const { term } = dayJs2Solar(dayBefore29)

      if(term === '夏至') {
        return '初伏'
      }

      dayBefore29 = dayBefore29.add(1, 'day')
    }

    let dayBefore39 = djs.subtract(39, 'day')
    const dayBefore30 = djs.subtract(30, 'day')

    while(dayBefore39.isSameOrBefore(dayBefore30)) {
      const { term } = dayJs2Solar(dayBefore39)

      if(term === '夏至') {
        return '中伏'
      }

      dayBefore39 = dayBefore39.add(1, 'day')
    }

    let day9 = djs.subtract(9, 'day')
    while (day9.isBefore(djs)) {
      const { term: termLiQiu } = dayJs2Solar(day9)
      if(termLiQiu === '立秋') {
        return '末伏'
      }

      day9 = day9.add(1, 'day')
    }

    let day19 = djs.subtract(19, 'day')
    const day10 = djs.subtract(10, 'day')
    while (day19.isBefore(day10)) {
      const { term: termLiQiu } = dayJs2Solar(day19)
      if(termLiQiu === '立秋') {
        return '出伏'
      }

      day19 = day19.add(1, 'day')
    }
  }

  return ''
}
