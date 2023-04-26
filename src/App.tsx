import Calendar from "./components/Calendar";
import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { fuResolver, termOrDayCnResolver, winter29And39Resolver } from "@/utils/subValueResolver";

export default function App() {
  const [d, setD] = useState(dayjs())

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

  const yearAndMonth = useMemo(() => {
    return d.format('YYYY-MM')
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
      <div>{ yearAndMonth }</div>
      <Calendar
        startOfWeek={1}
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
    </>
  );
}
