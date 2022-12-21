import { Button as ButtonMui } from '@mui/material';

const Button = (props) => {
  var color = '';

  switch (props.type) {
    case 'submit':
      color = 'primary';
      break;
    case 'deactivate':
      color = 'warning';
      break;
    case 'delete':
      color = 'error';
      break;
    case 'info':
    case 'reset':
      color = 'info';
      break;
    case 'secondary':
    case 'cancel':
      color = 'secondary';
      break;

    default:
      color = 'primary';
      break;
  }

  return (
    <ButtonMui
      type={props.type}
      variant='contained'
      onClick={props.onClick}
      disabled={props.disabled}
      sx={{
        ml: 2,
      }}
      color={color}
    >
      {props.children}
    </ButtonMui>
  );
};

export default Button;
