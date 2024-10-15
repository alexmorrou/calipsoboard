// src/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUserData } from './slices/authSlice';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import sha1 from 'crypto-js/sha1';
import axios from 'axios';

const LoginPage = () => {
    const [server, setServer] = useState('');
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [serverError, setServerError] = useState('');
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Проверка формата сервера
        if (!/^[\w-]+\.iiko\.it$/.test(server)) {
            setServerError('Неверный формат сервера. Ожидается формат: имя_сервера.iiko.it');
            return;
        } else {
            setServerError('');
        }

        // Преобразование пароля в SHA-1
        const sha1Password = sha1(password).toString();

        try {
            const response = await axios.post('https://back-task.soursecode.ru/loginiiko', { server, login, sha1Password });
            if (response.status === 200) {
                const userData = { server, login, sha1Password, token: response.data.token };
                dispatch(setUserData(userData));
                navigate('/dashboard');
            } else {
                setServerError(`Ошибка сервера: ${response.status}`);
            }
        } catch (error) {
            setServerError(`Ошибка сервера: ${error.response.status}`);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSubmit(e);
        }
    };

    return (
        <div className="flex justify-center items-center h-screen">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">Вход</CardTitle>
                    <CardDescription>
                        Введите ваш сервер, логин и пароль для входа в аккаунт.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="server">Сервер</Label>
                        <Input
                            id="server"
                            type="text"
                            value={server}
                            onChange={(e) => setServer(e.target.value)}
                            required
                        />
                        {serverError && <p className="text-red-500 text-sm">{serverError}</p>}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="login">Логин</Label>
                        <Input
                            id="login"
                            type="text"
                            value={login}
                            onChange={(e) => setLogin(e.target.value)}
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">Пароль</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyPress={handleKeyPress}
                            required
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button className="w-full" onClick={handleSubmit}>Войти</Button>
                </CardFooter>
            </Card>
        </div>
    );
};

export default LoginPage;