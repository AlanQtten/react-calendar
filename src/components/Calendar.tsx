import { forwardRef, useCallback, useEffect, useMemo, useState } from "react";
import { createUseStyles } from "react-jss";
import type $dayjs from 'dayjs'
import cx from 'classnames'

import { normalCnHolidayResolver, normalHolidayResolver, termOrDayCnResolver } from "@/utils/subValueResolver";
import { dayJs2Solar, getDateOrder, dayjs } from "@/utils/dateTransform";
import { weekendInDayjs, weekTitle } from "@/utils/dateConstant";
import usePrevious from "@/hooks/usePrevious";

const useStyle = createUseStyles<any, any, any>({
  calendar: ({ blockHeight, blockGap }) => {
    return {
      width: '100%',
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      '& > div': {
        width: `calc((100% - ${blockGap * 6}px) / 7)`,
        height: blockHeight,
        textAlign: 'center',
        border: '2px solid transparent',
        borderRadius: '10px',
        boxSizing: 'border-box',
        marginBottom: blockGap,
        '&.red': {
          '& > span:nth-child(1)': {
            color: '#F73131',
          }
        },
        '&.gray': {
          opacity: 0.4,
        },
        '&.date': {
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          '& > span': {
            '&:nth-child(1)': {
              fontSize: 20,
            },
            '&:nth-child(2)': {
              fontSize: 12,
              color: '#333'
            }
          },
          '&:hover': {
            border: '2px solid #4E6EF2',
          }
        },
        '&.highlight': {
          border: '2px solid #4E6EF2',
        }
      }
    }
  },
  weekTitle: {
    lineHeight: ({ blockHeight }) => `${blockHeight}px`
  }
})

type CalendarProps = {
  // 数据相关
  currentDay: $dayjs.Dayjs // 当前日期，会根据这个日期来生成日历视图，日期改变但月份不变的情况下日历视图不会刷新
  startOfWeek?: number
  fillRowBeforeCurrentMonth?: boolean // 当这个月的第一天出现在第一列，是否在上面再补一行上月的日期
  fillRowAfterCurrentMonth?: boolean // 当这个月的最后一天出现在最后一列，是否在下面再补一行下月的日期
  highlightCurrentDay?: boolean // 是否高亮当前天，默认高亮

  // 样式相关
  blockHeight?: number
  blockGap?: number

  // 事件和函数
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

    blockHeight = 60,
    blockGap = 4,

    onMonthChange = () => {},
    onClickOnDateBlock = () => {},
    subValueResolver = [
      normalCnHolidayResolver,
      normalHolidayResolver,
      termOrDayCnResolver,
    ],
  } = props

  const [dateBlockList, setDateBlockList] = useState<any[]>([])
  const classes = useStyle({ blockHeight, blockGap })
  const prevDate = usePrevious<$dayjs.Dayjs>(currentDay)
  const prevStartOfWeek = usePrevious<number>(startOfWeek)

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

  const generateCalendar = () => {
    if(
      (prevDate && (prevDate.month() === currentDay.month()))
      &&
      (prevStartOfWeek === startOfWeek)
    ) {
      highlightCurrentDay && setDateBlockList(highlight(dateBlockList))
      return
    }
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
    if(prevDate && (prevDate.month() !== currentDay.month())) {
      onMonthChange(currentDay)
    }
    generateCalendar()
  }, [currentDay, startOfWeek])

  const internalWeekTitle = useMemo(() => {
    const _weekTitle = [...weekTitle]
    _weekTitle.push(..._weekTitle.splice(0, startOfWeek - 1))

    return _weekTitle
  }, [startOfWeek])

  return (
    <div className={classes.calendar}>
      {
        internalWeekTitle.map((_, index) => {
          return <div key={index} className={classes.weekTitle}>{_}</div>
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
  )
}

export default forwardRef(InternalCalendar)
