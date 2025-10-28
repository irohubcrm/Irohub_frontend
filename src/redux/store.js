import { configureStore } from "@reduxjs/toolkit";
import authslice from "./authSlice";
import modalslice from "./modalSlice";
import settingsmodalslice from "./settingsmodalSlice";
import passwordmodalSlice from "./passwordmodalSlice";
import createadminmodalslice from "./createadminmodalSlice";




export const store = configureStore({
    reducer: {
        auth: authslice,
        modal: modalslice,
        settingsmodal: settingsmodalslice,
        passwordmodal: passwordmodalSlice,
        createadminmodal: createadminmodalslice,
       
    }
});
