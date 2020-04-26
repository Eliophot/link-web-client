import React, { useEffect } from 'react';
import { splitEvery } from 'ramda';
import PropTypes from 'prop-types';
import Message from '../utils/Message';
import SearchField from '../utils/SearchField';

const { ceil } = Math;
const TAGS_GROUPS_AMOUNT = 4;

const propTypes = {
  filterTags: PropTypes.func,
  forceListTags: PropTypes.func,
  tagsList: PropTypes.shape({
    loading: PropTypes.bool,
    error: PropTypes.bool,
    filteredTags: PropTypes.arrayOf(PropTypes.string),
  }),
  match: PropTypes.object,
};

const TagsList = (TagCard) => {
  const TagListComp = ({ filterTags, forceListTags, tagsList, match }) => {
    useEffect(() => {
      forceListTags();
    }, []);

    const renderContent = () => {
      if (tagsList.loading) {
        return <Message noMargin loading />;
      }

      if (tagsList.error) {
        return (
          <div className="col-12">
            <div className="bg-danger p-2 text-white text-center">Error loading tags :(</div>
          </div>
        );
      }

      const tagsCount = tagsList.filteredTags.length;

      if (tagsCount < 1) {
        return <Message>No tags found</Message>;
      }

      const tagsGroups = splitEvery(ceil(tagsCount / TAGS_GROUPS_AMOUNT), tagsList.filteredTags);

      return (
        <React.Fragment>
          {tagsGroups.map((group, index) => (
            <div key={index} className="col-md-6 col-xl-3">
              {group.map((tag) => (
                <TagCard
                  key={tag}
                  tag={tag}
                  currentServerId={match.params.serverId}
                />
              ))}
            </div>
          ))}
        </React.Fragment>
      );
    };

    return (
      <React.Fragment>
        {!tagsList.loading && <SearchField className="mb-3" placeholder="Search tags..." onChange={filterTags} />}
        <div className="row">
          {renderContent()}
        </div>
      </React.Fragment>
    );
  };

  TagListComp.propTypes = propTypes;

  return TagListComp;
};

export default TagsList;
