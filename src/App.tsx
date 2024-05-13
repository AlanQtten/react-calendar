import Calendar from "./components/Calendar";
import { Fragment, useMemo, useState } from "react";
import dayjs from "dayjs";
import { fuResolver, termOrDayCnResolver, winter29And39Resolver } from "@/utils/subValueResolver";

export default function App() {
  const [d, setD] = useState(dayjs())
  const [startOfWeek, setStartOfWeek] = useState(1)

  const change2PrevMonth = () => {
    setD(d.subtract(1, 'month'))
  }
  const change2NextMonth = () => {
    setD(d.add(1, 'month'))
  }
  const change2PrevDay = () => {
    setD(d.subtract(1, 'day'))
  }
  const change2NextDay = () => {
    setD(d.add(1, 'day'))
  }

  const dateStr = useMemo(() => {
    return d.format('YYYY-MM-DD')
  }, [d])

  const onMonthChange = () => {
    console.log('month change');
  }

  return (
    <>
      <div style={{display: 'flex'}}>
        <button onClick={change2PrevMonth}>上个月</button>
        <button onClick={change2NextMonth}>下个月</button>
        <button onClick={change2PrevDay}>昨天</button>
        <button onClick={change2NextDay}>明天</button>
      </div>
      <div>
        startOfWeek:
        {
          Array(7).fill(0).map((_, index) =>
            <Fragment key={index}>
              <input
                type='radio'
                name='startOfWeek'
                onChange={(e) => { setStartOfWeek(+e.target.value) }}
                checked={startOfWeek === index + 1}
                value={index + 1}
              />
              { index + 1 }
            </Fragment>
          )
        }
      </div>
      <div>{ dateStr }</div>
      <div style={{ width: 700, margin: '16px 0 0 16px' }}>
        <Calendar
          startOfWeek={startOfWeek}
          currentDay={d}
          onClickOnDateBlock={({ dayjsObject }) => {
            setD(dayjsObject)
          }}
          subValueResolver={[
            winter29And39Resolver,
            fuResolver,
            termOrDayCnResolver
          ]}
          onMonthChange={onMonthChange}
        />
      </div>
    </>
  );
}
