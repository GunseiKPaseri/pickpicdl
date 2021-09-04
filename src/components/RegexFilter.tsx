import {IconButton, Input, InputAdornment} from '@material-ui/core';
import {FilterList as FilterListIcon} from '@material-ui/icons';
import {Icon} from '@iconify/react';
import regexIcon from '@iconify/icons-codicon/regex';
import React from 'react';
import {Column} from 'material-table';

const NormalMode = 'normal';
const RegexMode = 'regex';

type Mode = typeof NormalMode | typeof RegexMode;

type Props<RowData extends Object> = {
  onFilterChange: (rowId:string, value: any)=>void;
  columnDef: Column<RowData>
};
type FilterValue = {mode: Mode, value: string}

const regcache: {[keyof:string]: RegExp[]}={};
const regexFilter = (filterValue: string, value:string, mode: Mode) =>{
  switch (mode) {
    case RegexMode:
      if (!regcache[filterValue]) {
        regcache[filterValue] =
          filterValue
              .split(' ')
              .filter((x)=>x!=='')
              .flatMap((x)=>{
                try {
                  return [new RegExp(x)];
                } catch (e) {
                  return [];
                }
              });
      }
      return regcache[filterValue].every((x)=>x.test(value));
    default:
      return filterValue.split(' ')
          .filter((x)=>x!=='').every((x)=>value.indexOf(x)!==-1);
  }
};

export const regexFilterFunction = <RowData extends Object>
  (filterValue: FilterValue,
    rowData: {[key: string]: any},
    columnDef: Column<RowData>):boolean => {
  if (columnDef.field === undefined) return false;
  const value: string = rowData[columnDef.field as string];
  if (typeof value !== 'string') return false;
  return regexFilter(filterValue.value, value, filterValue.mode);
};

export const RegexFilter =
  <RowData extends Object>(props: Props<RowData>):JSX.Element => {
    const [mode, setMode] = React.useState<Mode>(NormalMode);
    const [value, setValue] = React.useState<string>('');
    const handleMouseDown = ()=>{
      const newMode = (mode === NormalMode ? RegexMode : NormalMode);
      setMode(newMode);
      props.onFilterChange(
          // @ts-ignore
          props.columnDef.tableData.id
          , {mode: newMode, value});
    };
    const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e)=>{
      setValue(e.target.value);
      props.onFilterChange(
          // @ts-ignore
          props.columnDef.tableData.id
          , {mode, value: e.target.value});
    };
    return (
      <Input
        onChange={handleChange}
        endAdornment={
          <InputAdornment position="end">
            <IconButton onMouseDown={handleMouseDown} value={value}>
              {mode === RegexMode ?
                <Icon icon={regexIcon} /> : <FilterListIcon />}
            </IconButton>
          </InputAdornment>
        }
      />
    );
  };
