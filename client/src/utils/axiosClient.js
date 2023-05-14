import axios from 'axios';
import { KEY_ACCESS_TOKEN, getItem, removeItem, setItem } from './localStorageManager';
import {store} from '../redux/store'
import { setLoading, showToast } from '../redux/slices/appConfigSlice';
import { TOAST_FAILURE } from '../App';


// let baseURL = 'http://localhost:4200/';
export const axiosClient=axios.create({

    baseURL: "http://localhost:4200",
    credentials: 'include' ,
    withCredentials:true
})



axiosClient.interceptors.request.use(
    (request)=>{

        const accessToken= getItem(KEY_ACCESS_TOKEN);
        request.headers['Authorization']=`Bearer ${accessToken}`;
        store.dispatch(setLoading(true));

        return request;
    }
);

axiosClient.interceptors.response.use(
    async (response) =>{
        store.dispatch(setLoading(false));
        const data=response.data;
        if(data.status === "ok")
        {
            return data;
        }

        const orignalRequest=response.config;
        // console.log(orignalRequest);
        const statusCode=data.statusCode;
        const error=data.message;

        store.dispatch(showToast({
            type:TOAST_FAILURE,
            message:error
        }))

         if (statusCode === 401 && !orignalRequest._retry){

            // console.log("hello3 ");
            orignalRequest._retry = true;
            const response = await axios
            .create({
                withCredentials: true,
            })
            .get(`http://localhost:4200/auth/refresh`);


            // console.log('response from backend',response);
            
            
            if(response.data.status === "ok"){
                setItem(KEY_ACCESS_TOKEN,response.data.result.accessToken);
                orignalRequest.headers['Authorization']=`Bearer ${response.data.result.accessToken}`;

                // console.log(orignalRequest.headers['Authorization']);
                // console.log("hello3 ");
                return axios(orignalRequest)

            }else{ 
                //if refresh token expires
                removeItem(KEY_ACCESS_TOKEN);
                window.location.replace('/login','_self');
                return Promise.reject(error)
            }
        }

        return Promise.reject(error);
    },
    async(error) => {
        store.dispatch(setLoading(false));
        store.dispatch(showToast({
            type: TOAST_FAILURE,
            message: error
        }))
        return Promise.reject(error);
    }
);