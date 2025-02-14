import { fromPartial } from '@total-typescript/shoehorn';
import type { ShlinkApiClient } from '../../../src/api/services/ShlinkApiClient';
import type { ShlinkState } from '../../../src/container/types';
import { tagDeleted, tagDeleteReducerCreator } from '../../../src/tags/reducers/tagDelete';

describe('tagDeleteReducer', () => {
  const deleteTagsCall = jest.fn();
  const buildShlinkApiClient = () => fromPartial<ShlinkApiClient>({ deleteTags: deleteTagsCall });
  const { reducer, deleteTag } = tagDeleteReducerCreator(buildShlinkApiClient);

  beforeEach(jest.clearAllMocks);

  describe('reducer', () => {
    it('returns loading on DELETE_TAG_START', () => {
      expect(reducer(undefined, deleteTag.pending('', ''))).toEqual({
        deleting: true,
        deleted: false,
        error: false,
      });
    });

    it('returns error on DELETE_TAG_ERROR', () => {
      expect(reducer(undefined, deleteTag.rejected(null, '', ''))).toEqual({
        deleting: false,
        deleted: false,
        error: true,
      });
    });

    it('returns tag names on DELETE_TAG', () => {
      expect(reducer(undefined, deleteTag.fulfilled(undefined, '', ''))).toEqual({
        deleting: false,
        deleted: true,
        error: false,
      });
    });
  });

  describe('tagDeleted', () => {
    it('returns action based on provided params', () => {
      expect(tagDeleted('foo').payload).toEqual('foo');
    });
  });

  describe('deleteTag', () => {
    const dispatch = jest.fn();
    const getState = () => fromPartial<ShlinkState>({});

    it('calls API on success', async () => {
      const tag = 'foo';
      deleteTagsCall.mockResolvedValue(undefined);

      await deleteTag(tag)(dispatch, getState, {});

      expect(deleteTagsCall).toHaveBeenCalledTimes(1);
      expect(deleteTagsCall).toHaveBeenNthCalledWith(1, [tag]);

      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenLastCalledWith(expect.objectContaining({ payload: undefined }));
    });
  });
});
