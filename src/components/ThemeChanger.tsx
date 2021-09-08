import {IconButton, Tooltip} from '@material-ui/core';
import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import browser from 'webextension-polyfill';
import {getChangeThemeAction, State} from '../redux';
import {
  Brightness3 as Brightness3Icon,
  Brightness5 as Brightness5Icon,
} from '@material-ui/icons';

export const ThemeChanger = () => {
  const themetype =
    useSelector<State, 'dark' | 'light'>((state)=>state.themetype);
  const dispatch = useDispatch();
  return (
    <Tooltip title={
      themetype === 'dark' ?
        browser.i18n.getMessage('Switch2Light') :
        browser.i18n.getMessage('Switch2Dark')
    }>
      <IconButton color='inherit'
        onClick={()=>{
          if (themetype === 'dark') {
            dispatch(getChangeThemeAction('light'));
          } else {
            dispatch(getChangeThemeAction('dark'));
          }
        }}>
        {themetype === 'dark' ? <Brightness3Icon /> : <Brightness5Icon />}
      </IconButton>
    </Tooltip>
  );
};
