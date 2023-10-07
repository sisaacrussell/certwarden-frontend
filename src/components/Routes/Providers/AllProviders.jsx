import useAxiosGet from '../../../hooks/useAxiosGet';

import ApiLoading from '../../UI/Api/ApiLoading';
import ApiError from '../../UI/Api/ApiError';
import GridContainer from '../../UI/Grid/GridContainer';
import GridItemThird from '../../UI/Grid/GridItemThird';
import TitleBar from '../../UI/TitleBar/TitleBar';
import ViewOneProvider from './OneProvider/ViewOneProvider';

const AllProviders = () => {
  const [apiGetState] = useAxiosGet(
    '/v1/app/challenges/providers/services',
    'providers',
    true
  );

  // once loaded, sort providers array
  if (apiGetState.isLoaded === true && apiGetState?.providers?.length > 0) {
    apiGetState?.providers?.sort((a, b) => {
      // sort by type first
      if (a.type < b.type) {
        return -1;
      }
      if (b.type < a.type) {
        return 1;
      }

      // if type ===, then sort by id
      return a.id - b.id;
    });
  }

  return (
    <>
      <TitleBar title='Providers'></TitleBar>
      {!apiGetState.isLoaded && <ApiLoading />}
      {apiGetState.errorMessage && (
        <ApiError
          code={apiGetState.errorCode}
          message={apiGetState.errorMessage}
        />
      )}
      {apiGetState.isLoaded && !apiGetState.errorMessage && (
        <GridContainer>
          {apiGetState?.providers?.length > 0 &&
            apiGetState.providers.map((p) => (
              <GridItemThird key={p.id}>
                <ViewOneProvider provider={p} />
              </GridItemThird>
            ))}
        </GridContainer>
      )}
    </>
  );
};

export default AllProviders;
