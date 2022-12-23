import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import useAxiosGet from '../../../hooks/useAxiosGet';
import useAxiosSend from '../../../hooks/useAxiosSend';
import { isDomainValid, isNameValid } from '../../../helpers/form-validation';
import { newId } from '../../../App';
import { buildMethodsList } from './methods';

import { Typography } from '@mui/material';

import ApiError from '../../UI/Api/ApiError';
import ApiLoading from '../../UI/Api/ApiLoading';
import Button from '../../UI/Button/Button';
import InputSelect from '../../UI/FormMui/InputSelect';
import Form from '../../UI/FormMui/Form';
import FormContainer from '../../UI/FormMui/FormContainer';
import FormError from '../../UI/FormMui/FormError';
import FormFooter from '../../UI/FormMui/FormFooter';
import InputTextArray from '../../UI/FormMui/InputTextArray';
import InputTextField from '../../UI/FormMui/InputTextField';
import TitleBar from '../../UI/TitleBar/TitleBar';

const AddOneCert = () => {
  // fetch valid options (for private keys this is the algorithms list)
  const [apiGetState] = useAxiosGet(
    `/v1/certificates/${newId}`,
    'certificate_options',
    true
  );

  const [apiSendState, sendData] = useAxiosSend();
  const navigate = useNavigate();

  const blankFormState = {
    form: {
      name: '',
      description: '',
      private_key_id: '',
      acme_account_id: '',
      challenge_method_value: '',
      subject: '',
      subject_alts: [],
      organization: '',
      organizational_unit: '',
      country: '',
      city: '',
    },
    validationErrors: {},
  };
  const [formState, setFormState] = useState(blankFormState);

  // data change handlers
  // string form field updates
  const stringInputChangeHandler = (event) => {
    setFormState((prevState) => {
      return {
        ...prevState,
        form: {
          ...prevState.form,
          [event.target.name]: event.target.value,
        },
      };
    });
  };

  // int form field updates
  const intInputChangeHandler = (event) => {
    setFormState((prevState) => {
      return {
        ...prevState,
        form: {
          ...prevState.form,
          [event.target.name]: parseInt(event.target.value),
        },
      };
    });
  };

  // button handlers
  const resetClickHandler = (event) => {
    event.preventDefault();
    setFormState(blankFormState);
  };
  const cancelClickHandler = (event) => {
    event.preventDefault();

    navigate(-1);
  };

  // form submission handler
  const submitFormHandler = (event) => {
    event.preventDefault();

    // form validation
    let validationErrors = [];
    // name
    if (!isNameValid(formState.form.name)) {
      validationErrors.name = true;
    }

    // check account is selected
    if (formState.form.acme_account_id === '') {
      validationErrors.acme_account_id = true;
    }

    // check private key is selected
    if (formState.form.private_key_id === '') {
      validationErrors.private_key_id = true;
    }

    // check challenge method is selected
    if (formState.form.challenge_method_value === '') {
      validationErrors.challenge_method_value = true;
    }

    // subject
    if (!isDomainValid(formState.form.subject)) {
      validationErrors.subject = true;
    }

    // subject alts (use an array to record which specific
    // alts are not valid)
    var subject_alts = [];
    formState.form.subject_alts.forEach((alt, i) => {
      if (!isDomainValid(alt)) {
        subject_alts.push(i);
      }
    });
    // if any alts invalid, create the error array
    if (subject_alts.length !== 0) {
      validationErrors.subject_alts = subject_alts;
    }
    //TODO: CSR validation?
    // form validation -- end

    setFormState((prevState) => ({
      ...prevState,
      validationErrors: validationErrors,
    }));
    if (Object.keys(validationErrors).length > 0) {
      return false;
    }
    //

    sendData(`/v1/certificates`, 'POST', formState.form, true).then(
      (response) => {
        if (response) {
          navigate(`/certificates/${response.record_id}`);
        }
      }
    );
  };

  // consts related to rendering
  const renderApiItems = apiGetState.isLoaded && !apiGetState.errorMessage;

  // vars related to api
  var availableAccounts;
  var availableKeys;
  var availableMethods;

  if (renderApiItems) {
    // build options for available accounts
    if (apiGetState?.certificate_options?.acme_accounts) {
      availableAccounts = apiGetState.certificate_options.acme_accounts.map(
        (a) => ({
          value: parseInt(a.id),
          name: a.name + (a.is_staging ? ' (Staging)' : ''),
        })
      );
    }
    // build options for available keys
    if (apiGetState?.certificate_options?.private_keys) {
      availableKeys = apiGetState.certificate_options.private_keys.map((k) => ({
        value: parseInt(k.id),
        name: k.name + ' (' + k.algorithm.name + ')',
      }));
    }
    // build options for challenge method
    if (apiGetState?.certificate_options?.challenge_methods) {
      availableMethods = buildMethodsList(
        apiGetState.certificate_options.challenge_methods
      );
    }
  }

  // vars related to api -- end

  return (
    <FormContainer>
      <TitleBar title='New Certificate' />

      {!apiGetState.isLoaded && <ApiLoading />}
      {apiGetState.errorMessage && (
        <ApiError>{apiGetState.errorMessage}</ApiError>
      )}

      {renderApiItems && (
        <Form onSubmit={submitFormHandler}>
          <InputTextField
            label='Name'
            id='name'
            value={formState.form.name}
            onChange={stringInputChangeHandler}
            error={formState.validationErrors.name && true}
          />

          <InputTextField
            label='Description'
            id='description'
            value={formState.form.description}
            onChange={stringInputChangeHandler}
          />

          <InputSelect
            label='ACME Account'
            id='acme_account_id'
            options={availableAccounts}
            value={formState.form.acme_account_id}
            onChange={intInputChangeHandler}
            error={formState.validationErrors.acme_account_id}
          />

          <InputSelect
            label='Private Key'
            id='private_key_id'
            options={availableKeys}
            value={formState.form.private_key_id}
            onChange={intInputChangeHandler}
            error={formState.validationErrors.private_key_id}
          />

          <InputSelect
            label='Challenge Method'
            id='challenge_method_value'
            options={availableMethods}
            value={formState.form.challenge_method_value}
            onChange={stringInputChangeHandler}
            error={formState.validationErrors.challenge_method_value}
          />

          <InputTextField
            label='Subject (and Common Name)'
            id='subject'
            value={formState.form.subject}
            onChange={stringInputChangeHandler}
            error={formState.validationErrors.subject}
          />

          <InputTextArray
            label='Subject Alternate Names'
            id='subject_alts'
            name='subject_alts'
            value={formState.form.subject_alts}
            onChange={stringInputChangeHandler}
            error={formState.validationErrors.subject_alts}
          />

          <Typography component='h3' variant='subtitle2' sx={{ m: 2 }}>
            CSR Fields
          </Typography>

          <InputTextField
            label='Country (2 Letter Code)'
            id='country'
            value={formState.form.country}
            onChange={stringInputChangeHandler}
          />

          <InputTextField
            label='City'
            id='city'
            value={formState.form.city}
            onChange={stringInputChangeHandler}
          />

          <InputTextField
            label='Organization'
            id='organization'
            value={formState.form.organization}
            onChange={stringInputChangeHandler}
          />

          <InputTextField
            label='Organizational Unit'
            id='organizational_unit'
            value={formState.form.organizational_unit}
            onChange={stringInputChangeHandler}
          />

          {apiSendState.errorMessage &&
            formState.validationErrors.length > 0 && (
              <FormError>
                Error Posting -- {apiSendState.errorMessage}
              </FormError>
            )}

          <FormFooter>
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
              disabled={apiSendState.isSending}
            >
              Reset
            </Button>
            <Button type='submit' disabled={apiSendState.isSending}>
              Submit
            </Button>
          </FormFooter>
        </Form>
      )}
    </FormContainer>
  );
};

export default AddOneCert;
