import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchData } from './slices/dataSlice';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { logout } from './slices/authSlice';
import DatePickerWithComparison from './components/ui/DatePickerWithComparison';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const Dashboard = () => {
    const userData = useSelector((state) => state.auth.userData);
    const data = useSelector((state) => state.data.data);
    const loading = useSelector((state) => state.data.loading);
    const error = useSelector((state) => state.data.error);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [dateRange, setDateRange] = useState({
        from: new Date(),
        to: new Date(),
    });

    const [previousPeriod, setPreviousPeriod] = useState({
        from: new Date(new Date().setDate(new Date().getDate() - 1)),
        to: new Date(new Date().setDate(new Date().getDate() - 1)),
    });

    const [period, setPeriod] = useState('day');
    const [previousData, setPreviousData] = useState(null);

    useEffect(() => {
        if (userData && dateRange?.from && dateRange?.to) {
            const formattedFrom = dateRange.from.toISOString().split('T')[0];
            const formattedTo = dateRange.to.toISOString().split('T')[0];

            let previousFrom, previousTo;

            const daysDifference = (dateRange.to - dateRange.from) / (1000 * 60 * 60 * 24);

            previousFrom = new Date(dateRange.from);
            previousFrom.setDate(previousFrom.getDate() - daysDifference - 1);
            previousTo = new Date(dateRange.from);
            previousTo.setDate(previousTo.getDate() - 1);

            const formattedPreviousFrom = previousFrom.toISOString().split('T')[0];
            const formattedPreviousTo = previousTo.toISOString().split('T')[0];

            console.log('Текущий период:', formattedFrom, 'до', formattedTo);
            console.log('Сравниваем с:', formattedPreviousFrom, 'до', formattedPreviousTo);

            // Обновляем предыдущий период
            setPreviousPeriod({ from: previousFrom, to: previousTo });

            // Запрашиваем данные за текущий период
            dispatch(fetchData({ ...userData, fromDate: formattedFrom, toDate: formattedTo }));

            // Запрашиваем данные за прошлый период
            dispatch(fetchData({ ...userData, fromDate: formattedPreviousFrom, toDate: formattedPreviousTo }))
                .then(response => {
                    setPreviousData(response.payload);
                });
        }
    }, [dispatch, userData, dateRange]);

    useEffect(() => {
        if (error && error.status === 500) {
            localStorage.clear();
            navigate('/');
        }
    }, [error, navigate]);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/');
    };

    const compareData = (current, previous) => {
        if (!current || !previous) return null;

        return current.data.map(item => {
            const previousItem = previous.data.find(prev => prev.Department === item.Department);
            if (!previousItem) return { ...item, comparison: 'no-data' };

            const comparison = {
                DishDiscountSumInt: item.DishDiscountSumInt > previousItem.DishDiscountSumInt ? 'up' : 'down',
                UniqOrderId: item.UniqOrderId > previousItem.UniqOrderId ? 'up' : 'down',
                'DishDiscountSumInt.average': item['DishDiscountSumInt.average'] > previousItem['DishDiscountSumInt.average'] ? 'up' : 'down',
            };

            return { ...item, comparison, previousItem };
        });
    };

    const comparedData = compareData(data, previousData);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>Дашборд</h1>
                <Button onClick={handleLogout}>Выход</Button>
            </div>
            <div style={{ flex: 1, padding: '10px' }}>
                <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'center' }}>
                    <DatePickerWithComparison date={dateRange} setDate={setDateRange} previousPeriod={previousPeriod} />
                </div>
                {loading && <div>Загрузка...</div>}
                {error && <div style={{ color: 'red' }}>Ошибка: {error.message}</div>}
                {comparedData && comparedData.length > 0 && (
                    <div>

                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Кафе</TableHead>
                                    <TableHead>Выручка</TableHead>
                                    <TableHead>Кол-во чеков</TableHead>
                                    <TableHead>Ср.чек</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {comparedData.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{item.Department}</TableCell>
                                        <TableCell>
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                {item.DishDiscountSumInt}
                                                {item.comparison.DishDiscountSumInt === 'up' ? <FaArrowUp color="green" /> : <FaArrowDown color="red" />}
                                                <span style={{ color: 'gray', fontSize: '0.8em', marginLeft: '10px' }}>
                                                    {item.previousItem.DishDiscountSumInt}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                {item.UniqOrderId}
                                                {item.comparison.UniqOrderId === 'up' ? <FaArrowUp color="green" /> : <FaArrowDown color="red" />}
                                                <span style={{ color: 'gray', fontSize: '0.8em', marginLeft: '10px' }}>
                                                    {item.previousItem.UniqOrderId}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                {item['DishDiscountSumInt.average']}
                                                {item.comparison['DishDiscountSumInt.average'] === 'up' ? <FaArrowUp color="green" /> : <FaArrowDown color="red" />}
                                                <span style={{ color: 'gray', fontSize: '0.8em', marginLeft: '10px' }}>
                                                    {item.previousItem['DishDiscountSumInt.average']}
                                                </span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;