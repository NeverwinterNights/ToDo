import React, { ChangeEvent, KeyboardEvent, useState } from 'react';
import TextField from '@mui/material/TextField';
import {RequestStatusType} from "../../app/app-reducer";

type EditableSpanPropsType = {
    value: string
    onChange: (newValue: string) => void
    entityStatus:RequestStatusType

}

export const EditableSpan = React.memo(function (props: EditableSpanPropsType) {
    console.log('EditableSpan called');
    let [editMode, setEditMode] = useState(false);
    let [title, setTitle] = useState(props.value);

    const activateEditMode = () => {
        setEditMode(true);
        setTitle(props.value);
    }
    const activateViewMode = () => {
        setEditMode(false);
        props.onChange(title);
    }
    const changeTitle = (e: ChangeEvent<HTMLInputElement>) => {
        setTitle(e.currentTarget.value)
    }



    const onKeyPressTitle = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.charCode === 13) {
            activateViewMode ()
        }
    }



    return editMode && props.entityStatus!=="loading"
        ? <TextField onKeyPress={onKeyPressTitle} value={title} onChange={changeTitle} autoFocus onBlur={activateViewMode} />
        : <span onDoubleClick={activateEditMode}>{props.value}</span>
});
