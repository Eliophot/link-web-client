import { fromPartial } from '@total-typescript/shoehorn';
import type { ShlinkApiClient } from '../../../src/api/services/ShlinkApiClient';
import type { ShlinkDomainRedirects } from '../../../src/api/types';
import { editDomainRedirects } from '../../../src/domains/reducers/domainRedirects';

describe('domainRedirectsReducer', () => {
  beforeEach(jest.clearAllMocks);

  describe('editDomainRedirects', () => {
    const domain = 'example.com';
    const redirects = fromPartial<ShlinkDomainRedirects>({});
    const dispatch = jest.fn();
    const getState = jest.fn();
    const editDomainRedirectsCall = jest.fn();
    const buildShlinkApiClient = () => fromPartial<ShlinkApiClient>({ editDomainRedirects: editDomainRedirectsCall });
    const editDomainRedirectsAction = editDomainRedirects(buildShlinkApiClient);

    it('dispatches domain and redirects once loaded', async () => {
      editDomainRedirectsCall.mockResolvedValue(redirects);

      await editDomainRedirectsAction(fromPartial({ domain }))(dispatch, getState, {});

      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenLastCalledWith(expect.objectContaining({
        payload: { domain, redirects },
      }));
      expect(editDomainRedirectsCall).toHaveBeenCalledTimes(1);
    });
  });
});
