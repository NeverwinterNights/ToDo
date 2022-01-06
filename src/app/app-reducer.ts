import {Dispatch} from "redux";
import {authAPI} from "../api/todolists-api";
import {setIsLoggedInAC} from "../Login/authReducer";
import {createSlice, PayloadAction} from "@reduxjs/toolkit";

const initialState: InitialStateType = {
    status: 'idle',
    error: null,
    isInitialized: false
}

const slice = createSlice({
    name: "app",
    initialState: initialState,
    reducers: {
        setAppStatusAC(state, action: PayloadAction<{ status: RequestStatusType }>) {
            state.status = action.payload.status
        },
        setAppErrorAC(state, action: PayloadAction<{ error: string | null }>) {
            state.error = action.payload.error
        },
        SetInitializedAC(state, action: PayloadAction<{ isInitialized: boolean }>) {
            state.isInitialized = action.payload.isInitialized
        },
    }
})


export const appReducer = slice.reducer


// export const appReducer = (state: InitialStateType = initialState, action: ActionsType): InitialStateType => {
//     switch (action.type) {
//         case 'APP/SET-STATUS':
//             return {...state, status: action.payload.status}
//         case 'APP/SET-ERROR':
//             return {...state, error: action.payload.error}
//         case "APP/SET-INITIALIZED": {
//             return {...state, isInitialized: action.payload.isInitialized}
//         }
//         default:
//             return state
//     }
// }

export type RequestStatusType = 'idle' | 'loading' | 'succeeded' | 'failed'
export type InitialStateType = {
    // происходит ли сейчас взаимодействие с сервером
    status: RequestStatusType
    // если ошибка какая-то глобальная произойдёт - мы запишем текст ошибки сюда
    error: string | null
    isInitialized: boolean
}

// export const setAppErrorAC = (error: string | null) => ({type: 'APP/SET-ERROR', error} as const)
// export const setAppStatusAC = (status: RequestStatusType) => ({type: 'APP/SET-STATUS', status} as const)
// export const SetInitializedAC = (isInitialized: boolean) => ({
//     type: 'APP/SET-INITIALIZED',
//     isInitialized
// } as const)

// export const setAppErrorAC = slice.actions.setAppErrorAC
// export const setAppStatusAC = slice.actions.setAppStatusAC
// export const SetInitializedAC = slice.actions.SetInitializedAC

export const {setAppErrorAC, setAppStatusAC, SetInitializedAC} = slice.actions

export type SetAppErrorActionType = ReturnType<typeof setAppErrorAC>
export type SetAppStatusActionType = ReturnType<typeof setAppStatusAC>
export type SetInitializedAppActionType = ReturnType<typeof SetInitializedAC>

type ActionsType =
    | SetAppErrorActionType
    | SetAppStatusActionType
    | SetInitializedAppActionType


export const initializeAppTC = () => (dispatch: Dispatch) => {

    authAPI.me().then(res => {

        if (res.data.resultCode === 0) {
            dispatch(setIsLoggedInAC({value: true}));
        }
    })
        .finally(() => {
            dispatch(SetInitializedAC({isInitialized: true}))
        })
}

