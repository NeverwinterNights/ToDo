import {
    addTodolistAC,
    AddTodolistActionType,
    ChangeTodolistActionType,
    changeTodolistEntityStatusAC, removeTodolistAC,
    RemoveTodolistActionType, setTodolistsAC,
    SetTodolistsActionType
} from './todolists-reducer'
import {
    TaskPriorities,
    TaskStatuses,
    TaskType,
    todolistsAPI, TodolistType,
    UpdateTaskModelType
} from '../../api/todolists-api'
import {Dispatch} from 'redux'
import {AppRootStateType} from '../../app/store'
import {
    RequestStatusType,
    setAppErrorAC,
    SetAppErrorActionType,
    setAppStatusAC,
    SetAppStatusActionType
} from '../../app/app-reducer'
import {AxiosError} from "axios";
import {createSlice, PayloadAction} from "@reduxjs/toolkit";

const initialState: TasksStateType = {}

const slice = createSlice({
    name: "tasks",
    initialState: initialState,
    reducers: {
        removeTaskAC(state, action: PayloadAction<{ taskId: string, todolistId: string }>) {
            const tasks = state[action.payload.todolistId]
            const index = tasks.findIndex(t => t.id === action.payload.taskId)
            if (index > -1) {
                tasks.splice(index, 1)
            }
        },
        addTaskAC(state, action: PayloadAction<{ task: TaskType }>) {
            state[action.payload.task.todoListId].unshift({
                ...action.payload.task,
                entityStatus: "idle"
            })
        },
        updateTaskAC(state, action: PayloadAction<{ taskId: string, model: UpdateDomainTaskModelType, todolistId: string }>) {
            const tasks = state[action.payload.todolistId]
            const index = tasks.findIndex(t => t.id === action.payload.taskId)
            if (index > -1) {
                tasks[index] = {...tasks[index], ...action.payload.model}
            }
        },
        setTasksAC(state, action: PayloadAction<{ tasks: Array<TaskType>, todolistId: string }>) {
            state[action.payload.todolistId] = action.payload.tasks.map(task => ({
                ...task,
                entityStatus: "idle"
            }))
        },
        changeTaskEntityStatusAC(state, action: PayloadAction<{ todolistId: string, taskId: string, entityStatus: RequestStatusType }>) {
            state[action.payload.todolistId] = state[action.payload.todolistId].map(task => task.id === action.payload.taskId ? {
                ...task,
                entityStatus: action.payload.entityStatus
            } : task)
        },
    },
    extraReducers: (builder) => {
        builder.addCase(addTodolistAC, (state, action) => {
            state[action.payload.todolist.id] = []
        })
        builder.addCase(removeTodolistAC, (state, action) => {
            delete state[action.payload.id]
        })
        builder.addCase(setTodolistsAC, (state, action) => {
            action.payload.todolists.forEach(todolist => {
                 state[todolist.id] = []
            })
        })
    }

})
export const tasksReducer = slice.reducer
export const {
    removeTaskAC,
    addTaskAC,
    updateTaskAC,
    setTasksAC,
    changeTaskEntityStatusAC
} = slice.actions

// export const tasksReducer = (state: TasksStateType = initialState, action: ActionsType): TasksStateType => {
//     switch (action.type) {
//         case 'REMOVE-TASK':
//             return {
//                 ...state,
//                 [action.todolistId]: state[action.todolistId].filter(t => t.id !== action.taskId)
//             }
//         case 'ADD-TASK':
//             return {
//                 ...state,
//                 [action.task.todoListId]: [{
//                     ...action.task,
//                     entityStatus: "idle"
//                 }, ...state[action.task.todoListId]]
//             }
//         case 'UPDATE-TASK':
//             return {
//                 ...state,
//                 [action.todolistId]: state[action.todolistId]
//                     .map(t => t.id === action.taskId ? {...t, ...action.model} : t)
//             }
//         case 'ADD-TODOLIST':
//             return {...state, [action.todolist.id]: []}
//         case 'REMOVE-TODOLIST':
//             const copyState = {...state}
//             delete copyState[action.id]
//             return copyState
//         case 'SET-TODOLISTS': {
//             const copyState = {...state}
//             action.todolists.forEach(tl => {
//                 copyState[tl.id] = []
//             })
//             return copyState
//         }
//         case 'SET-TASKS': {
//             return {
//                 ...state,
//                 [action.todolistId]: action.tasks.map(task => ({
//                     ...task,
//                     entityStatus: "idle"
//                 }))
//             }
//         }
//         case "DISABLED-TASK-STATUS": {
//             return {
//                 ...state,
//                 [action.todolistId]: state[action.todolistId].map(t => t.id === action.taskId ? {
//                     ...t,
//                     entityStatus: action.entityStatus
//                 } : t)
//             }
//         }
//
//         default:
//             return state
//     }
// }

// actions
// export const removeTaskAC = (taskId: string, todolistId: string) => ({
//     type: 'REMOVE-TASK',
//     taskId,
//     todolistId
// } as const)
// export const addTaskAC = (task: TaskType) => ({type: 'ADD-TASK', task} as const)
// export const updateTaskAC = (taskId: string, model: UpdateDomainTaskModelType, todolistId: string) => ({
//     type: 'UPDATE-TASK',
//     model,
//     todolistId,
//     taskId
// } as const)
// export const setTasksAC = (tasks: Array<TaskType>, todolistId: string) => ({
//     type: 'SET-TASKS',
//     tasks,
//     todolistId
// } as const)
//
//
// export const changeTaskEntityStatusAC = (todolistId: string, taskId: string, entityStatus: RequestStatusType) => ({
//     type: 'DISABLED-TASK-STATUS',
//     todolistId,
//     taskId,
//     entityStatus
// } as const)

// thunks
export const fetchTasksTC = (todolistId: string) => (dispatch: Dispatch<ActionsType>) => {
    dispatch(setAppStatusAC({status: 'loading'}))
    todolistsAPI.getTasks(todolistId)
        .then((res) => {
            const tasks = res.data.items
            const action = setTasksAC({tasks, todolistId})
            dispatch(action)
            dispatch(setAppStatusAC({status: 'succeeded'}))
        })
        .catch((res: AxiosError) => {
            dispatch(setAppErrorAC({error: res.message}))
            dispatch(setAppStatusAC({status: 'failed'}))
        })
}
export const removeTaskTC = (taskId: string, todolistId: string) => (dispatch: Dispatch<ActionsType>) => {
    dispatch(setAppStatusAC({status: 'loading'}))
    dispatch(changeTaskEntityStatusAC({
        taskId: taskId,
        todolistId: todolistId,
        entityStatus: "loading"
    }))
    todolistsAPI.deleteTask(todolistId, taskId)
        .then(res => {
            const action = removeTaskAC({taskId, todolistId})
            dispatch(action)
            dispatch(setAppStatusAC({status: 'succeeded'}))
        })
        .catch((res: AxiosError) => {
            dispatch(setAppErrorAC({error: res.message}))
            dispatch(setAppStatusAC({status: 'failed'}))
        })
        .finally(() => {
            dispatch(changeTaskEntityStatusAC({
                taskId,
                todolistId,
                entityStatus: "succeeded"
            }))
        })
}
export const addTaskTC = (title: string, todolistId: string) => (dispatch: Dispatch<ActionsType>) => {
    dispatch(changeTodolistEntityStatusAC({status: "loading", id: todolistId}))
    dispatch(setAppStatusAC({status: 'loading'}))
    todolistsAPI.createTask(todolistId, title)
        .then(res => {
            if (res.data.resultCode === 0) {
                dispatch(addTaskAC({task: res.data.data.item}))
                dispatch(setAppStatusAC({status: 'succeeded'}))
            } else {
                if (res.data.messages.length) {
                    dispatch(setAppErrorAC({error: res.data.messages[0]}))
                } else {
                    dispatch(setAppErrorAC({error: 'Some error occurred'}))
                }
                dispatch(setAppStatusAC({status: 'failed'}))
            }
        })
        .catch((res: AxiosError) => {
            dispatch(setAppErrorAC({error: res.message}))
            dispatch(setAppStatusAC({status: 'failed'}))
        })
        .finally(() => {
            dispatch(changeTodolistEntityStatusAC({status: "succeeded", id: todolistId}))
        })
}


export const updateTaskTC = (taskId: string, domainModel: UpdateDomainTaskModelType, todolistId: string) =>
    (dispatch: Dispatch<ActionsType>, getState: () => AppRootStateType) => {
        dispatch(changeTaskEntityStatusAC({taskId, entityStatus: "loading", todolistId}))
        const state = getState()
        const task = state.tasks[todolistId].find(t => t.id === taskId)
        if (!task) {
            //throw new Error("task not found in the state");
            console.warn('task not found in the state')
            return
        }

        const apiModel: UpdateTaskModelType = {
            deadline: task.deadline,
            description: task.description,
            priority: task.priority,
            startDate: task.startDate,
            title: task.title,
            status: task.status,
            ...domainModel
        }
        dispatch(setAppStatusAC({status: 'loading'}))
        todolistsAPI.updateTask(todolistId, taskId, apiModel)
            .then(res => {
                const action = updateTaskAC({taskId, todolistId, model: domainModel})
                dispatch(action)

                dispatch(setAppStatusAC({status: 'succeeded'}))
            })
            .catch((res: AxiosError) => {
                dispatch(setAppErrorAC({error: res.message}))
                dispatch(setAppStatusAC({status: 'failed'}))
            })
            .finally(() => {
                dispatch(changeTaskEntityStatusAC({
                    taskId,
                    todolistId,
                    entityStatus: "succeeded"
                }))
            })

    }

// types
export type UpdateDomainTaskModelType = {
    title?: string
    description?: string
    status?: TaskStatuses
    priority?: TaskPriorities
    startDate?: string
    deadline?: string
}
export type TasksStateType = {
    [key: string]: Array<TaskDomainType>
}
type ActionsType =
    | ReturnType<typeof removeTaskAC>
    | ReturnType<typeof addTaskAC>
    | ReturnType<typeof updateTaskAC>
    | ReturnType<typeof changeTaskEntityStatusAC>
    | AddTodolistActionType
    | RemoveTodolistActionType
    | SetAppStatusActionType
    | SetAppErrorActionType
    | SetTodolistsActionType
    | ReturnType<typeof setTasksAC>
    | ChangeTodolistActionType


type ThunkDispatch = Dispatch<ActionsType | SetAppStatusActionType | SetAppErrorActionType>


export type TaskDomainType = TaskType & {
    entityStatus: RequestStatusType
}
