import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { setUserData } from './authSlice';

const initialState = {
    data: null,
    loading: false,
    error: null,
};

const reauthorize = async (userData) => {
    const { server, login, sha1Password } = userData;
    console.log('Attempting to reauthorize with:', { server, login, sha1Password });
    const response = await axios.post('https://back-task.soursecode.ru/loginiiko', { server, login, sha1Password });
    console.log('Reauthorization successful. New token:', response.data.token);
    return response.data.token;
};

export const fetchData = createAsyncThunk('data/fetchData', async (userData, { dispatch }) => {
    const { server, token, fromDate, toDate } = userData;

    try {
        console.log('Fetching data with token:', token);
        const response = await axios.post('https://back-task.soursecode.ru/get-data', {
            server,
            token,
            fromDate,
            toDate,
        });
        console.log('Data fetched successfully:', response.data);
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 401) {
            console.log('Token is expired or invalid. Attempting to reauthorize...');
            // Попытка переавторизации
            const userDataFromStorage = JSON.parse(localStorage.getItem('userData'));
            if (userDataFromStorage) {
                try {
                    const newToken = await reauthorize(userDataFromStorage);
                    console.log('New token obtained:', newToken);
                    dispatch(setUserData({ ...userDataFromStorage, token: newToken }));
                    // Повторный запрос данных с новым токеном
                    const response = await axios.post('https://back-task.soursecode.ru/get-data', {
                        server,
                        token: newToken,
                        fromDate,
                        toDate,
                    });
                    console.log('Data fetched successfully with new token:', response.data);
                    return response.data;
                } catch (reauthError) {
                    console.error('Reauthorization failed:', reauthError.message);
                    throw new Error('Ошибка при переавторизации');
                }
            } else {
                console.error('No user data found in localStorage. Reauthorization failed.');
                throw new Error('Требуется повторная авторизация');
            }
        } else {
            console.error('Fetch data error:', error.message);
            throw error;
        }
    }
});

const dataSlice = createSlice({
    name: 'data',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchData.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchData.fulfilled, (state, action) => {
                state.data = action.payload;
                state.loading = false;
            })
            .addCase(fetchData.rejected, (state, action) => {
                state.error = action.error.message;
                state.loading = false;
                console.error('Fetch data error:', action.error);
            });
    },
});

export default dataSlice.reducer;