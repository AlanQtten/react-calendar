# react-calendar

## Feature

- [ ] 添加更多视图（周、月）
- [ ] 抽离数据和视图，封装useMonth，useWeekOfYear等等
- [ ] 让日历支持事件
- [ ] 发布为npm包
- [ ] 优化winter29And39Resolver和fuResolver

## Development

```bash
pnpm install 
pnpm dev
```

## API

| name                      | type                            | default                    | description                                                  |
| ------------------------- | ------------------------------- | -------------------------- | ------------------------------------------------------------ |
| currentDay                | dayjs.Dayjs                     |                            | 当前日期，会根据这个日期来生成日历视图，日期改变但月份不变的情况下日历视图不会刷新 |
| startOfWeek               | 1 \| 2 \| 3 \| 4 \| 5 \| 6 \| 7 | 1                          | 指定每周从第几天开始，会影响日历布局                         |
| fillRowBeforeCurrentMonth | boolean                         | true                       | 当这个月的第一天出现在第一列，是否在上面再补一行上月的日期   |
| fillRowAfterCurrentMonth  | boolean                         | true                       | 当这个月的最后一天出现在最后一列，是否在下面再补一行下月的日期 |
| highlightCurrentDay       | boolean                         | true                       | 是否高亮当前天                                               |
| onMonthChange             | (d: dayjs.Dayjs) => void        |                            | 月份改变时触发                                               |
| onClickOnDateBlock        | (d: any) => void                |                            | 点击日期时触发                                               |
| subValueResolver          | Array<(...args: any) => string> | 见下文关于subValueResolver | 见下文关于subValueResolver                                   |

## subValueResolver

subValueResolver用于声明一组同步函数，第一个非空结果将作为日期下方的说明

- 内部实现的resolver

| resolverName            | description                |
| ----------------------- | -------------------------- |
| normalCnHolidayResolver | 解析常规中国节日           |
| normalHolidayResolver   | 解析常规节日               |
| termOrDayCnResolver     | 解析节气和阴历             |
| winter29And39Resolver   | 解析冬二九和冬三九         |
| fuResolver              | 解析初伏、中伏、末伏、出伏 |

- 默认值

```js
const {
  subValueResolver = [
    normalCnHolidayResolver,
    normalHolidayResolver,
    termOrDayCnResolver,
  ]
} = props
```

- resolver的参数说明

| name      | type        | description                                                  |
| --------- | ----------- | ------------------------------------------------------------ |
| monthCn   | string      | 中国月名：比如一月、二月、腊月                               |
| dayCn     | string      | 中国日名：比如初一、十一、廿一                               |
| month     | number      | 月编号，从1开始                                              |
| day       | number      | 日编号，从1开始                                              |
| dateOrder | string      | number.number.number的形式，用于匹配某些特殊节日，比如<br />母亲节 -> 5.2.7 -> 5月的第二个星期日 |
| term      | string      | 节气，可能为空                                               |
| djs       | dayjs.Dayjs | dayjs对象                                                    |
| gzDay     | gzDay       | 当日的天干地支，比如庚午                                     |

- 通过自定义resolver扩展内部的resolver或者完全自定义

> 目前只有normalCnHolidayResolver和normalHolidayResolver支持扩展

```jsx
import { useState } from 'react'
import dayjs from 'dayjs'
// 引入内部的resolverMap
import { 
  normalCnHoliday,
  normalCnHolidayResolver,
  normalHoliday,
  normalHolidayResolver
} from '@/utils/subValueResolver'

const myNormalCnHolidayMap = {
  ...normalCnHoliday,
  '腊月.廿二': '中国区司庆',
}
const myNormalCnHolidayResolver = (djsArgs) => {
  return normalCnHolidayResolver(djsArgs, myNormalCnHolidayMap)
}

const myNormalHolidayMap = {
  ...normalHoliday,
  '5.1': '外国区司庆',
  '6.1.7': '团建'
}
const myNormalHolidayResolver = (djsArgs) => {
  return normalHolidayResolver(djsArgs, myNormalHolidayMap)
}

const pureCustomResolver = ({ month, day }) => {
  if(month === 5 && day === 18) {
    return '生日'
  }
  return ''
}

export default App() {
  const [ currentDay ] = useState(dayjs())

  return <>
    <Calendar
      currentDay={currentDay}
      subValueResolver={[
      	myNormalCnHolidayResolver,
      	myNormalHolidayResolver,
      	pureCustomResolver
      ]}
    />
  </>
}
```

