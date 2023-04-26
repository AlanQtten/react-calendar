import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createUseStyles } from "react-jss";
import type $dayjs from 'dayjs'
import cx from 'classnames'

import { normalCnHolidayResolver, normalHolidayResolver, termOrDayCnResolver } from "@/utils/subValueResolver";
import { dayJs2Solar, getDateOrder, dayjs } from "@/utils/dateTransform";
import { weekendInDayjs, weekNumber, weekTitle } from "@/utils/dateConstant";

const useStyle = createUseStyles({
  wrapper: {
    width: 700,
    margin: '16px 0 0 16px',
  },
  calendar: {
    width: '100%',
    display: 'flex',
    flexWrap: 'wrap',
    '& > div': {
      width: 100,
      height: 50,
      lineHeight: '50px',
      textAlign: 'center',
      border: '1px solid transparent',
      boxSizing: 'border-box',
      '&.red': {
        color: 'rgba(255, 0, 0, .9)',
      },
      '&.gray': {
        color: 'rgba(80, 80, 80, .5)'
      },
      '&.date': {
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        '& > span': {
          '&:nth-child(1)': {
            fontSize: 20,
            lineHeight: '30px'
          },
          '&:nth-child(2)': {
            lineHeight: '15px'
          }
        }
      },
      '&.highlight': {
        border: '1px solid rgba(0, 0, 255, .5)',
        borderRadius: '10px'
      }
    }
  },
})

type CalendarProps = {
  currentDay: $dayjs.Dayjs //
  startOfWeek?: typeof weekNumber[number]
  fillRowBeforeCurrentMonth?: boolean // 当这个月的第一天出现在第一列，是否在上面再补一行上月的日期
  fillRowAfterCurrentMonth?: boolean // 当这个月的最后一天出现在最后一列，是否在下面再补一行下月的日期
  highlightCurrentDay?: boolean // 是否高亮当前天，默认高亮

  onMonthChange?: (v: $dayjs.Dayjs) => void // 月份改变时触发
  onClickOnDateBlock?: (v: any) => void // 点击日期时触发
  subValueResolver?: Array<(...args: any) => string> // 日期格附文字解析器，会按照数组顺序进行匹配，第一个匹配到的结果会展示
}

const FArray = number => Array(number).fill(0)
function InternalCalendar(props: CalendarProps, ref) {
  const {
    currentDay = dayjs(),
    startOfWeek = 1,
    fillRowBeforeCurrentMonth = true,
    fillRowAfterCurrentMonth = true,
    highlightCurrentDay = true,
    onMonthChange = () => {},
    onClickOnDateBlock = () => {},
    subValueResolver = [
      normalCnHolidayResolver,
      normalHolidayResolver,
      termOrDayCnResolver,
    ]
  } = props

  const [dateBlockList, setDateBlockList] = useState<any[]>([])
  const classes = useStyle()
  const prevDate = usePrevious(currentDay)

  const internalSubValueResolver = useCallback((djs) => {
    const l = subValueResolver.length
    const month = djs.month() + 1
    const weekOfDay = djs.day() || 7
    const day = djs.date()
    const dateOrder = getDateOrder(month, day, weekOfDay)
    const { monthCn, dayCn, term, gzDay } = dayJs2Solar(djs)

    for (let i = 0; i < l; i++) {
      const result = subValueResolver[i]({
        monthCn,
        dayCn,
        month,
        day,
        dateOrder,
        term,
        djs,
        gzDay
      })

      if(result) {
        return result
      }
    }
  }, [subValueResolver])

  const toDayValue = (djs, { isCurrentMonth }) => {
    return {
      id: djs.format('YYYY-MM-DD'),
      value: djs.format('D'),
      isCurrentMonth,
      isWeekend: weekendInDayjs.includes(djs.day()),
      subValue: internalSubValueResolver(djs),
      dayjsObject: djs,
    }
  }

  const getPrefixCount = (startOfThisMonth) => {
    const d = startOfThisMonth.day()
    const dt = weekTitle[(d || 7) - 1]
    const idtIndex = internalWeekTitle.findIndex(idt => idt === dt)

    return idtIndex || (fillRowBeforeCurrentMonth ? 7 : 0)
  }
  const getSuffixCount = (endOfThisMonth) => {
    const d = endOfThisMonth.day()
    const dt = weekTitle[(d || 7) - 1]
    const idtIndex = internalWeekTitle.findIndex(idt => idt === dt)

    return (6 - idtIndex) || (fillRowAfterCurrentMonth ? 7 : 0)
  }

  const highlight = (dv) => {
    const cdId = currentDay.format('YYYY-MM-DD')
    return dv.map(d => ({
      ...d,
      highlight: d.id === cdId
    }))
  }

  const generateCalendar = (pvDate) => {
    if(pvDate && (pvDate.month() === currentDay.month())) {
      highlightCurrentDay && setDateBlockList(highlight(dateBlockList))
      return
    }
    onMonthChange(currentDay)
    const startOfThisMonth = currentDay.startOf('month')
    const preFixCount = getPrefixCount(startOfThisMonth)
    const lastDayOfLastMonth = startOfThisMonth.subtract(1, 'day')

    const endOfThisMonth = currentDay.endOf('month')
    const postFixCount = getSuffixCount(endOfThisMonth)
    const firstDayOfNextMonth = endOfThisMonth.add(1, 'day')

    const dateView = [
      ...FArray(preFixCount)
        .map((_, index) => {
          return toDayValue(index
            ? lastDayOfLastMonth.subtract(index, 'day')
            : lastDayOfLastMonth, { isCurrentMonth: false })
        })
        .reverse(),
      ...(function() {
        const wholeMonth = []
        let day = currentDay.startOf('month')
        let currentMonth = currentDay.month()

        while(day.month() === currentMonth) {
          wholeMonth.push(toDayValue(day, { isCurrentMonth: true }))
          day = day.add(1, 'day')
        }

        return wholeMonth
      }()),
      ...Array(postFixCount)
        .fill(0)
        .map((_, index) => {
          return toDayValue(index
            ? firstDayOfNextMonth.add(index, 'day')
            : firstDayOfNextMonth, { isCurrentMonth: false })
        }),
    ]

    setDateBlockList(highlightCurrentDay ? highlight(dateView) : dateView)
  }

  useEffect(() => {
    generateCalendar(prevDate)
  }, [currentDay])

  const internalWeekTitle = useMemo(() => {
    const _weekTitle = [...weekTitle]
    _weekTitle.push(..._weekTitle.splice(0, startOfWeek - 1))

    return _weekTitle
  }, [startOfWeek])

  return <div className={classes.wrapper}>
    <div className={classes.calendar}>
      {
        internalWeekTitle.map((_, index) => {
          return <div key={index}>{_}</div>
        })
      }
      {
        dateBlockList.map((_) => {
          return <div
            key={_.id}
            className={cx({
              gray: !_.isCurrentMonth,
              date: true,
              red: _.isWeekend,
              highlight: _.highlight,
            })}
            onClick={() => {
              onClickOnDateBlock(_)
            }}
          >
            <span>{_.value}</span>
            <span>{_.subValue}</span>
          </div>
        })
      }
    </div>
  </div>
}

function usePrevious(value) {
  const ref = useRef()

  useEffect(() => {
    ref.current = value
  }, [value])

  return ref.current
}

export default forwardRef(InternalCalendar)
