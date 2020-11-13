import moment from 'moment';
import { Mock } from 'ts-mockery';
import reducer, {
  EDIT_SHORT_URL_META_START,
  EDIT_SHORT_URL_META_ERROR,
  SHORT_URL_META_EDITED,
  RESET_EDIT_SHORT_URL_META,
  editShortUrlMeta,
  resetShortUrlMeta,
} from '../../../src/short-urls/reducers/shortUrlMeta';
import { ShlinkState } from '../../../src/container/types';

describe('shortUrlMetaReducer', () => {
  const meta = {
    maxVisits: 50,
    startDate: moment('2020-01-01').format(),
  };
  const shortCode = 'abc123';

  describe('reducer', () => {
    it('returns loading on EDIT_SHORT_URL_META_START', () => {
      expect(reducer(undefined, { type: EDIT_SHORT_URL_META_START } as any)).toEqual({
        meta: {},
        shortCode: null,
        saving: true,
        error: false,
      });
    });

    it('returns error on EDIT_SHORT_URL_META_ERROR', () => {
      expect(reducer(undefined, { type: EDIT_SHORT_URL_META_ERROR } as any)).toEqual({
        meta: {},
        shortCode: null,
        saving: false,
        error: true,
      });
    });

    it('returns provided tags and shortCode on SHORT_URL_META_EDITED', () => {
      expect(reducer(undefined, { type: SHORT_URL_META_EDITED, meta, shortCode } as any)).toEqual({
        meta,
        shortCode,
        saving: false,
        error: false,
      });
    });

    it('goes back to initial state on RESET_EDIT_SHORT_URL_META', () => {
      expect(reducer(undefined, { type: RESET_EDIT_SHORT_URL_META } as any)).toEqual({
        meta: {},
        shortCode: null,
        saving: false,
        error: false,
      });
    });
  });

  describe('editShortUrlMeta', () => {
    const updateShortUrlMeta = jest.fn().mockResolvedValue({});
    const buildShlinkApiClient = jest.fn().mockReturnValue({ updateShortUrlMeta });
    const dispatch = jest.fn();
    const getState = () => Mock.all<ShlinkState>();

    afterEach(jest.clearAllMocks);

    it.each([[ undefined ], [ null ], [ 'example.com' ]])('dispatches metadata on success', async (domain) => {
      await editShortUrlMeta(buildShlinkApiClient)(shortCode, domain, meta)(dispatch, getState);

      expect(buildShlinkApiClient).toHaveBeenCalledTimes(1);
      expect(updateShortUrlMeta).toHaveBeenCalledTimes(1);
      expect(updateShortUrlMeta).toHaveBeenCalledWith(shortCode, domain, meta);
      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenNthCalledWith(1, { type: EDIT_SHORT_URL_META_START });
      expect(dispatch).toHaveBeenNthCalledWith(2, { type: SHORT_URL_META_EDITED, meta, shortCode, domain });
    });

    it('dispatches error on failure', async () => {
      const error = new Error();

      updateShortUrlMeta.mockRejectedValue(error);

      try {
        await editShortUrlMeta(buildShlinkApiClient)(shortCode, undefined, meta)(dispatch, getState);
      } catch (e) {
        expect(e).toBe(error);
      }

      expect(buildShlinkApiClient).toHaveBeenCalledTimes(1);
      expect(updateShortUrlMeta).toHaveBeenCalledTimes(1);
      expect(updateShortUrlMeta).toHaveBeenCalledWith(shortCode, undefined, meta);
      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenNthCalledWith(1, { type: EDIT_SHORT_URL_META_START });
      expect(dispatch).toHaveBeenNthCalledWith(2, { type: EDIT_SHORT_URL_META_ERROR });
    });
  });

  describe('resetShortUrlMeta', () => {
    it('creates expected action', () => expect(resetShortUrlMeta()).toEqual({ type: RESET_EDIT_SHORT_URL_META }));
  });
});
