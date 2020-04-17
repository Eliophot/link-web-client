import { faCaretDown as caretDownIcon, faCaretUp as caretUpIcon } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { head, isEmpty, keys, values } from 'ramda';
import React from 'react';
import qs from 'qs';
import PropTypes from 'prop-types';
import { EventSourcePolyfill as EventSource } from 'event-source-polyfill';
import { serverType } from '../servers/prop-types';
import SortingDropdown from '../utils/SortingDropdown';
import { determineOrderDir } from '../utils/utils';
import { MercureInfoType } from '../mercure/reducers/mercureInfo';
import { shortUrlType } from './reducers/shortUrlsList';
import { shortUrlsListParamsType } from './reducers/shortUrlsListParams';
import './ShortUrlsList.scss';

export const SORTABLE_FIELDS = {
  dateCreated: 'Created at',
  shortCode: 'Short URL',
  longUrl: 'Long URL',
  visits: 'Visits',
};

// FIXME Replace with typescript: (ShortUrlsRow component)
const ShortUrlsList = (ShortUrlsRow) => class ShortUrlsList extends React.Component {
  static propTypes = {
    listShortUrls: PropTypes.func,
    resetShortUrlParams: PropTypes.func,
    shortUrlsListParams: shortUrlsListParamsType,
    match: PropTypes.object,
    location: PropTypes.object,
    loading: PropTypes.bool,
    error: PropTypes.bool,
    shortUrlsList: PropTypes.arrayOf(shortUrlType),
    selectedServer: serverType,
    createNewVisit: PropTypes.func,
    mercureInfo: MercureInfoType,
  };

  refreshList = (extraParams) => {
    const { listShortUrls, shortUrlsListParams } = this.props;

    listShortUrls({
      ...shortUrlsListParams,
      ...extraParams,
    });
  };

  handleOrderBy = (orderField, orderDir) => {
    this.setState({ orderField, orderDir });
    this.refreshList({ orderBy: { [orderField]: orderDir } });
  };

  orderByColumn = (columnName) => () =>
    this.handleOrderBy(columnName, determineOrderDir(columnName, this.state.orderField, this.state.orderDir));

  renderOrderIcon = (field) => {
    if (this.state.orderField !== field) {
      return null;
    }

    if (!this.state.orderDir) {
      return null;
    }

    return (
      <FontAwesomeIcon
        icon={this.state.orderDir === 'ASC' ? caretUpIcon : caretDownIcon}
        className="short-urls-list__header-icon"
      />
    );
  };

  constructor(props) {
    super(props);

    const { orderBy } = props.shortUrlsListParams;

    this.state = {
      orderField: orderBy ? head(keys(orderBy)) : undefined,
      orderDir: orderBy ? head(values(orderBy)) : undefined,
    };
  }

  componentDidMount() {
    const { match: { params }, location, shortUrlsListParams } = this.props;
    const query = qs.parse(location.search, { ignoreQueryPrefix: true });
    const tags = query.tag ? [ query.tag ] : shortUrlsListParams.tags;

    this.refreshList({ page: params.page, tags });
  }

  componentDidUpdate() {
    const { mercureHubUrl, token, loading, error } = this.props.mercureInfo;

    if (loading || error) {
      return;
    }

    const hubUrl = new URL(mercureHubUrl);

    hubUrl.searchParams.append('topic', 'https://shlink.io/new-visit');
    this.closeEventSource();
    this.es = new EventSource(hubUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    this.es.onmessage = ({ data }) => this.props.createNewVisit(JSON.parse(data));
  }

  componentWillUnmount() {
    const { resetShortUrlParams } = this.props;

    this.closeEventSource();
    resetShortUrlParams();
  }

  closeEventSource = () => {
    if (this.es) {
      this.es.close();
      this.es = undefined;
    }
  }

  renderShortUrls() {
    const { shortUrlsList, selectedServer, loading, error, shortUrlsListParams } = this.props;

    if (error) {
      return (
        <tr>
          <td colSpan="6" className="text-center table-danger">Something went wrong while loading short URLs :(</td>
        </tr>
      );
    }

    if (loading) {
      return <tr><td colSpan="6" className="text-center">Loading...</td></tr>;
    }

    if (!loading && isEmpty(shortUrlsList)) {
      return <tr><td colSpan="6" className="text-center">No results found</td></tr>;
    }

    return shortUrlsList.map((shortUrl) => (
      <ShortUrlsRow
        key={shortUrl.shortUrl}
        shortUrl={shortUrl}
        selectedServer={selectedServer}
        refreshList={this.refreshList}
        shortUrlsListParams={shortUrlsListParams}
      />
    ));
  }

  render() {
    return (
      <React.Fragment>
        <div className="d-block d-md-none mb-3">
          <SortingDropdown
            items={SORTABLE_FIELDS}
            orderField={this.state.orderField}
            orderDir={this.state.orderDir}
            onChange={this.handleOrderBy}
          />
        </div>
        <table className="table table-striped table-hover">
          <thead className="short-urls-list__header">
            <tr>
              <th
                className="short-urls-list__header-cell short-urls-list__header-cell--with-action"
                onClick={this.orderByColumn('dateCreated')}
              >
                {this.renderOrderIcon('dateCreated')}
                Created at
              </th>
              <th
                className="short-urls-list__header-cell short-urls-list__header-cell--with-action"
                onClick={this.orderByColumn('shortCode')}
              >
                {this.renderOrderIcon('shortCode')}
                Short URL
              </th>
              <th
                className="short-urls-list__header-cell short-urls-list__header-cell--with-action"
                onClick={this.orderByColumn('longUrl')}
              >
                {this.renderOrderIcon('longUrl')}
                Long URL
              </th>
              <th className="short-urls-list__header-cell">Tags</th>
              <th
                className="short-urls-list__header-cell short-urls-list__header-cell--with-action"
                onClick={this.orderByColumn('visits')}
              >
                <span className="indivisible">{this.renderOrderIcon('visits')} Visits</span>
              </th>
              <th className="short-urls-list__header-cell">&nbsp;</th>
            </tr>
          </thead>
          <tbody>
            {this.renderShortUrls()}
          </tbody>
        </table>
      </React.Fragment>
    );
  }
};

export default ShortUrlsList;
