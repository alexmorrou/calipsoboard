import React from 'react';
import { DatePickerWithPresets } from './DatePickerWithPresets';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const DatePickerWithComparison = ({ date, setDate, previousPeriod }) => {
    return (
        <div>
            <DatePickerWithPresets date={date} setDate={setDate} />
            {previousPeriod.from && previousPeriod.to && (
                <div style={{ textAlign: 'center', marginTop: '5px', fontSize: '14px', color: "#646464" }}>
                    {format(previousPeriod.from, "dd.MM.yyyy", { locale: ru })} - {format(previousPeriod.to, "dd.MM.yyyy", { locale: ru })}
                </div>
            )}
        </div>
    );
};

export default DatePickerWithComparison;