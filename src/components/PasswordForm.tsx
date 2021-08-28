import {
  FormControl,
  IconButton,
  Input,
  InputAdornment,
  InputLabel} from '@material-ui/core';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon} from '@material-ui/icons';
import React, {useState} from 'react';
import {v4 as uuidv4} from 'uuid';

type props = {password :string, handleChange: (password:string)=> void };

export const PasswordForm =
  ({password, handleChange}: props) => {
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [id] = useState(()=> uuidv4());
    const handleClickShowPassword = () => {
      setShowPassword(!showPassword);
    };
    const handleMouseDownPassword =
      (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
      };
    return (
      <FormControl>
        <InputLabel htmlFor={id}>Password</InputLabel>
        <Input
          id={id}
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e)=>handleChange(e.target.value)}
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={handleClickShowPassword}
                onMouseDown={handleMouseDownPassword}
              >
                {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
              </IconButton>
            </InputAdornment>
          }
        />
      </FormControl>
    );
  };
