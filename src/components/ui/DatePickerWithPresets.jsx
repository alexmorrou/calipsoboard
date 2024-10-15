"use client"

import * as React from "react"
import { addDays, format } from "date-fns"
import { ru } from 'date-fns/locale';
import { Calendar as CalendarIcon } from "lucide-react"
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export function DatePickerWithPresets({ date, setDate }) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [tempDate, setTempDate] = React.useState(date);

    React.useEffect(() => {
        if (isOpen) {
            setTempDate(date);
        }
    }, [isOpen, date]);

    const handleSelectChange = (value) => {
        const today = new Date();
        let newDate;
        switch (value) {
            case "today":
                newDate = { from: today, to: today };
                break;
            case "yesterday":
                newDate = { from: addDays(today, -1), to: addDays(today, -1) };
                break;
            case "week":
                newDate = { from: addDays(today, -7), to: today };
                break;
            case "month":
                newDate = { from: addDays(today, -30), to: today };
                break;
            case "year":
                newDate = { from: addDays(today, -365), to: today };
                break;
            default:
                newDate = null;
                break;
        }
        if (newDate) {
            setTempDate(newDate);
        }
    };

    const handleDateChange = (newDate) => {
        setTempDate(newDate);
    };

    const handleApply = () => {
        setDate(tempDate);
        setIsOpen(false); // Закрываем Popover после применения выбранных дат
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-[280px] justify-start text-left font-normal",
                        !date?.from && "text-muted-foreground"
                    )}
                    style={{ display: 'flex', justifyContent: 'center' }}
                    onClick={() => setIsOpen(true)} // Открываем Popover при клике на кнопку
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date?.from ? (
                        date.to ? (
                            <>
                                {format(date.from, "dd.MM.yyyy", { locale: ru })} -{" "}
                                {format(date.to, "dd.MM.yyyy", { locale: ru })}
                            </>
                        ) : (
                            format(date.from, "dd.MM.yyyy", { locale: ru })
                        )
                    ) : (
                        <span>Выберите дату</span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="flex w-auto flex-col space-y-2 p-2">
                <Select onValueChange={handleSelectChange}>
                    <SelectTrigger>
                        <SelectValue placeholder="Выберите" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                        <SelectItem value="today">Сегодня</SelectItem>
                        <SelectItem value="yesterday">Вчера</SelectItem>
                        <SelectItem value="week">Неделя</SelectItem>
                        <SelectItem value="month">Месяц</SelectItem>
                        <SelectItem value="year">Год</SelectItem>
                    </SelectContent>
                </Select>
                <div className="rounded-md border">
                    <DayPicker
                        mode="range"
                        selected={tempDate}
                        onSelect={handleDateChange}
                        locale={ru}
                        numberOfMonths={1}
                    />
                </div>
                <Button onClick={handleApply}>Применить</Button>
            </PopoverContent>
        </Popover>
    )
}