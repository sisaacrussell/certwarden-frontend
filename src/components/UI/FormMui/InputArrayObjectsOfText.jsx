import PropTypes from 'prop-types';
import fieldInformation from './fields-info';

import {
  Box,
  FormControl,
  FormHelperText,
  Toolbar,
  Typography,
} from '@mui/material';
import Button from '../Button/Button';
import InputTextField from './InputTextField';

// doesnt currently support numbers or other input types that need
// manipulation of the target.value (e.g. ParseInt) !

const InputArrayObjectsOfText = (props) => {
  // destructure props
  const {
    error,
    id,
    label,
    minElements,
    name,
    newObject,
    onChange,
    subLabel,
    value,
  } = props;

  // get field info
  const { errorMessage } = fieldInformation(name || id);

  // add an additional field to the array
  const addElementHandler = (event) => {
    event.preventDefault();

    let newArray = [...value];
    newArray.push(newObject);

    const syntheticEvent = {
      target: {
        name: name || id,
        value: newArray,
      },
    };

    onChange(syntheticEvent);
  };

  // remove the field with specified index from the array
  const removeElementHandler = (event, index) => {
    event.preventDefault();

    let newArray = [...value];
    newArray.splice(index, 1);

    const syntheticEvent = {
      target: {
        name: name || id,
        value: newArray,
      },
    };

    onChange(syntheticEvent);
  };

  // handle field value updates
  const fieldChangeHandler = (event) => {
    let newArray = [...value];

    // get element index (id is in format ID-Index-MemberField)
    const splitTargetId = event.target.id.split('-');
    const elementIndex = splitTargetId[1];
    const elementKeyName = splitTargetId[2];

    // update element's key
    newArray[elementIndex] = {
      ...value[elementIndex],
      [elementKeyName]: event.target.value,
    };

    const syntheticEvent = {
      target: {
        name: name || id,
        value: newArray,
      },
    };

    onChange(syntheticEvent);
  };

  return (
    <FormControl id={id} fullWidth sx={{ my: 1 }}>
      <Typography id={`${id}-label`} component='label' sx={{ mx: 1, mt: 1 }}>
        {label}
      </Typography>

      {value.length <= 0 ? (
        <Typography sx={{ m: 1 }}>None</Typography>
      ) : (
        value.map((subValue, i) => (
          <Box
            key={`${id}.${i}`}
            sx={{
              mt: 1,
              p: 1,
              border: 1,
              borderRadius: '4px',
              borderColor: error?.includes(i) ? 'rgb(244, 67, 54)' : 'grey.800',
            }}
          >
            <Toolbar
              variant='dense'
              disableGutters
              sx={{
                mb: 1,
                color: error?.includes(i) ? 'rgb(244, 67, 54)' : undefined,
              }}
            >
              <Typography id={id + '-' + i} sx={{ mb: 1 }}>
                {subLabel + ' ' + parseInt(i + 1)}
              </Typography>

              <Box sx={{ flexGrow: 1 }}></Box>

              {value.length > (minElements || 0) && (
                <Button
                  type='delete'
                  size='small'
                  onClick={(event) => removeElementHandler(event, i)}
                >
                  Remove
                </Button>
              )}
            </Toolbar>

            <Box>
              {/* Output a field for each member of object */}
              {Object.entries(subValue).map((member) => {
                const [key, value] = member;

                // make key pretty
                const words = key.split('_');
                for (let i = 0; i < words.length; i++) {
                  words[i] = words[i][0].toUpperCase() + words[i].substring(1);
                }
                const keyPretty = words.join(' ');

                return (
                  <InputTextField
                    key={`${id}.${i}.${key}`}
                    id={id + '-' + i + '-' + key}
                    label={keyPretty}
                    value={value}
                    onChange={fieldChangeHandler}
                  />
                );
              })}
            </Box>

            {!!error?.includes(i) && (
              <FormHelperText error>{errorMessage}</FormHelperText>
            )}
          </Box>
        ))
      )}

      <Toolbar variant='dense' disableGutters sx={{ m: 0, p: 0 }}>
        <Button type='add' size='small' onClick={addElementHandler}>
          Add
        </Button>
      </Toolbar>
    </FormControl>
  );
};

InputArrayObjectsOfText.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string,
  label: PropTypes.string.isRequired,
  subLabel: PropTypes.string.isRequired,
  minElements: PropTypes.number,
  newObject: PropTypes.object.isRequired,
  value: PropTypes.arrayOf(PropTypes.PropTypes.object).isRequired,
  onChange: PropTypes.func,
  error: PropTypes.arrayOf(PropTypes.number),
};

export default InputArrayObjectsOfText;
