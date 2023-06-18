import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import useAxiosGet from '../../../hooks/useAxiosGet';
import useAxiosSend from '../../../hooks/useAxiosSend';
import {
  isDirectoryUrlValid,
  isNameValid,
} from '../../../helpers/form-validation';

import { Typography } from '@mui/material';

import ApiError from '../../UI/Api/ApiError';
import ApiLoading from '../../UI/Api/ApiLoading';
import Button from '../../UI/Button/Button';
import DialogAlert from '../../UI/Dialog/DialogAlert';
import Form from '../../UI/FormMui/Form';
import FormContainer from '../../UI/FormMui/FormContainer';
import FormFooter from '../../UI/FormMui/FormFooter';
import InputCheckbox from '../../UI/FormMui/InputCheckbox';
import InputTextField from '../../UI/FormMui/InputTextField';
import TitleBar from '../../UI/TitleBar/TitleBar';

const EditOneACMEServer = () => {
  const { id } = useParams();
  const [apiGetState] = useAxiosGet(
    `/v1/acmeservers/${id}`,
    'acme_server',
    true
  );

  const [apiSendState, sendData] = useAxiosSend();
  const navigate = useNavigate();

  const [formState, setFormState] = useState({});

  // Function to set the form equal to the current API state
  const setFormToApi = useCallback(() => {
    setFormState({
      form: {
        name: apiGetState.acme_server.name,
        description: apiGetState.acme_server.description,
        directory_url: apiGetState.acme_server.directory_url,
        is_staging: apiGetState.acme_server.is_staging,
      },
      validationErrors: {},
    });
  }, [apiGetState]);

  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    if (apiGetState.isLoaded && !apiGetState.errorMessage) {
      setFormToApi();
    }
  }, [apiGetState, setFormToApi]);

  // data change handlers
  const inputChangeHandler = (event) => {
    setFormState((prevState) => ({
      ...prevState,
      form: {
        ...prevState.form,
        [event.target.name]: event.target.value,
      },
    }));
  };
  // checkbox updates
  const checkChangeHandler = (event) => {
    setFormState((prevState) => {
      return {
        ...prevState,
        form: {
          ...prevState.form,
          [event.target.name]: event.target.checked,
        },
      };
    });
  };

  // button handlers
  const resetClickHandler = (event) => {
    event.preventDefault();

    setFormToApi();
  };
  const cancelClickHandler = (event) => {
    event.preventDefault();

    navigate('/acmeservers');
  };

  // delete handlers
  const deleteClickHandler = () => {
    setDeleteOpen(true);
  };
  const deleteCancelHandler = () => {
    setDeleteOpen(false);
  };
  const deleteConfirmHandler = () => {
    setDeleteOpen(false);
    sendData(`/v1/acmeservers/${id}`, 'DELETE', null, true).then((response) => {
      if (response.status >= 200 && response.status <= 299) {
        navigate('/acmeservers');
      }
    });
  };

  // form submission handler
  const submitFormHandler = (event) => {
    event.preventDefault();

    // client side validation
    let validationErrors = {};
    // check name
    if (!isNameValid(formState.form.name)) {
      validationErrors.name = true;
    }

    // directory_url
    if (!isDirectoryUrlValid(formState.form.directory_url)) {
      validationErrors.directory_url = true;
    }

    setFormState((prevState) => ({
      ...prevState,
      validationErrors: validationErrors,
    }));
    if (Object.keys(validationErrors).length > 0) {
      return false;
    }
    // client side validation -- end

    sendData(`/v1/acmeservers/${id}`, 'PUT', formState.form, true).then(
      (response) => {
        if (response.status >= 200 && response.status <= 299) {
          // back to the acme servers page
          navigate('/acmeservers');
        }
      }
    );
  };

  // consts related to rendering
  // don't render if not loaded, error, or formState not yet set
  // formState set is needed to prevent animations of form fields
  // populating (when previously using a blank form object) or invalid
  // references to formState.form now that blank form object is gone
  const renderApiItems =
    apiGetState.isLoaded &&
    !apiGetState.errorMessage &&
    JSON.stringify({}) !== JSON.stringify(formState);

  var formUnchanged = true;
  if (renderApiItems) {
    formUnchanged =
      apiGetState.acme_server.name === formState.form.name &&
      apiGetState.acme_server.description === formState.form.description &&
      apiGetState.acme_server.directory_url === formState.form.directory_url &&
      apiGetState.acme_server.is_staging === formState.form.is_staging;
  }

  return (
    <FormContainer>
      <TitleBar title='Edit ACME Server'>
        {renderApiItems && (
          <>
            <Button
              type='delete'
              onClick={deleteClickHandler}
              disabled={apiSendState.isSending}
            >
              Delete
            </Button>
          </>
        )}
      </TitleBar>

      {!apiGetState.isLoaded && <ApiLoading />}
      {apiGetState.errorMessage && (
        <ApiError
          code={apiGetState.errorCode}
          message={apiGetState.errorMessage}
        />
      )}

      {renderApiItems && (
        <>
          <DialogAlert
            title={`Are you sure you want to delete ${formState.form.name}?`}
            open={deleteOpen}
            onCancel={deleteCancelHandler}
            onConfirm={deleteConfirmHandler}
          />

          <Form onSubmit={submitFormHandler}>
            <InputTextField
              label='Name'
              id='name'
              value={formState.form.name}
              onChange={inputChangeHandler}
              error={formState.validationErrors.name && true}
            />

            <InputTextField
              label='Description'
              id='description'
              value={formState.form.description}
              onChange={inputChangeHandler}
            />

            <Typography variant='subtitle2' sx={{ my: 2, px: 1, color: 'error.dark' }}>
              You should only update the Directory URL if your provider has
              actually changed it. If you are trying to change provider, create
              a new server instead.
            </Typography>

            <InputTextField
              label='Directory URL'
              id='directory_url'
              value={formState.form.directory_url}
              onChange={inputChangeHandler}
              error={formState.validationErrors.directory_url && true}
            />

            <InputCheckbox
              id='is_staging'
              checked={formState.form.is_staging}
              onChange={checkChangeHandler}
            >
              Staging Environment Server
            </InputCheckbox>

            {apiSendState.errorMessage &&
              Object.keys(formState.validationErrors).length <= 0 && (
                <ApiError
                  code={apiSendState.errorCode}
                  message={apiSendState.errorMessage}
                />
              )}

            <FormFooter
              createdAt={apiGetState.acme_server.created_at}
              updatedAt={apiGetState.acme_server.updated_at}
            >
              <Button
                type='cancel'
                onClick={cancelClickHandler}
                disabled={apiSendState.isSending}
              >
                Cancel
              </Button>
              <Button
                type='reset'
                onClick={resetClickHandler}
                disabled={apiSendState.isSending || formUnchanged}
              >
                Reset
              </Button>
              <Button
                type='submit'
                disabled={apiSendState.isSending || formUnchanged}
              >
                Submit
              </Button>
            </FormFooter>
          </Form>
        </>
      )}
    </FormContainer>
  );
};

export default EditOneACMEServer;
