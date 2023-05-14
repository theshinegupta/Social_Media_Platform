import  {configureStore} from '@reduxjs/toolkit' 
import appConfigReducer from './slices/appConfigSlice'
import postsReducer from './slices/postsSlice'
import feedDataReducer from './slices/feedSlice'


export const store=configureStore({
    reducer: {
        appConfigReducer,
        postsReducer,
        feedDataReducer
    }
   

})