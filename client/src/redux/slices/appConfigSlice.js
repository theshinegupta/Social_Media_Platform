import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import { axiosClient } from '../../utils/axiosClient'
import { Navigate, useNavigate } from 'react-router-dom';
import { KEY_ACCESS_TOKEN, removeItem } from '../../utils/localStorageManager';


export const getMyInfo=createAsyncThunk('user/getMyInfo',async ()=>{
    
    try {
    
        const response=await axiosClient.get('/user/getMyInfo');
        // console.log(response);        
        return response.result;
 
    } catch (error) {
        return Promise.reject(error);
    }
})

export const updateMyProfile=createAsyncThunk('user/updateMyProfile',async (body)=>{
   
    try {
        
        const response=await axiosClient.put('/user/',body);
        return response.result;

    } catch (error) {
        return Promise.reject(error);
    }
});

export const deleteProfile=createAsyncThunk('user/',async(body)=>{
    try {
        const response=await axiosClient.delete('/user/',body);
        useNavigate('/login')

        console.log(response);
        
    } catch (error) {
        return Promise.reject(error);
    }
})

const appConfigSlice = createSlice({
    
    name: "appConfigSlice",
    initialState: {
        isLoading: false,
        toastData:{},
        myProfile: null,
    },
    reducers: {
        setLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        showToast:(state,action)=>{
            state.toastData=action.payload;
        }
        
    },
    extraReducers: (builder) => {
        builder.addCase(getMyInfo.fulfilled, (state, action) => {
            state.myProfile = action.payload.user;
        })
        .addCase(updateMyProfile.fulfilled, (state, action) => {
            state.myProfile=action.payload.user;
        })
        

    },
});


export default appConfigSlice.reducer;
export const {setLoading,showToast}=appConfigSlice.actions;